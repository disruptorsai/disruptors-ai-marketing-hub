import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, CheckCircle, AlertTriangle, RefreshCw, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSheetAnalysis, getCurrentColumnMapping, setColumnMapping } from '@/lib/google-sheets-service';
import { INTERNAL_FIELDS } from '@/lib/column-mapping-adapter';

export default function ColumnMappingConfig({ isOpen, onClose, onMappingUpdate }) {
  const [analysis, setAnalysis] = useState(null);
  const [customMapping, setCustomMapping] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAnalysis();
    }
  }, [isOpen]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const analysisResult = await getSheetAnalysis();
      const currentMapping = getCurrentColumnMapping();

      setAnalysis(analysisResult);
      setCustomMapping(currentMapping);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading sheet analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (internalField, selectedColumn) => {
    const newMapping = { ...customMapping };

    if (selectedColumn === '') {
      delete newMapping[internalField];
    } else {
      // Remove this column from other mappings to avoid duplicates
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === selectedColumn && key !== internalField) {
          delete newMapping[key];
        }
      });
      newMapping[internalField] = selectedColumn;
    }

    setCustomMapping(newMapping);
    setHasChanges(true);
  };

  const handleSaveMapping = () => {
    setColumnMapping(customMapping);
    setHasChanges(false);
    onMappingUpdate?.(customMapping);
    onClose();
  };

  const handleResetToAuto = () => {
    if (analysis?.autoMapping) {
      setCustomMapping(analysis.autoMapping);
      setHasChanges(true);
    }
  };

  const getConfidenceBadge = (field) => {
    if (!analysis?.suggestions) return null;

    const suggestion = analysis.suggestions.find(s => s.internalField === field.key);
    const confidence = suggestion?.confidence || 'None';

    const colorMap = {
      High: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-orange-100 text-orange-800',
      None: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={`text-xs ${colorMap[confidence]}`}>
        {confidence}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <CardHeader className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Column Mapping Configuration
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Map your Google Sheet columns to our blog management fields
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadAnalysis} size="sm" variant="outline" disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={onClose} size="sm" variant="ghost">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                  <p className="text-gray-600">Analyzing your Google Sheet structure...</p>
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Sheet Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Detected Columns</p>
                        <p className="font-semibold">{analysis.detectedHeaders?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Auto-Mapped Fields</p>
                        <p className="font-semibold">{Object.keys(analysis.autoMapping || {}).length}/11</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mapping Confidence</p>
                        <p className="font-semibold">{Math.round((analysis.mappingConfidence || 0) * 100)}%</p>
                      </div>
                    </div>

                    {analysis.validation?.errors?.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 text-red-800 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-semibold">Issues Found</span>
                        </div>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {analysis.validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleResetToAuto} size="sm" variant="outline">
                        Use Auto-Detected Mapping
                      </Button>
                      <p className="text-sm text-gray-600 flex items-center">
                        Detected columns: {analysis.detectedHeaders?.join(', ')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Column Mapping Interface */}
                <Card>
                  <CardHeader>
                    <CardTitle>Field Mapping</CardTitle>
                    <p className="text-sm text-gray-600">
                      Select which Google Sheet column corresponds to each blog field
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {INTERNAL_FIELDS.map(field => (
                        <div key={field.key} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <label className="font-medium text-gray-900">
                                {field.label}
                              </label>
                              {field.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {getConfidenceBadge(field)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Type: {field.type}
                              {field.options && ` (${field.options.join(', ')})`}
                            </p>
                          </div>

                          <div className="flex-1">
                            <select
                              value={customMapping[field.key] || ''}
                              onChange={(e) => handleMappingChange(field.key, e.target.value)}
                              className="w-full p-2 border rounded-md text-sm"
                            >
                              <option value="">-- Not Mapped --</option>
                              {analysis.detectedHeaders?.map(header => (
                                <option key={header} value={header}>
                                  {header}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-6 flex justify-center">
                            {customMapping[field.key] ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : field.required ? (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-200" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Unable to analyze sheet structure</p>
                <p className="text-sm text-gray-500">Make sure your sheet is accessible and try refreshing</p>
              </div>
            )}
          </CardContent>

          <div className="border-t border-gray-200 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {hasChanges && (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSaveMapping}
                disabled={!hasChanges || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Mapping
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}