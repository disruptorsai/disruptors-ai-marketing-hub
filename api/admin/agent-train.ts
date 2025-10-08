/**
 * Agent Training Background Function
 * Improves agent prompts based on training examples and brand DNA
 */

import { getServiceClient } from '../lib/supabase'
import { invokeLLM } from '../lib/llm'

export default async function handler(request: Request) {
  const supabase = getServiceClient()
  let runId: string | null = null

  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: { message: 'agentId required' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: { message: 'Agent not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create training run
    const { data: run, error: runError } = await supabase
      .from('agent_runs')
      .insert({
        agent_id: agentId,
        type: 'train',
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (runError || !run) {
      throw new Error('Failed to create training run')
    }

    runId = run.id

    // Get training examples
    const { data: examples } = await supabase
      .from('agent_training_examples')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })

    const positiveExamples = examples?.filter(e => e.label === 'pos') || []
    const negativeExamples = examples?.filter(e => e.label === 'neg') || []

    // Get brand rules if agent has a brain
    let brandRules: any[] = []
    if (agent.brain_id) {
      const { data: rules } = await supabase
        .from('brand_rules')
        .select('*')
        .eq('brain_id', agent.brain_id)

      brandRules = rules || []
    }

    // Construct prompt improvement request
    const improvementPrompt = `You are a prompt engineering expert. Improve the following AI agent's system prompt based on training examples and brand guidelines.

## CURRENT SYSTEM PROMPT:
${agent.system_prompt}

## POSITIVE EXAMPLES (what the agent should do):
${positiveExamples.slice(0, 10).map((ex, i) => `
${i + 1}. Input: ${ex.input}
   Expected: ${ex.expected}
`).join('\n')}

## NEGATIVE EXAMPLES (what the agent should avoid):
${negativeExamples.slice(0, 5).map((ex, i) => `
${i + 1}. Input: ${ex.input}
   Problematic: ${ex.expected}
`).join('\n')}

## BRAND GUIDELINES:
${brandRules.map(rule => `
### ${rule.rule_type.toUpperCase()}
${typeof rule.content === 'string' ? rule.content : JSON.stringify(rule.content, null, 2)}
`).join('\n')}

## TASK:
Create an improved system prompt that:
1. Maintains the core purpose and personality
2. Incorporates learnings from positive examples
3. Avoids patterns shown in negative examples
4. Strictly adheres to brand guidelines
5. Is clear, actionable, and specific

Return ONLY the improved system prompt, no explanation.`

    // Invoke LLM for prompt improvement
    const response = await invokeLLM(
      [{ role: 'user', content: improvementPrompt }],
      {
        provider: 'anthropic',
        model: 'claude-sonnet-4.5-20250929',
        temperature: 0.5,
        max_tokens: 3000
      }
    )

    const improvedPrompt = response.content.trim()

    // Update agent with improved prompt
    await supabase
      .from('agents')
      .update({
        system_prompt: improvedPrompt,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)

    // Calculate simple metrics
    const metrics = {
      positive_examples_count: positiveExamples.length,
      negative_examples_count: negativeExamples.length,
      brand_rules_applied: brandRules.length,
      prompt_length_before: agent.system_prompt.length,
      prompt_length_after: improvedPrompt.length,
      tokens_used: response.tokens?.total || 0
    }

    // Complete run
    await supabase
      .from('agent_runs')
      .update({
        status: 'success',
        metrics,
        finished_at: new Date().toISOString()
      })
      .eq('id', runId)

    // Log telemetry
    await supabase.from('telemetry_events').insert({
      area: 'agents',
      name: 'training_completed',
      payload: {
        agent_id: agentId,
        run_id: runId,
        metrics
      }
    })

    return new Response(
      JSON.stringify({
        runId,
        status: 'completed',
        metrics
      }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Training error:', error)

    if (runId) {
      await supabase
        .from('agent_runs')
        .update({
          status: 'failed',
          metrics: { error: error.message },
          finished_at: new Date().toISOString()
        })
        .eq('id', runId)
    }

    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Training failed',
          code: 'TRAINING_ERROR'
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
