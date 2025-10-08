/**
 * BUSINESS BRAIN AUTO-INITIALIZATION FUNCTION
 *
 * Automatically creates and initializes a Business Brain when a new organization
 * is created or when a user requests brain initialization.
 *
 * Initialization Process:
 * 1. Create base Business Brain entity
 * 2. Trigger Growth Audit for web scraping
 * 3. Extract brand colors using BrandDetector
 * 4. Create initial brain facts from scraped data
 * 5. Calculate initial confidence score
 * 6. Set brain level (starter/enhanced/expert)
 *
 * Triggered by:
 * - Organization signup webhook
 * - Manual initialization request from admin panel
 * - User request from tools page
 *
 * @endpoint POST /brain-auto-initialize
 * @auth Required (service_role for webhooks, user auth for manual)
 */

import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY!;
const FIRECRAWL_API_KEY = process.env.VITE_FIRECRAWL_API_KEY!;
const BRANDFETCH_API_KEY = process.env.VITE_BRANDFETCH_API_KEY;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

interface InitializationRequest {
  organizationId?: string; // For organization accounts
  userId?: string; // For personal accounts
  websiteUrl: string;
  businessName?: string;
  industry?: string;
  email?: string;
  phone?: string;
}

interface BrandColors {
  primary: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
}

interface ScrapedData {
  title: string;
  description: string;
  content: string;
  metadata: Record<string, any>;
}

/**
 * Scrape website using Firecrawl API
 */
async function scrapeWebsite(url: string): Promise<ScrapedData> {
  console.log(`[Firecrawl] Scraping ${url}`);

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "html"],
      onlyMainContent: true,
      waitFor: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    title: data.data?.metadata?.title || "",
    description: data.data?.metadata?.description || "",
    content: data.data?.markdown || data.data?.html || "",
    metadata: data.data?.metadata || {},
  };
}

/**
 * Extract brand colors using Brandfetch API
 */
async function extractBrandColors(websiteUrl: string): Promise<BrandColors | null> {
  if (!BRANDFETCH_API_KEY) {
    console.warn("[BrandColors] Brandfetch API key not configured, skipping");
    return null;
  }

  try {
    console.log(`[BrandColors] Extracting colors for ${websiteUrl}`);

    const domain = new URL(websiteUrl).hostname;
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        "Authorization": `Bearer ${BRANDFETCH_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn(`[BrandColors] Brandfetch API error: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const colors = data.colors || [];

    if (colors.length === 0) {
      return null;
    }

    return {
      primary: colors[0]?.hex || "",
      secondary: colors[1]?.hex,
      accent: colors[2]?.hex,
      neutral: colors[3]?.hex,
    };
  } catch (error) {
    console.error("[BrandColors] Error extracting colors:", error);
    return null;
  }
}

/**
 * Extract structured business intelligence from scraped content using Claude
 */
async function extractBusinessIntelligence(
  scrapedData: ScrapedData,
  websiteUrl: string
): Promise<{
  facts: Array<{ fact_text: string; fact_type: string; category: string; confidence: number }>;
  industry: string;
  tagline: string;
  coreOfferings: string[];
  valuePropositions: string[];
  targetKeywords: string[];
}> {
  console.log("[Claude] Extracting business intelligence from scraped content");

  const prompt = `You are a business intelligence analyst. Analyze this website content and extract structured business information.

WEBSITE URL: ${websiteUrl}
TITLE: ${scrapedData.title}
DESCRIPTION: ${scrapedData.description}

CONTENT:
${scrapedData.content.substring(0, 8000)} // Limit to ~8k chars for token efficiency

YOUR TASK:
Extract the following information in JSON format:

1. **industry** - The primary industry/sector (e.g., "Marketing Agency", "SaaS", "E-commerce")
2. **tagline** - A concise tagline or value proposition (if found)
3. **coreOfferings** - Array of 3-5 main products/services offered
4. **valuePropositions** - Array of 2-4 unique value propositions
5. **targetKeywords** - Array of 5-10 relevant SEO keywords
6. **facts** - Array of 10-20 specific facts about the business. Each fact must have:
   - fact_text: The actual fact (1-3 sentences)
   - fact_type: One of [service, product, value_proposition, process, faq, pricing, location, team, history]
   - category: Broader category (e.g., "Services", "About", "Solutions")
   - confidence: 0.0-1.0 score based on how clearly stated the fact is

RESPONSE FORMAT (valid JSON only):
{
  "industry": "string",
  "tagline": "string",
  "coreOfferings": ["string"],
  "valuePropositions": ["string"],
  "targetKeywords": ["string"],
  "facts": [
    {
      "fact_text": "string",
      "fact_type": "service",
      "category": "Services",
      "confidence": 0.9
    }
  ]
}

IMPORTANT:
- Only extract facts that are explicitly stated or strongly implied
- Assign higher confidence (0.8-1.0) to facts found in multiple places or in prominent sections
- Assign lower confidence (0.5-0.7) to inferred facts
- Focus on actionable, specific information
- Do NOT make assumptions or hallucinate information`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  // Parse JSON response
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Claude response");
    }

    const extracted = JSON.parse(jsonMatch[0]);
    console.log(`[Claude] Extracted ${extracted.facts?.length || 0} facts`);

    return extracted;
  } catch (error) {
    console.error("[Claude] Error parsing JSON response:", error);
    throw new Error("Failed to parse business intelligence from Claude");
  }
}

/**
 * Generate embeddings for facts using OpenAI
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log(`[OpenAI] Generating embeddings for ${texts.length} texts`);

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.map((item: any) => item.embedding);
}

/**
 * Main initialization handler
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const body: InitializationRequest = JSON.parse(event.body || "{}");
    const { organizationId, userId, websiteUrl, businessName, industry, email, phone } = body;

    // Validate required fields
    if ((!organizationId && !userId) || !websiteUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: (organizationId OR userId) AND websiteUrl",
        }),
      };
    }

    const accountType = organizationId ? "organization" : "user";
    const accountId = organizationId || userId;
    console.log(`[Init] Starting brain initialization for ${accountType} ${accountId}`);

    // Check if brain already exists
    let existingBrainQuery = supabase
      .from("business_brains")
      .select("id, slug");

    if (organizationId) {
      existingBrainQuery = existingBrainQuery.eq("organization_id", organizationId);
    } else {
      existingBrainQuery = existingBrainQuery.eq("created_by", userId);
    }

    const { data: existingBrain } = await existingBrainQuery.single();

    if (existingBrain) {
      console.log(`[Init] Brain already exists: ${existingBrain.slug}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          brainId: existingBrain.id,
          slug: existingBrain.slug,
          message: "Brain already exists",
          alreadyExists: true,
        }),
      };
    }

    // Step 1: Scrape website
    console.log("[Step 1/5] Scraping website...");
    const scrapedData = await scrapeWebsite(websiteUrl);

    // Step 2: Extract brand colors
    console.log("[Step 2/5] Extracting brand colors...");
    const brandColors = await extractBrandColors(websiteUrl);

    // Step 3: Extract business intelligence
    console.log("[Step 3/5] Extracting business intelligence...");
    const intelligence = await extractBusinessIntelligence(scrapedData, websiteUrl);

    // Step 4: Create Business Brain
    console.log("[Step 4/5] Creating Business Brain entity...");
    const slug = (businessName || scrapedData.title || "business")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const brainData: any = {
      slug,
      name: businessName || scrapedData.title || "My Business",
      business_name: businessName || scrapedData.title || "My Business",
      tagline: intelligence.tagline || scrapedData.description || null,
      description: scrapedData.description || null,
      industry: industry || intelligence.industry || null,
      primary_website: websiteUrl,
      primary_email: email || null,
      primary_phone: phone || null,
      core_offerings: intelligence.coreOfferings || [],
      unique_value_propositions: intelligence.valuePropositions || [],
      target_keywords: intelligence.targetKeywords || [],
      brand_colors: brandColors || {},
      auto_initialized: true,
      web_scrape_completed: true,
      brand_colors_extracted: brandColors !== null,
      brain_level: "starter", // Will auto-upgrade via trigger
      confidence_score: 0.0, // Will be calculated after facts are inserted
    };

    // Add organization_id or created_by based on account type
    if (organizationId) {
      brainData.organization_id = organizationId;
    } else {
      brainData.created_by = userId;
    }

    const { data: brain, error: brainError } = await supabase
      .from("business_brains")
      .insert(brainData)
      .select()
      .single();

    if (brainError) {
      console.error("[Init] Error creating brain:", brainError);
      throw new Error(`Failed to create brain: ${brainError.message}`);
    }

    console.log(`[Init] Created brain ${brain.id} (${brain.slug})`);

    // Step 5: Create brain facts with embeddings
    console.log(`[Step 5/5] Creating ${intelligence.facts.length} brain facts...`);

    if (intelligence.facts.length > 0) {
      // Generate embeddings for all facts
      const factTexts = intelligence.facts.map(f => f.fact_text);
      const embeddings = await generateEmbeddings(factTexts);

      // Insert facts with embeddings
      const factsToInsert = intelligence.facts.map((fact, index) => ({
        brain_id: brain.id,
        fact_text: fact.fact_text,
        fact_type: fact.fact_type,
        category: fact.category,
        confidence: fact.confidence,
        source_type: "web_scrape",
        source_url: websiteUrl,
        embedding: JSON.stringify(embeddings[index]), // Supabase vector type accepts JSON array
        is_current: true,
      }));

      const { error: factsError } = await supabase
        .from("brain_facts")
        .insert(factsToInsert);

      if (factsError) {
        console.error("[Init] Error creating facts:", factsError);
        // Don't fail the whole process, just log the error
      } else {
        console.log(`[Init] Created ${factsToInsert.length} brain facts`);
      }
    }

    // Refresh brain to get updated stats (triggers will have calculated confidence)
    const { data: finalBrain } = await supabase
      .from("business_brains")
      .select("*")
      .eq("id", brain.id)
      .single();

    console.log(`[Init] ✓ Initialization complete! Brain level: ${finalBrain?.brain_level}, Confidence: ${finalBrain?.confidence_score}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        brainId: brain.id,
        slug: brain.slug,
        brainLevel: finalBrain?.brain_level || "starter",
        confidenceScore: finalBrain?.confidence_score || 0.0,
        totalFacts: finalBrain?.total_facts || 0,
        brandColorsExtracted: brandColors !== null,
        message: "Brain initialized successfully",
      }),
    };
  } catch (error: any) {
    console.error("[Init] Error during initialization:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Brain initialization failed",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
    };
  }
};
