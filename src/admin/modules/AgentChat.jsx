/**
 * Agent Chat Module
 * Chat interface with AI agents using business brain context
 */

import React, { useState, useEffect, useRef } from 'react'
import { Agents, Conversations, BusinessBrains } from '../../api/entities.ts'
import { useParams } from 'react-router-dom'
import { Send, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function AgentChat() {
  const { agentId } = useParams()
  const [agent, setAgent] = useState(null)
  const [brain, setBrain] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadAgent()
    loadBrain()
  }, [agentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadAgent = async () => {
    if (!agentId) return

    try {
      const data = await Agents.get(agentId)
      setAgent(data)
    } catch (error) {
      console.error('Failed to load agent:', error)
    }
  }

  const loadBrain = async () => {
    try {
      const brains = await BusinessBrains.list()
      const defaultBrain = brains.find(b => b.slug === 'default') || brains[0]
      setBrain(defaultBrain)
    } catch (error) {
      console.error('Failed to load brain:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !agent || !brain) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await Agents.invoke({
        agentId: agent.id,
        brainId: brain.id,
        messages: [...messages, userMessage]
      })

      setMessages(prev => [...prev, response.message])
      setConversationId(response.conversationId)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `ERROR: ${error.message}`
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (messageId, rating) => {
    if (!agent || !conversationId) return

    try {
      await Agents.feedback({
        agentId: agent.id,
        conversationId,
        messageId,
        rating
      })
      alert('Feedback submitted!')
    } catch (error) {
      console.error('Feedback error:', error)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="bg-gray-900 border border-green-500/30 p-4 mb-4">
        <h1 className="text-xl font-bold text-green-400">
          {agent?.name || 'Loading...'}
        </h1>
        {brain && (
          <p className="text-green-500/70 text-sm mt-1">
            Brain: {brain.name}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-900 border border-green-500/30 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-green-500/50 py-12">
            Start a conversation...
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 ${
                msg.role === 'user'
                  ? 'bg-green-500 text-black'
                  : 'bg-black border border-green-500/30 text-green-400'
              }`}
            >
              <div className="text-xs mb-1 opacity-70">
                {msg.role === 'user' ? 'YOU' : agent?.name?.toUpperCase()}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-green-500/20">
                  <button
                    onClick={() => handleFeedback(msg.id, 5)}
                    className="text-green-500/50 hover:text-green-400 transition-colors"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 1)}
                    className="text-green-500/50 hover:text-green-400 transition-colors"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-black border border-green-500/30 text-green-400 p-3 animate-pulse">
              <div className="text-xs mb-1 opacity-70">{agent?.name?.toUpperCase()}</div>
              <div>Thinking...</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-black border border-green-500/30 text-green-400 px-4 py-3 focus:border-green-500 focus:outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send size={18} />
          SEND
        </button>
      </div>
    </div>
  )
}
