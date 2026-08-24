import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import SpreadsheetEditor from './SpreadsheetEditor';
import { TABLE_SCHEMAS, getPriorityTables, getTableSchema } from './TableSchemaManager';
import { customClient } from '@/lib/custom-sdk';

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
    'profiles': 'Profile',
    'page_views': 'PageView'
  };
  return entityMap[tableName] || tableName.charAt(0).toUpperCase() + tableName.slice(1, -1);
};

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
};

/**
 * DataManager Component
 * Main interface for managing all Supabase tables
 */
const DataManager = () => {
  const [activeTable, setActiveTable] = useState('posts');
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({});

  const priorityTables = getPriorityTables();

  /**
   * Load data for a specific table
   */
  const loadTableData = async (tableName) => {
    setLoading(prev => ({ ...prev, [tableName]: true }));
    setErrors(prev => ({ ...prev, [tableName]: null }));

    try {
      // Use custom SDK to get entity
      const entityName = getEntityName(tableName);
      const entity = customClient.entities[entityName];

      const data = await entity.list('-created_at', 1000);

      setTableData(prev => ({ ...prev, [tableName]: data }));
      setStats(prev => ({ ...prev, [tableName]: { count: data.length, loaded: true } }));
    } catch (error) {
      console.error(`Error loading ${tableName}:`, error);
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to load ${tableName}`
      }));
    } finally {
      setLoading(prev => ({ ...prev, [tableName]: false }));
    }
  };

  /**
   * Update a row in a table
   */
  const handleUpdate = async (tableName, rowId, updates) => {
    try {
      const entityName = getEntityName(tableName);
      const entity = customClient.entities[entityName];

      await entity.update(rowId, updates);

      // Reload data to reflect changes
      await loadTableData(tableName);

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to update record`
      }));
      return { success: false, error: error.message };
    }
  };

  /**
   * Create a new row in a table
   */
  const handleCreate = async (tableName, data) => {
    try {
      const entityName = getEntityName(tableName);
      const entity = customClient.entities[entityName];

      await entity.create(data);

      // Reload data to show new record
      await loadTableData(tableName);

      return { success: true };
    } catch (error) {
      console.error(`Error creating in ${tableName}:`, error);
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to create record`
      }));
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete a row from a table
   */
  const handleDelete = async (tableName, rowId) => {
    try {
      const entityName = getEntityName(tableName);
      const entity = customClient.entities[entityName];

      await entity.delete(rowId);

      // Remove from local state immediately
      setTableData(prev => ({
        ...prev,
        [tableName]: prev[tableName]?.filter(row => row.id !== rowId) || []
      }));

      return { success: true };
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      setErrors(prev => ({
        ...prev,
        [tableName]: error.message || `Failed to delete record`
      }));
      return { success: false, error: error.message };
    }
  };

  /**
   * Load data when active table changes
   */
  useEffect(() => {
    if (activeTable && !tableData[activeTable]) {
      loadTableData(activeTable);
    }
  }, [activeTable]);

  /**
   * Initial load of first table
   */
  useEffect(() => {
    loadTableData('posts');
  }, []);

  return (
    <div className="space-y-3">
      {/* Table Tabs */}
      <Tabs value={activeTable} onValueChange={setActiveTable} className="w-full">
        <TabsList className="bg-black/70 border border-green-400/30 flex-wrap h-auto p-1 gap-1">
          {priorityTables.map(tableName => {
            const schema = getTableSchema(tableName);
            const Icon = ICON_MAP[schema?.icon] || Database;

            return (
              <TabsTrigger
                key={tableName}
                value={tableName}
                className="data-[state=active]:bg-green-400/20 data-[state=active]:text-green-400 text-green-400 text-xs py-1.5"
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {schema?.displayName}
                {stats[tableName]?.count !== undefined && (
                  <Badge variant="outline" className="ml-1.5 text-[10px] border-green-400/50 text-green-400 px-1 py-0">
                    {stats[tableName].count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {priorityTables.map(tableName => {
          const schema = getTableSchema(tableName);

          return (
            <TabsContent key={tableName} value={tableName} className="mt-3">
              <Card className="bg-black/70 border-green-400/30">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-400 font-mono flex items-center text-sm">
                      {ICON_MAP[schema?.icon] &&
                        React.createElement(ICON_MAP[schema.icon], { className: "w-4 h-4 mr-2" })
                      }
                      {schema?.displayName}
                    </CardTitle>
                    <div className="flex items-center space-x-1.5">
                      <Badge variant="outline" className="text-green-400 border-green-400/50 text-[10px] px-1.5 py-0">
                        <Shield className="w-2.5 h-2.5 mr-0.5" />
                        RLS
                      </Badge>
                      <Badge variant="outline" className="text-green-400 border-green-400/50 text-[10px] px-1.5 py-0">
                        {schema?.columns?.length || 0} cols
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-green-400/80 text-xs mt-1">
                    {schema?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {errors[tableName] && (
                    <div className="mb-3 bg-red-900/20 border border-red-400 rounded p-2 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-red-400 font-semibold text-xs">Error loading data</div>
                        <div className="text-red-400/80 text-xs mt-0.5">{errors[tableName]}</div>
                        <Button
                          onClick={() => loadTableData(tableName)}
                          variant="outline"
                          size="sm"
                          className="mt-1.5 border-red-400 text-red-400 hover:bg-red-400/20 h-6 text-xs"
                        >
                          <RefreshCw className="w-2.5 h-2.5 mr-1" />
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
          );
        })}
      </Tabs>

      {/* Help Text - Compact */}
      <Card className="bg-black/70 border-green-400/30">
        <CardContent className="p-2">
          <div className="flex items-start space-x-1.5 text-xs text-green-400/80">
            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-green-400">Tips:</strong> Click cells to edit inline. Changes save immediately. RLS policies enforced.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManager;
