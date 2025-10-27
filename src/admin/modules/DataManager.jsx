/**
 * DataManager Module - Admin Nexus
 * Comprehensive database management interface
 * Ported from legacy DisruptorsAdmin system
 */

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Users,
  Briefcase,
  BookOpen,
  MessageSquare,
  Mail,
  Target,
  Settings,
  Image,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield
} from 'lucide-react'
import SpreadsheetEditor from '@/components/admin/SpreadsheetEditor'
import { TABLE_SCHEMAS, getPriorityTables, getTableSchema } from '@/components/admin/TableSchemaManager'
import { customClient } from '@/lib/custom-sdk'

/**
 * Map table name to entity name for custom SDK
 */
const getEntityName = (tableName) => {
  const entityMap = {
    'posts': 'Post',
    'team_members': 'TeamMember',
    'services': 'Service',
    'case_studies': 'CaseStudy',
    'testimonials': 'Testimonial',
    'contact_submissions': 'ContactSubmission',
    'leads': 'Lead',
    'lead_interactions': 'LeadInteraction',
    'settings': 'Setting',
    'media': 'Media',
    'site_media': 'SiteMedia',
    'profiles': 'Profile',
    'page_views': 'PageView'
  }
  return entityMap[tableName] || tableName.charAt(0).toUpperCase() + tableName.slice(1, -1)
}

/**
 * Icon mapping for table types
 */
const ICON_MAP = {
  FileText,
  Users,
  Briefcase,
  BookOpen,
  MessageSquare,
  Mail,
  Target,
  Settings,
  Image
}

/**
 * DataManager Component
 * Main interface for managing all Supabase tables
 */
export default function DataManager() {
  const [activeTable, setActiveTable] = useState('posts')
  const [tableData, setTableData] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})
  const [stats, setStats] = useState({})

  const priorityTables = getPriorityTables()

  /**
   * Load data for a specific table
   */
  const loadTableData = async (tableName) => {
    setLoading(prev => ({ ...prev, [tableName]: true }))
    setErrors(prev => ({ ...prev, [tableName]: null }))

    try {
      // Use custom SDK to get entity
      const entityName = getEntityName(tableName)
      const entity = customClient.entities[entityName]

      const data = await entity.list('-created_at', 1000)

      setTableData(prev => ({ ...prev, [tableName]: data }))
      setStats(prev => ({ ...prev, [tableName]: { count: data.length, loaded: true } }))
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error)
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to load ${tableName}`
      }))
    } finally {
      setLoading(prev => ({ ...prev, [tableName]: false }))
    }
  }

  /**
   * Update a row in a table
   */
  const handleUpdate = async (tableName, rowId, updates) => {
    try {
      const entityName = getEntityName(tableName)
      const entity = customClient.entities[entityName]

      await entity.update(rowId, updates)

      // Reload data to reflect changes
      await loadTableData(tableName)

      return { success: true }
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error)
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to update record`
      }))
      return { success: false, error: error.message }
    }
  }

  /**
   * Create a new row in a table
   */
  const handleCreate = async (tableName, data) => {
    try {
      const entityName = getEntityName(tableName)
      const entity = customClient.entities[entityName]

      await entity.create(data)

      // Reload data to show new record
      await loadTableData(tableName)

      return { success: true }
    } catch (error) {
      console.error(`Error creating in ${tableName}:`, error)
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to create record`
      }))
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete a row from a table
   */
  const handleDelete = async (tableName, rowId) => {
    try {
      const entityName = getEntityName(tableName)
      const entity = customClient.entities[entityName]

      await entity.delete(rowId)

      // Remove from local state immediately
      setTableData(prev => ({
        ...prev,
        [tableName]: prev[tableName]?.filter(row => row.id !== rowId) || []
      }))

      return { success: true }
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error)
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to delete record`
      }))
      return { success: false, error: error.message }
    }
  }

  /**
   * Load data when active table changes
   */
  useEffect(() => {
    if (activeTable && !tableData[activeTable]) {
      loadTableData(activeTable)
    }
  }, [activeTable])

  /**
   * Initial load of first table
   */
  useEffect(() => {
    loadTableData('posts')
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Database Manager</h1>
        <p className="text-slate-400 text-sm">
          Direct access to all database tables with inline editing capabilities
        </p>
      </div>

      {/* Table Tabs */}
      <Tabs value={activeTable} onValueChange={setActiveTable} className="w-full">
        <TabsList className="bg-slate-900/50 border border-slate-800/50 flex-wrap h-auto p-2 gap-2">
          {priorityTables.map(tableName => {
            const schema = getTableSchema(tableName)
            const Icon = ICON_MAP[schema?.icon] || Database

            return (
              <TabsTrigger
                key={tableName}
                value={tableName}
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-slate-400 text-sm py-2"
              >
                <Icon className="w-4 h-4 mr-2" />
                {schema?.displayName}
                {stats[tableName]?.count !== undefined && (
                  <Badge variant="outline" className="ml-2 text-xs border-slate-700 text-slate-400 px-2 py-0.5">
                    {stats[tableName].count}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {priorityTables.map(tableName => {
          const schema = getTableSchema(tableName)

          return (
            <TabsContent key={tableName} value={tableName} className="mt-6">
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white font-semibold flex items-center text-lg">
                      {ICON_MAP[schema?.icon] &&
                        React.createElement(ICON_MAP[schema.icon], { className: "w-5 h-5 mr-2 text-blue-400" })
                      }
                      {schema?.displayName}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-500/30 text-xs px-2 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        RLS Enabled
                      </Badge>
                      <Badge variant="outline" className="text-slate-400 border-slate-700 text-xs px-2 py-1">
                        {schema?.columns?.length || 0} columns
                      </Badge>
                      <Button
                        onClick={() => loadTableData(tableName)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-400 hover:bg-slate-800/50"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-slate-400 text-sm mt-2">
                    {schema?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {errors[tableName] && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-red-400 font-semibold text-sm">Error loading data</div>
                        <div className="text-red-400/80 text-sm mt-1">{errors[tableName]}</div>
                        <Button
                          onClick={() => loadTableData(tableName)}
                          variant="outline"
                          size="sm"
                          className="mt-3 border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  )}

                  <SpreadsheetEditor
                    tableName={tableName}
                    columns={schema?.columns || []}
                    data={tableData[tableName] || []}
                    onUpdate={(rowId, updates) => handleUpdate(tableName, rowId, updates)}
                    onCreate={(data) => handleCreate(tableName, data)}
                    onDelete={(rowId) => handleDelete(tableName, rowId)}
                    isLoading={loading[tableName]}
                    error={errors[tableName]}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Help Text */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3 text-sm text-slate-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
            <div>
              <strong className="text-white">Usage Tips:</strong> Click any cell to edit inline. Changes save immediately.
              Use the SpreadsheetEditor controls to add new rows or delete existing ones. All operations respect Row Level Security (RLS) policies.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
