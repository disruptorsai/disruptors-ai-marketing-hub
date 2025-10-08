/**
 * AI-Powered Fact Extraction
 * Uses LLM to extract structured facts from scraped content
 */

import { invokeLLM } from './llm'
import { ScrapedContent } from './scraper'

export interface ExtractedFact {
  key: string
  value: any
  source: string
  confidence: number
}

/**
 * Extract structured facts from content using LLM
 */
export async function extractFactsWithLLM(
  content: ScrapedContent,
  brainContext?: string
): Promise<ExtractedFact[]> {
  const systemPrompt = `You are a fact extraction specialist. Your job is to extract structured, atomic facts from web content that would be useful for building a business knowledge base.

## EXTRACTION RULES:
1. Extract only verifiable, factual information (no opinions or speculation)
2. Format each fact as a clear key-value pair
3. Keep keys concise and descriptive (e.g., "Company Name", "Founded Year", "CEO")
4. Values should be specific and detailed
5. Assign confidence (0-1) based on source quality and clarity
6. Focus on business-relevant information: company details, services, products, team, locations, contact info

## OUTPUT FORMAT:
Return a JSON array of facts:
[
  {
    "key": "Company Name",
    "value": "Acme Corporation",
    "confidence": 1.0
  },
  {
    "key": "Industry",
    "value": "Manufacturing and distribution of widgets",
    "confidence": 0.9
  }
]

${brainContext ? `\n## EXISTING KNOWLEDGE:\n${brainContext}\n\nOnly extract NEW or UPDATED facts that complement existing knowledge.` : ''}`

  const userMessage = `Extract structured facts from this content:

URL: ${content.url}
Title: ${content.title}

Content:
${content.textContent.slice(0, 4000)}

${content.metadata ? `\nMetadata: ${JSON.stringify(content.metadata, null, 2)}` : ''}`

  try {
    const response = await invokeLLM(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      {
        provider: 'anthropic',
        model: 'claude-sonnet-4.5-20250929',
        temperature: 0.3, // Lower temperature for more focused extraction
        max_tokens: 2000
      }
    )

    // Parse JSON response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('No JSON array found in LLM response')
      return []
    }

    const facts = JSON.parse(jsonMatch[0])

    return facts.map((fact: any) => ({
      key: fact.key,
      value: typeof fact.value === 'object' ? fact.value : String(fact.value),
      source: content.url,
      confidence: fact.confidence || 0.8
    }))

  } catch (error) {
    console.error('Fact extraction error:', error)
    return []
  }
}

/**
 * Deduplicate and merge facts
 */
export function deduplicateFacts(
  newFacts: ExtractedFact[],
  existingFacts: Array<{ key: string; value: any; confidence: number }>
): ExtractedFact[] {
  const factMap = new Map<string, ExtractedFact>()

  // Add existing facts
  existingFacts.forEach(fact => {
    factMap.set(fact.key.toLowerCase(), {
      key: fact.key,
      value: fact.value,
      source: 'existing',
      confidence: fact.confidence
    })
  })

  // Add or update with new facts
  newFacts.forEach(newFact => {
    const key = newFact.key.toLowerCase()
    const existing = factMap.get(key)

    if (!existing) {
      factMap.set(key, newFact)
    } else if (newFact.confidence > existing.confidence) {
      // New fact has higher confidence, replace
      factMap.set(key, newFact)
    } else if (newFact.confidence === existing.confidence && newFact.value !== existing.value) {
      // Same confidence but different value, keep both with disambiguation
      factMap.set(`${key}_updated`, newFact)
    }
  })

  return Array.from(factMap.values())
}

/**
 * Validate fact quality
 */
export function validateFact(fact: ExtractedFact): boolean {
  // Check if key is meaningful
  if (!fact.key || fact.key.length < 3 || fact.key.length > 100) {
    return false
  }

  // Check if value is meaningful
  if (!fact.value || (typeof fact.value === 'string' && fact.value.length < 2)) {
    return false
  }

  // Check confidence
  if (typeof fact.confidence !== 'number' || fact.confidence < 0 || fact.confidence > 1) {
    return false
  }

  return true
}

/**
 * Batch process multiple URLs
 */
export async function batchExtractFacts(
  contents: ScrapedContent[],
  brainContext?: string,
  onProgress?: (progress: number, current: number, total: number) => void
): Promise<ExtractedFact[]> {
  const allFacts: ExtractedFact[] = []

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]

    try {
      const facts = await extractFactsWithLLM(content, brainContext)
      const validFacts = facts.filter(validateFact)
      allFacts.push(...validFacts)

      if (onProgress) {
        onProgress(((i + 1) / contents.length) * 100, i + 1, contents.length)
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Failed to extract facts from ${content.url}:`, error)
    }
  }

  return allFacts
}
