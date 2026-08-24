/**
 * Telemetry Dashboard Module
 * Monitor system health, performance, and usage analytics
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../api/auth'
import { Activity, AlertCircle, CheckCircle, Clock, TrendingUp, Zap, Database, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function TelemetryDashboard() {
  const [events, setEvents] = useState([])
  const [metrics, setMetrics] = useState({})
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    timeRange: '24h'
  })
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadTelemetry()

    // Auto-refresh every 30 seconds
    let interval
    if (autoRefresh) {
      interval = setInterval(loadTelemetry, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [filters, autoRefresh])

  const loadTelemetry = async () => {
    try {
      setLoading(true)

      // Calculate time range
      const now = new Date()
      const timeRanges = {
        '1h': new Date(now - 60 * 60 * 1000),
        '24h': new Date(now - 24 * 60 * 60 * 1000),
        '7d': new Date(now - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now - 30 * 24 * 60 * 60 * 1000)
      }
      const startTime = timeRanges[filters.timeRange] || timeRanges['24h']

      // Load events with filters
      let query = supabase
        .from('telemetry_events')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (filters.type !== 'all') {
        query = query.eq('area', filters.type)
      }

      const { data: eventsData, error: eventsError } = await query
      if (eventsError) throw eventsError
      setEvents(eventsData || [])

      // Calculate metrics
      const totalEvents = eventsData?.length || 0
      const errors = eventsData?.filter(e => e.name.includes('error') || e.name.includes('failed'))?.length || 0
      const successes = eventsData?.filter(e => e.name.includes('success') || e.name.includes('completed'))?.length || 0

      // Get agent usage
      const { count: agentRunsCount } = await supabase
        .from('agent_runs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startTime.toISOString())

      // Get workflow executions
      const { count: workflowRunsCount } = await supabase
        .from('workflow_runs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startTime.toISOString())

      // Calculate average response time (mock for now)
      const avgResponseTime = eventsData
        ?.filter(e => e.payload?.duration)
        ?.reduce((sum, e) => sum + (e.payload.duration || 0), 0) / (eventsData?.filter(e => e.payload?.duration)?.length || 1) || 0

      setMetrics({
        totalEvents,
        errors,
        successes,
        errorRate: totalEvents > 0 ? ((errors / totalEvents) * 100).toFixed(1) : 0,
        agentRuns: agentRunsCount || 0,
        workflowRuns: workflowRunsCount || 0,
        avgResponseTime: avgResponseTime.toFixed(0)
      })

      // Prepare chart data - events by hour
      const eventsByHour = {}
      eventsData?.forEach(event => {
        const hour = new Date(event.created_at).toISOString().slice(0, 13)
        eventsByHour[hour] = (eventsByHour[hour] || 0) + 1
      })

      const chartDataArray = Object.entries(eventsByHour)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-24) // Last 24 hours
        .map(([hour, count]) => ({
          time: new Date(hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
          events: count
        }))

      setChartData(chartDataArray)

    } catch (error) {
      console.error('Failed to load telemetry:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (eventName) => {
    if (eventName.includes('error') || eventName.includes('failed')) return 'text-red-400 bg-red-500/10'
    if (eventName.includes('warning')) return 'text-yellow-400 bg-yellow-500/10'
    if (eventName.includes('success') || eventName.includes('completed')) return 'text-green-400 bg-green-500/10'
    return 'text-blue-400 bg-blue-500/10'
  }

  const getEventIcon = (eventName) => {
    if (eventName.includes('error') || eventName.includes('failed')) return <AlertCircle size={14} />
    if (eventName.includes('success') || eventName.includes('completed')) return <CheckCircle size={14} />
    return <Activity size={14} />
  }

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400 animate-pulse font-medium">Loading telemetry data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Telemetry Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time system monitoring and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
            }`}
          >
            {autoRefresh ? '● Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={loadTelemetry}
            className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-sm font-medium text-white transition-all"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity size={20} className="text-blue-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">TOTAL EVENTS</div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.totalEvents}</div>
          <div className="text-xs text-slate-500 mt-1">
            {filters.timeRange} period
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">ERROR RATE</div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.errorRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.errors} errors
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Zap size={20} className="text-cyan-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">AGENT RUNS</div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.agentRuns}</div>
          <div className="text-xs text-slate-500 mt-1">
            AI generations
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-5 rounded-xl hover:border-slate-700/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Clock size={20} className="text-cyan-400" />
            </div>
            <div className="text-xs text-slate-500 font-medium">AVG RESPONSE</div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.avgResponseTime}ms</div>
          <div className="text-xs text-slate-500 mt-1">
            response time
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">Time Range:</span>
            {['1h', '24h', '7d', '30d'].map(range => (
              <button
                key={range}
                onClick={() => setFilters({ ...filters, timeRange: range })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filters.timeRange === range
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-400 font-medium">Type:</span>
            {['all', 'admin', 'agent', 'workflow', 'ingest'].map(type => (
              <button
                key={type}
                onClick={() => setFilters({ ...filters, type })}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  filters.type === type
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Volume Chart */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-white mb-4">Event Volume Over Time</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-slate-500 text-sm text-center py-12">
            No event data available for the selected time range
          </div>
        )}
      </div>

      {/* Event Stream */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-xl">
        <h2 className="text-lg font-bold text-white mb-4">Recent Events</h2>
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">
              No events found for the selected filters
            </div>
          ) : (
            events.map((event, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-slate-950/50 border border-slate-800/30 hover:border-slate-700/50 transition-all rounded-lg"
              >
                <div className={`p-2 rounded-lg ${getSeverityColor(event.name)}`}>
                  {getEventIcon(event.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-200 text-sm font-medium">{event.name}</span>
                    <span className="px-2 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-slate-400">
                      {event.area}
                    </span>
                  </div>
                  {event.payload && Object.keys(event.payload).length > 0 && (
                    <div className="text-xs text-slate-500 font-mono truncate">
                      {JSON.stringify(event.payload)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
