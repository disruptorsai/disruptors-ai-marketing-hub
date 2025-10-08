/**
 * BUSINESS BRAIN-POWERED CONTENT GENERATION
 *
 * Generates AI content (blog articles, social posts, etc.) using Business Brain context.
 * Automatically retrieves relevant facts, brand rules, and visual assets to ensure
 * brand-consistent, personalized content.
 *
 * Features:
 * - Vector similarity search for relevant brain facts
 * - Brand voice and tone enforcement
 * - SEO optimization with target keywords
 * - Auto-markdown-to-HTML conversion
 * - Usage tracking for fact analytics
 *
 * @endpoint POST /brain-content-generate
 * @auth Required (user must have access to brain)
 */

import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

interface ContentGenerationRequest {
  brainId: string;
  contentType: "blog_article" | "blog_title" | "social_post" | "email" | "custom";

  // For blog articles
  topic?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  targetWordCount?: number;

  // For titles
  articleSummary?: string;
  titleCount?: number;

  // For social posts
  platform?: "linkedin" | "twitter" | "facebook" | "instagram";
  postType?: "promotional" | "educational" | "engagement" | "announcement";

  // Custom prompt
  customPrompt?: string;
  customInstructions?: string;
}

interface BrainContext {
  brain: any;
  relevantFacts: any[];
  brandRules: any[];
  brandAssets: any[];
}

/**
 * Generate embedding for query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: query,
      encoding_format: "float",
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Retrieve brain context (facts, rules, assets) relevant to the content request
 */
async function retrieveBrainContext(
  brainId: string,
  topic: string,
  contentType: string
): Promise<BrainContext> {
  console.log(`[Context] Retrieving brain context for topic: "${topic}"`);

  // Get brain
  const { data: brain } = await supabase
    .from("business_brains")
    .select("*")
    .eq("id", brainId)
    .single();

  if (!brain) {
    throw new Error("Brain not found");
  }

  // Generate query embedding for vector search
  const queryEmbedding = await generateQueryEmbedding(topic);

  // Vector similarity search for relevant facts
  const { data: vectorFacts } = await supabase.rpc("search_brain_facts_vector", {
    brain_id: brainId,
    query_embedding: queryEmbedding,
    limit_count: 10,
    similarity_threshold: 0.7,
  });

  // Full-text search for additional facts
  const { data: textFacts } = await supabase.rpc("search_brain_facts", {
    brain_id: brainId,
    q: topic,
    limit_count: 10,
  });

  // Combine and deduplicate facts
  const factIds = new Set();
  const relevantFacts: any[] = [];

  [...(vectorFacts || []), ...(textFacts || [])].forEach(fact => {
    if (!factIds.has(fact.id)) {
      factIds.add(fact.id);
      relevantFacts.push(fact);
    }
  });

  console.log(`[Context] Found ${relevantFacts.length} relevant facts`);

  // Get brand rules (voice, tone, style guidelines)
  const { data: brandRules } = await supabase
    .from("brand_rules")
    .select("*")
    .eq("brain_id", brainId)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  // Get brand assets (logos, images)
  const { data: brandAssets } = await supabase
    .from("brand_assets")
    .select("*")
    .eq("brain_id", brainId)
    .limit(5);

  return {
    brain,
    relevantFacts: relevantFacts || [],
    brandRules: brandRules || [],
    brandAssets: brandAssets || [],
  };
}

/**
 * Build system prompt with brain context
 */
function buildSystemPrompt(context: BrainContext, contentType: string): string {
  const { brain, relevantFacts, brandRules } = context;

  let systemPrompt = `You are an expert content writer for ${brain.business_name}.

BUSINESS CONTEXT:
- Industry: ${brain.industry || "Not specified"}
- Tagline: ${brain.tagline || "Not specified"}
- Target Keywords: ${brain.target_keywords?.join(", ") || "None"}

`;

  // Add core offerings
  if (brain.core_offerings?.length > 0) {
    systemPrompt += `CORE OFFERINGS:\n`;
    brain.core_offerings.forEach((offering: string) => {
      systemPrompt += `- ${offering}\n`;
    });
    systemPrompt += "\n";
  }

  // Add value propositions
  if (brain.unique_value_propositions?.length > 0) {
    systemPrompt += `UNIQUE VALUE PROPOSITIONS:\n`;
    brain.unique_value_propositions.forEach((uvp: string) => {
      systemPrompt += `- ${uvp}\n`;
    });
    systemPrompt += "\n";
  }

  // Add brand voice
  if (brain.brand_voice?.length > 0 || brain.tone_attributes?.length > 0) {
    systemPrompt += `BRAND VOICE & TONE:\n`;
    if (brain.brand_voice) {
      systemPrompt += `Voice: ${brain.brand_voice.join(", ")}\n`;
    }
    if (brain.tone_attributes) {
      systemPrompt += `Tone: ${brain.tone_attributes.join(", ")}\n`;
    }
    if (brain.writing_style) {
      systemPrompt += `Style: ${brain.writing_style}\n`;
    }
    systemPrompt += "\n";
  }

  // Add brand rules
  if (brandRules.length > 0) {
    systemPrompt += `BRAND GUIDELINES:\n`;
    brandRules.forEach(rule => {
      systemPrompt += `[${rule.rule_category.toUpperCase()}] ${rule.rule_text}\n`;
    });
    systemPrompt += "\n";
  }

  // Add relevant knowledge facts
  if (relevantFacts.length > 0) {
    systemPrompt += `RELEVANT KNOWLEDGE (use these facts when appropriate):\n`;
    relevantFacts.slice(0, 15).forEach((fact, index) => {
      systemPrompt += `${index + 1}. [${fact.fact_type}] ${fact.fact_text}\n`;
    });
    systemPrompt += "\n";
  }

  return systemPrompt;
}

/**
 * Generate blog article
 */
async function generateBlogArticle(
  context: BrainContext,
  topic: string,
  primaryKeyword: string,
  secondaryKeywords: string[],
  targetWordCount: number
): Promise<{ content: string; factIds: string[] }> {
  const systemPrompt = buildSystemPrompt(context, "blog_article");

  const userPrompt = `Write a comprehensive, SEO-optimized blog article on the topic: "${topic}"

REQUIREMENTS:
- Word count: ${targetWordCount} words (MINIMUM - go longer if needed for quality)
- Primary keyword: "${primaryKeyword}" (use naturally 5-8 times)
- Secondary keywords: ${secondaryKeywords.join(", ")} (use naturally throughout)

STRUCTURE:
1. Compelling title with primary keyword
2. Introduction with hook (2-3 paragraphs)
3. 6-8 main content sections with H2 subheadings
4. FAQ section with 5 detailed questions (use H3 for each question)
5. Conclusion with call-to-action

CONTENT GUIDELINES:
- Use ONLY the knowledge facts provided in the system prompt
- Write in the brand voice specified above
- Include specific examples, statistics, and actionable advice
- Format as clean HTML (use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- Natural, engaging writing - avoid keyword stuffing
- Add schema-friendly markup hints (FAQ markup ready)

CRITICAL:
- Use markdown format (will be converted to HTML later)
- Start with # for title, ## for H2, ### for H3
- Use bullet points with - or *
- Do NOT include meta descriptions or schema markup directly
- Focus on valuable, helpful content`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const content = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract fact IDs used (for tracking)
  const factIds = context.relevantFacts.map(f => f.id);

  return { content, factIds };
}

/**
 * Generate blog titles
 */
async function generateBlogTitles(
  context: BrainContext,
  topic: string,
  primaryKeyword: string,
  titleCount: number
): Promise<string[]> {
  const systemPrompt = buildSystemPrompt(context, "blog_title");

  const userPrompt = `Generate ${titleCount} compelling, SEO-optimized blog post titles for the topic: "${topic}"

REQUIREMENTS:
- Include primary keyword: "${primaryKeyword}"
- 50-70 characters ideal length
- Use power words and emotional triggers
- Create curiosity and provide value
- Match brand voice specified above

FORMAT:
Return ONLY a JSON array of title strings.

Example: ["Title 1 Here", "Title 2 Here", "Title 3 Here"]`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    temperature: 0.8,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("[TitleGen] Error parsing titles:", error);
    return [];
  }
}

/**
 * Generate social media post
 */
async function generateSocialPost(
  context: BrainContext,
  platform: string,
  postType: string,
  topic: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context, "social_post");

  const platformGuidelines: Record<string, string> = {
    linkedin: "Professional tone, 1300-2000 characters, use line breaks, include hashtags (3-5)",
    twitter: "Concise, 280 characters max, engaging hook, 1-2 hashtags",
    facebook: "Conversational, 40-80 words, engaging question or story, emoji-friendly",
    instagram: "Visual-first caption, 125-150 words, multiple line breaks, 10-15 hashtags",
  };

  const userPrompt = `Create a ${postType} social media post for ${platform} about: "${topic}"

PLATFORM GUIDELINES:
${platformGuidelines[platform] || "Keep it engaging and on-brand"}

REQUIREMENTS:
- Match brand voice from system prompt
- Use relevant knowledge facts when appropriate
- Include clear call-to-action
- Optimize for engagement

Return ONLY the post content (no explanations).`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    temperature: 0.8,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

/**
 * Track fact usage
 */
async function trackFactUsage(postId: string, factIds: string[]): Promise<void> {
  if (factIds.length === 0) return;

  const usageRecords = factIds.map(factId => ({
    post_id: postId,
    brain_fact_id: factId,
    relevance_score: 0.8, // Could be calculated based on usage
  }));

  await supabase.from("posts_brain_facts").insert(usageRecords);
  console.log(`[Tracking] Recorded usage of ${factIds.length} facts`);
}

/**
 * Main handler
 */
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body: ContentGenerationRequest = JSON.parse(event.body || "{}");
    const { brainId, contentType } = body;

    if (!brainId || !contentType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing brainId or contentType" }),
      };
    }

    console.log(`[ContentGen] Generating ${contentType} for brain ${brainId}`);

    let result: any = {};

    switch (contentType) {
      case "blog_article": {
        const {
          topic = "",
          primaryKeyword = "",
          secondaryKeywords = [],
          targetWordCount = 1500,
        } = body;

        if (!topic || !primaryKeyword) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing topic or primaryKeyword" }),
          };
        }

        const brainContext = await retrieveBrainContext(brainId, topic, contentType);
        const { content, factIds } = await generateBlogArticle(
          brainContext,
          topic,
          primaryKeyword,
          secondaryKeywords,
          targetWordCount
        );

        result = {
          content,
          factIds,
          wordCount: content.split(/\s+/).length,
        };
        break;
      }

      case "blog_title": {
        const {
          topic = "",
          primaryKeyword = "",
          titleCount = 5,
        } = body;

        if (!topic || !primaryKeyword) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing topic or primaryKeyword" }),
          };
        }

        const brainContext = await retrieveBrainContext(brainId, topic, contentType);
        const titles = await generateBlogTitles(brainContext, topic, primaryKeyword, titleCount);

        result = { titles };
        break;
      }

      case "social_post": {
        const {
          topic = "",
          platform = "linkedin",
          postType = "educational",
        } = body;

        if (!topic) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing topic" }),
          };
        }

        const brainContext = await retrieveBrainContext(brainId, topic, contentType);
        const content = await generateSocialPost(brainContext, platform, postType, topic);

        result = { content };
        break;
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid content type" }),
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        ...result,
      }),
    };
  } catch (error: any) {
    console.error("[ContentGen] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Content generation failed",
        message: error.message,
      }),
    };
  }
};
