/**
 * Install Missing Database Functions
 *
 * Drops and recreates functions that failed during migration
 */

const https = require('https');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!PROJECT_REF || !SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data || '[]'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const functionSteps = [
  {
    name: 'Drop existing functions',
    sql: `
DROP FUNCTION IF EXISTS search_brain_facts_vector CASCADE;
DROP FUNCTION IF EXISTS calculate_brain_confidence CASCADE;
DROP FUNCTION IF EXISTS update_brain_stats CASCADE;
DROP FUNCTION IF EXISTS update_brain_level CASCADE;
DROP FUNCTION IF EXISTS increment_fact_usage CASCADE;
    `
  },
  {
    name: 'search_brain_facts_vector',
    sql: `
CREATE FUNCTION search_brain_facts_vector(
  brain_id_param UUID,
  query_embedding VECTOR(1536),
  limit_count INTEGER DEFAULT 15,
  similarity_threshold REAL DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  fact_text TEXT,
  fact_type TEXT,
  category TEXT,
  confidence DECIMAL,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.id,
    bf.fact_text,
    bf.fact_type,
    bf.category,
    bf.confidence,
    1 - (bf.embedding <=> query_embedding) AS similarity
  FROM brain_facts bf
  WHERE
    bf.brain_id = brain_id_param
    AND bf.is_current = TRUE
    AND bf.embedding IS NOT NULL
    AND (1 - (bf.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY bf.embedding <=> query_embedding
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
    `
  },
  {
    name: 'calculate_brain_confidence',
    sql: `
CREATE FUNCTION calculate_brain_confidence(brain_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  fact_count INTEGER;
  verified_count INTEGER;
  avg_fact_confidence DECIMAL;
  sources_connected INTEGER;
  onboarding_complete BOOLEAN;
  final_score DECIMAL;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE verified = TRUE), AVG(confidence)
  INTO fact_count, verified_count, avg_fact_confidence
  FROM brain_facts
  WHERE brain_id = brain_id_param AND is_current = TRUE;

  SELECT COUNT(*) INTO sources_connected
  FROM knowledge_sources
  WHERE brain_id = brain_id_param AND is_connected = TRUE;

  SELECT onboarding_completed INTO onboarding_complete
  FROM business_brains
  WHERE id = brain_id_param;

  final_score := LEAST(1.0,
    (LEAST(fact_count::DECIMAL / 100, 1.0) * 0.3) +
    (COALESCE(avg_fact_confidence, 0) * 0.25) +
    (LEAST(verified_count::DECIMAL / 20, 1.0) * 0.2) +
    (LEAST(sources_connected::DECIMAL / 5, 1.0) * 0.15) +
    (CASE WHEN onboarding_complete THEN 0.10 ELSE 0 END)
  );

  RETURN ROUND(final_score::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;
    `
  },
  {
    name: 'update_brain_stats',
    sql: `
CREATE FUNCTION update_brain_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE business_brains
    SET
      total_facts = (SELECT COUNT(*) FROM brain_facts WHERE brain_id = NEW.brain_id AND is_current = TRUE),
      confidence_score = calculate_brain_confidence(NEW.brain_id),
      updated_at = NOW()
    WHERE id = NEW.brain_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE business_brains
    SET
      total_facts = (SELECT COUNT(*) FROM brain_facts WHERE brain_id = OLD.brain_id AND is_current = TRUE),
      confidence_score = calculate_brain_confidence(OLD.brain_id),
      updated_at = NOW()
    WHERE id = OLD.brain_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_brain_stats ON brain_facts;
CREATE TRIGGER trigger_update_brain_stats
  AFTER INSERT OR UPDATE OR DELETE ON brain_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_brain_stats();
    `
  },
  {
    name: 'update_brain_level',
    sql: `
CREATE FUNCTION update_brain_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confidence_score >= 0.80 THEN
    NEW.brain_level := 'expert';
  ELSIF NEW.confidence_score >= 0.50 THEN
    NEW.brain_level := 'enhanced';
  ELSE
    NEW.brain_level := 'starter';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_brain_level ON business_brains;
CREATE TRIGGER trigger_update_brain_level
  BEFORE UPDATE OF confidence_score ON business_brains
  FOR EACH ROW
  WHEN (OLD.confidence_score IS DISTINCT FROM NEW.confidence_score)
  EXECUTE FUNCTION update_brain_level();
    `
  },
  {
    name: 'Grant permissions',
    sql: `
GRANT EXECUTE ON FUNCTION search_brain_facts_vector TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_brain_confidence TO authenticated, service_role;
    `
  }
];

async function installFunctions() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  INSTALL MISSING DATABASE FUNCTIONS                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`📍 Project: ${PROJECT_REF}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const step of functionSteps) {
    console.log(`🔄 ${step.name}...`);

    try {
      await executeSQL(step.sql.trim());
      console.log(`✅ ${step.name} - Success\n`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${step.name} - Failed:`);
      console.error(`   ${err.message}\n`);
      errorCount++;
    }
  }

  console.log('═'.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}\n`);

  if (errorCount === 0) {
    console.log('🎉 All functions installed successfully!\n');
    return true;
  } else {
    console.log('⚠️  Some functions failed. Check errors above.\n');
    return false;
  }
}

installFunctions()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('\n💥 Installation failed:', err.message);
    process.exit(1);
  });
