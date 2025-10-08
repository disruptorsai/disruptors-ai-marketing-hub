/**
 * AI Invoke Function
 * Production-ready LLM integration with business brain context
 */

import { getServiceClient } from '../lib/supabase'
import { invokeLLM, composePromptWithContext, extractQueryTerms } from '../lib/llm'

export default async function handler(request: Request) {
  try {
    const supabase = getServiceClient()

    // Parse request
    const { agentId, brainId, messages, options } = await request.json()

    if (!agentId || !brainId || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: { message: 'agentId, brainId, and messages[] required' }
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({
          error: { message: 'Agent not found' }
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract query from latest user message
    const latestUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')
    const query = latestUserMessage ? extractQueryTerms(latestUserMessage.content) : ''

    // Retrieve relevant brain facts via FTS
    const { data: facts, error: factsError } = await supabase
      .rpc('search_brain_facts', {
        brain_id: brainId,
        q: query,
        limit_count: 15
      })

    if (factsError) {
      console.error('Brain facts retrieval error:', factsError)
      // Continue without facts rather than failing
    }

    // Get brand rules
    const { data: brandRules, error: rulesError } = await supabase
      .from('brand_rules')
      .select('*')
      .eq('brain_id', brainId)

    if (rulesError) {
      console.error('Brand rules retrieval error:', rulesError)
    }

    // Compose prompt with full context
    const promptMessages = composePromptWithContext(
      latestUserMessage?.content || '',
      facts || [],
      brandRules || [],
      agent.system_prompt
    )

    // Get LLM options from agent flags
    const llmOptions = {
      provider: agent.flags?.provider || 'anthropic',
      model: agent.flags?.model,
      temperature: agent.flags?.temperature || 0.7,
      max_tokens: agent.flags?.max_tokens || 2000,
      stream: options?.stream || false
    }

    // Invoke LLM
    const response = await invokeLLM(promptMessages, llmOptions)

    // Create or get conversation
    let conversationId = messages[0]?.conversationId
    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          agent_id: agentId,
          user_id: null, // Set from auth if available
          title: latestUserMessage?.content.slice(0, 100)
        })
        .select()
        .single()

      if (convError) {
        console.error('Conversation creation error:', convError)
      } else {
        conversationId = newConv.id
      }
    }

    // Save messages
    if (conversationId) {
      const messagesToSave = [
        {
          conversation_id: conversationId,
          role: 'user',
          content: { text: latestUserMessage?.content },
          tokens: response.tokens?.prompt || 0
        },
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: { text: response.content },
          tokens: response.tokens?.completion || 0
        }
      ]

      await supabase.from('messages').insert(messagesToSave)
    }

    // Log telemetry
    await supabase.from('telemetry_events').insert({
      area: 'agents',
      name: 'ai_invoke',
      payload: {
        agent_id: agentId,
        brain_id: brainId,
        model: response.model,
        tokens: response.tokens,
        facts_used: facts?.length || 0
      }
    })

    return new Response(
      JSON.stringify({
        conversationId,
        message: {
          role: 'assistant',
          content: response.content
        },
        meta: {
          model: response.model,
          provider: response.provider,
          tokens: response.tokens,
          factsUsed: facts?.length || 0
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('AI Invoke error:', error)

    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          code: 'AI_INVOKE_ERROR'
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
