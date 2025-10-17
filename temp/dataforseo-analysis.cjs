// DataForSEO API Analysis for disruptorsmedia.com
const https = require('https');

const username = 'will@disruptorsmedia.com';
const password = 'e1ea5e75ba659fe8';
const auth = Buffer.from(`${username}:${password}`).toString('base64');

// Function to make DataForSEO API requests
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.dataforseo.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function analyzeDomain() {
  console.log('🔍 Analyzing disruptorsmedia.com with DataForSEO...\n');

  try {
    // 1. Get domain overview and organic traffic
    console.log('📊 Fetching domain overview...');
    const overviewData = [{
      target: 'disruptorsmedia.com',
      language_name: 'English',
      location_code: 2840, // United States
      load_rank_absolute: true
    }];

    const overview = await makeRequest('/v3/dataforseo_labs/google/domain_metrics_by_categories/live', overviewData);

    if (overview.tasks && overview.tasks[0]) {
      const task = overview.tasks[0];
      if (task.result && task.result[0]) {
        const result = task.result[0];
        console.log('✅ Domain Overview:');
        console.log(`   - Organic Keywords: ${result.metrics?.organic?.count || 'N/A'}`);
        console.log(`   - Organic Traffic (est): ${result.metrics?.organic?.etv || 'N/A'}`);
        console.log(`   - Domain Rank: ${result.metrics?.organic?.rank_absolute || 'N/A'}`);
        console.log('');
      }
    }

    // 2. Get ranked keywords
    console.log('🔑 Fetching ranked keywords...');
    const keywordsData = [{
      target: 'disruptorsmedia.com',
      language_name: 'English',
      location_code: 2840,
      limit: 50,
      order_by: ['ranked_serp_element.serp_item.rank_group,asc']
    }];

    const keywords = await makeRequest('/v3/dataforseo_labs/google/ranked_keywords/live', keywordsData);

    if (keywords.tasks && keywords.tasks[0]) {
      const task = keywords.tasks[0];
      if (task.result && task.result[0] && task.result[0].items) {
        console.log(`✅ Top Ranked Keywords (${task.result[0].items.length} found):\n`);

        task.result[0].items.slice(0, 20).forEach((item, i) => {
          const keyword = item.keyword_data?.keyword || 'N/A';
          const volume = item.keyword_data?.keyword_info?.search_volume || 0;
          const position = item.ranked_serp_element?.serp_item?.rank_absolute || 'N/A';
          const traffic = item.ranked_serp_element?.serp_item?.etv || 0;

          console.log(`   ${i + 1}. "${keyword}"`);
          console.log(`      Position: #${position} | Volume: ${volume}/mo | Traffic Value: $${traffic}`);
        });
        console.log('');
      }
    }

    // 3. Get competitors
    console.log('🏆 Fetching competitors...');
    const competitorsData = [{
      target: 'disruptorsmedia.com',
      language_name: 'English',
      location_code: 2840,
      limit: 10
    }];

    const competitors = await makeRequest('/v3/dataforseo_labs/google/competitors_domain/live', competitorsData);

    if (competitors.tasks && competitors.tasks[0]) {
      const task = competitors.tasks[0];
      if (task.result && task.result[0] && task.result[0].items) {
        console.log(`✅ Top Competitors (${task.result[0].items.length} found):\n`);

        task.result[0].items.slice(0, 10).forEach((item, i) => {
          console.log(`   ${i + 1}. ${item.domain}`);
          console.log(`      Avg Position: #${item.avg_position?.toFixed(1) || 'N/A'}`);
          console.log(`      Common Keywords: ${item.intersections || 'N/A'}`);
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

// Run the analysis
analyzeDomain().then(() => {
  console.log('✅ Analysis complete!');
}).catch(err => {
  console.error('Fatal error:', err);
});
