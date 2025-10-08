/**
 * LLM Integration Library
 * Unified interface for OpenAI and Anthropic with streaming support
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
  provider?: 'anthropic' | 'openai'
}

export interface LLMResponse {
  content: string
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  model: string
  provider: string
}

/**
 * Initialize Anthropic client
 */
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }
  return new Anthropic({ apiKey })
}

/**
 * Initialize OpenAI client
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }
  return new OpenAI({ apiKey })
}

/**
 * Invoke LLM with messages
 */
export async function invokeLLM(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const {
    provider = 'anthropic',
    model,
    temperature = 0.7,
    max_tokens = 2000,
    stream = false
  } = options

  if (provider === 'anthropic') {
    return invokeAnthropic(messages, { model, temperature, max_tokens, stream })
  } else {
    return invokeOpenAI(messages, { model, temperature, max_tokens, stream })
  }
}

/**
 * Invoke Anthropic Claude
 */
async function invokeAnthropic(
  messages: LLMMessage[],
  options: Partial<LLMOptions>
): Promise<LLMResponse> {
  const client = getAnthropicClient()

  const {
    model = 'claude-sonnet-4.5-20250929', // Latest Claude Sonnet
    temperature = 0.7,
    max_tokens = 2000,
    stream = false
  } = options

  // Extract system message
  const systemMessage = messages.find(m => m.role === 'system')?.content
  const conversationMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

  if (stream) {
    // TODO: Implement streaming for real-time responses
    throw new Error('Streaming not yet implemented for Anthropic')
  }

  const response = await client.messages.create({
    model,
    max_tokens,
    temperature,
    system: systemMessage,
    messages: conversationMessages
  })

  const content = response.content[0].type === 'text'
    ? response.content[0].text
    : ''

  return {
    content,
    tokens: {
      prompt: response.usage.input_tokens,
      completion: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens
    },
    model: response.model,
    provider: 'anthropic'
  }
}

/**
 * Invoke OpenAI
 */
async function invokeOpenAI(
  messages: LLMMessage[],
  options: Partial<LLMOptions>
): Promise<LLMResponse> {
  const client = getOpenAIClient()

  const {
    model = 'gpt-4o',
    temperature = 0.7,
    max_tokens = 2000,
    stream = false
  } = options

  if (stream) {
    throw new Error('Streaming not yet implemented for OpenAI')
  }

  const response = await client.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages: messages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content
    }))
  })

  const content = response.choices[0]?.message?.content || ''

  return {
    content,
    tokens: response.usage ? {
      prompt: response.usage.prompt_tokens,
      completion: response.usage.completion_tokens,
      total: response.usage.total_tokens
    } : undefined,
    model: response.model,
    provider: 'openai'
  }
}

/**
 * Compose prompt with brain context and brand DNA
 */
export function composePromptWithContext(
  userMessage: string,
  brainFacts: any[],
  brandRules: any[],
  agentSystemPrompt: string
): LLMMessage[] {
  // Format brain facts as context
  const factsContext = brainFacts
    .slice(0, 15) // Top 15 most relevant facts
    .map(fact => `- ${fact.key}: ${JSON.stringify(fact.value)}`)
    .join('\n')

  // Format brand rules
  const brandContext = brandRules
    .map(rule => {
      const content = typeof rule.content === 'string'
        ? rule.content
        : JSON.stringify(rule.content, null, 2)
      return `### ${rule.rule_type.toUpperCase()}\n${content}`
    })
    .join('\n\n')

  // Compose system message with full context
  const systemMessage = `${agentSystemPrompt}

## BUSINESS BRAIN CONTEXT
Use the following verified information about the business:

${factsContext}

## BRAND GUIDELINES
${brandContext}

## INSTRUCTIONS
- Ground your responses in the provided business brain facts
- Follow the brand voice and style guidelines strictly
- If information is not in the business brain, acknowledge what you don't know
- Prioritize accuracy over creativity when using business facts`

  return [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ]
}

/**
 * Extract query terms from user message for fact retrieval
 */
export function extractQueryTerms(message: string): string {
  // Remove common words and extract meaningful terms
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 'where', 'who']

  const terms = message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10) // Top 10 terms
    .join(' ')

  return terms || message
}
