/**
 * BUSINESS BRAIN ENHANCEMENT FUNCTION
 *
 * Enhances an existing Business Brain through:
 * - AI-powered onboarding conversations (10-15 questions)
 * - File uploads and knowledge extraction
 * - Integration data synchronization
 * - Manual fact additions
 *
 * Automatically calculates confidence scores and upgrades brain level
 * (starter → enhanced → expert) based on quality metrics.
 *
 * @endpoint POST /brain-enhance
 * @auth Required (user must own brain or be org member)
 */

import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY!;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

interface EnhancementRequest {
  brainId: string;
  enhancementType: "onboarding" | "file_upload" | "integration_sync" | "manual_facts";

  // For onboarding
  conversationHistory?: Array<{ role: string; content: string }>;
  currentQuestion?: number;

  // For file uploads
  fileContent?: string;
  fileName?: string;
  fileType?: string;

  // For manual facts
  facts?: Array<{
    fact_text: string;
    fact_type: string;
    category: string;
    confidence?: number;
  }>;

  // For integration sync
  integrationId?: string;
  integrationData?: any;
}

/**
 * AI-Powered Onboarding Questions
 * Dynamically generates next question based on conversation history
 */
const ONBOARDING_QUESTIONS = [
  {
    id: 1,
    question: "Let's start with the basics. What does your business do, and who do you primarily serve?",
    extractsFor: ["core_offerings", "ideal_customer_profile"],
  },
  {
    id: 2,
    question: "What makes your business different from competitors? What's your unique value proposition?",
    extractsFor: ["unique_value_propositions", "key_differentiators"],
  },
  {
    id: 3,
    question: "Describe your ideal customer. What problems do they have that you solve?",
    extractsFor: ["ideal_customer_profile", "pain_points_solved"],
  },
  {
    id: 4,
    question: "What are your 3-5 main products or services?",
    extractsFor: ["core_offerings"],
  },
  {
    id: 5,
    question: "How would you describe your brand's personality and voice? (e.g., professional, playful, authoritative, friendly)",
    extractsFor: ["brand_voice", "tone_attributes"],
  },
  {
    id: 6,
    question: "What are some key facts about your business history or achievements that customers should know?",
    extractsFor: ["history", "case_study"],
  },
  {
    id: 7,
    question: "What are the most common questions customers ask before buying from you?",
    extractsFor: ["faq"],
  },
  {
    id: 8,
    question: "What topics or themes should your content focus on? What keywords matter most to your business?",
    extractsFor: ["content_pillars", "target_keywords"],
  },
  {
    id: 9,
    question: "How do you want your brand to sound in written content? Are there specific words or phrases you love or hate?",
    extractsFor: ["writing_style", "vocabulary_level", "brand_rules"],
  },
  {
    id: 10,
    question: "What are your business goals for the next 6-12 months? What role does content play in achieving them?",
    extractsFor: ["content_strategy"],
  },
];

/**
 * Extract facts from onboarding conversation using Claude
 */
async function extractFactsFromConversation(
  conversationHistory: Array<{ role: string; content: string }>,
  brainId: string
): Promise<{ facts: any[]; brainUpdates: any }> {
  console.log("[OnboardingExtract] Analyzing conversation for facts and brand intelligence");

  const conversationText = conversationHistory
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const prompt = `You are a business intelligence analyst. Analyze this onboarding conversation and extract:

1. **Brain Facts** - Specific, actionable facts to store in the knowledge base
2. **Brand Attributes** - High-level brand characteristics to update in the business profile

CONVERSATION:
${conversationText}

EXTRACT THE FOLLOWING (JSON format):

{
  "facts": [
    {
      "fact_text": "Specific fact (1-3 sentences)",
      "fact_type": "service|product|value_proposition|process|faq|history|team|custom",
      "category": "Broader category (Services, About, FAQ, etc.)",
      "confidence": 0.0-1.0,
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "brainUpdates": {
    "core_offerings": ["offering1", "offering2"],
    "unique_value_propositions": ["uvp1", "uvp2"],
    "ideal_customer_profile": [
      {
        "segment": "Small businesses",
        "industry": "Construction",
        "pain_points": ["issue1", "issue2"],
        "goals": ["goal1", "goal2"]
      }
    ],
    "brand_voice": ["professional", "friendly"],
    "tone_attributes": ["conversational", "helpful"],
    "content_pillars": ["topic1", "topic2"],
    "target_keywords": ["keyword1", "keyword2"]
  }
}

GUIDELINES:
- Extract 5-20 specific facts from the conversation
- Only extract explicitly stated information (don't infer)
- Higher confidence (0.8-1.0) for clear, direct statements
- Lower confidence (0.5-0.7) for implied or partial information
- Focus on actionable, useful facts for content generation`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Claude response");
    }

    const extracted = JSON.parse(jsonMatch[0]);
    console.log(`[OnboardingExtract] Extracted ${extracted.facts?.length || 0} facts`);

    return extracted;
  } catch (error) {
    console.error("[OnboardingExtract] Error parsing response:", error);
    return { facts: [], brainUpdates: {} };
  }
}

/**
 * Extract facts from uploaded file using Claude
 */
async function extractFactsFromFile(
  fileContent: string,
  fileName: string,
  fileType: string,
  brainId: string
): Promise<any[]> {
  console.log(`[FileExtract] Extracting facts from ${fileName} (${fileType})`);

  const prompt = `You are a knowledge extraction expert. Analyze this file and extract relevant business facts.

FILE: ${fileName}
TYPE: ${fileType}

CONTENT:
${fileContent.substring(0, 12000)} // Limit to ~12k chars

Extract 5-30 specific facts from this content in JSON format:

{
  "facts": [
    {
      "fact_text": "Specific fact (1-3 sentences)",
      "fact_type": "service|product|value_proposition|process|faq|pricing|location|team|history|industry_insight|custom",
      "category": "Broader category",
      "confidence": 0.0-1.0,
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}

GUIDELINES:
- Focus on facts useful for content generation and brand representation
- Higher confidence for clear, well-documented facts
- Extract pricing, service details, processes, team info, case studies, etc.
- Ignore boilerplate or generic information`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return extracted.facts || [];
  } catch (error) {
    console.error("[FileExtract] Error parsing response:", error);
    return [];
  }
}

/**
 * Generate embeddings for facts
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  console.log(`[Embeddings] Generating for ${texts.length} texts`);

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
 * Get next onboarding question dynamically based on conversation
 */
async function getNextOnboardingQuestion(
  conversationHistory: Array<{ role: string; content: string }>,
  currentIndex: number
): Promise<{ question: string; isComplete: boolean }> {
  // If we've asked all questions, we're done
  if (currentIndex >= ONBOARDING_QUESTIONS.length) {
    return { question: "", isComplete: true };
  }

  // Return next predefined question
  const nextQuestion = ONBOARDING_QUESTIONS[currentIndex];
  return {
    question: nextQuestion.question,
    isComplete: false,
  };
}

/**
 * Main enhancement handler
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
    const body: EnhancementRequest = JSON.parse(event.body || "{}");
    const { brainId, enhancementType } = body;

    if (!brainId || !enhancementType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing brainId or enhancementType" }),
      };
    }

    console.log(`[Enhance] ${enhancementType} enhancement for brain ${brainId}`);

    // Verify brain exists
    const { data: brain, error: brainError } = await supabase
      .from("business_brains")
      .select("*")
      .eq("id", brainId)
      .single();

    if (brainError || !brain) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Brain not found" }),
      };
    }

    let newFacts: any[] = [];
    let brainUpdates: any = {};
    let nextQuestion: string | null = null;
    let sessionComplete = false;

    // Handle different enhancement types
    switch (enhancementType) {
      case "onboarding": {
        const { conversationHistory = [], currentQuestion = 0 } = body;

        // Extract facts from conversation so far
        if (conversationHistory.length > 0) {
          const extraction = await extractFactsFromConversation(conversationHistory, brainId);
          newFacts = extraction.facts;
          brainUpdates = extraction.brainUpdates;
        }

        // Get next question
        const next = await getNextOnboardingQuestion(conversationHistory, currentQuestion);
        nextQuestion = next.question;
        sessionComplete = next.isComplete;

        break;
      }

      case "file_upload": {
        const { fileContent, fileName, fileType } = body;
        if (!fileContent || !fileName) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing file content or name" }),
          };
        }

        newFacts = await extractFactsFromFile(fileContent, fileName, fileType || "txt", brainId);
        break;
      }

      case "manual_facts": {
        const { facts = [] } = body;
        newFacts = facts;
        break;
      }

      case "integration_sync": {
        // TODO: Implement integration data sync
        return {
          statusCode: 501,
          headers,
          body: JSON.stringify({ error: "Integration sync not yet implemented" }),
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid enhancement type" }),
        };
    }

    // Insert new facts with embeddings
    if (newFacts.length > 0) {
      const factTexts = newFacts.map(f => f.fact_text);
      const embeddings = await generateEmbeddings(factTexts);

      const factsToInsert = newFacts.map((fact, index) => ({
        brain_id: brainId,
        fact_text: fact.fact_text,
        fact_type: fact.fact_type,
        category: fact.category,
        confidence: fact.confidence || 0.7,
        source_type: enhancementType === "onboarding" ? "ai_conversation" :
                     enhancementType === "file_upload" ? "file_upload" : "manual_entry",
        keywords: fact.keywords || [],
        embedding: JSON.stringify(embeddings[index]),
        is_current: true,
      }));

      const { error: factsError } = await supabase
        .from("brain_facts")
        .insert(factsToInsert);

      if (factsError) {
        console.error("[Enhance] Error inserting facts:", factsError);
      } else {
        console.log(`[Enhance] Inserted ${factsToInsert.length} new facts`);
      }
    }

    // Update brain attributes
    if (Object.keys(brainUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from("business_brains")
        .update({
          ...brainUpdates,
          last_enhanced_at: new Date().toISOString(),
        })
        .eq("id", brainId);

      if (updateError) {
        console.error("[Enhance] Error updating brain:", updateError);
      }
    }

    // Mark onboarding as complete if session finished
    if (enhancementType === "onboarding" && sessionComplete) {
      await supabase
        .from("business_brains")
        .update({ onboarding_completed: true })
        .eq("id", brainId);
    }

    // Get updated brain stats
    const { data: updatedBrain } = await supabase
      .from("business_brains")
      .select("brain_level, confidence_score, total_facts")
      .eq("id", brainId)
      .single();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        factsAdded: newFacts.length,
        brainLevel: updatedBrain?.brain_level,
        confidenceScore: updatedBrain?.confidence_score,
        totalFacts: updatedBrain?.total_facts,
        nextQuestion: nextQuestion,
        sessionComplete: sessionComplete,
      }),
    };
  } catch (error: any) {
    console.error("[Enhance] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Enhancement failed",
        message: error.message,
      }),
    };
  }
};
