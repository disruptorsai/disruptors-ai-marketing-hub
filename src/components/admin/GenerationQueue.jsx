import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Clock, Zap, FileText, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-400',
    bgColor: 'bg-gray-100',
    label: 'Pending'
  },
  extracting: {
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    label: 'Extracting Keywords'
  },
  preparing: {
    icon: Zap,
    color: 'text-cyan-0',
    bgColor: 'bg-cyan-50',
    label: 'Preparing Request'
  },
  generating: {
    icon: Loader2,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    label: 'Generating Content',
    animate: true
  },
  processing: {
    icon: Loader2,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    label: 'Processing Response',
    animate: true
  },
  waiting: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    label: 'Rate Limiting'
  },
  complete: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    label: 'Complete'
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    label: 'Error'
  }
};

const QueueItem = ({ post, status = 'pending', message = '', index }) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-xl border ${config.bgColor} border-gray-200 transition-all duration-300`}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`mt-0.5 ${config.color}`}>
          <Icon
            className={`w-5 h-5 ${config.animate ? 'animate-spin' : ''}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
            {post.title}
          </h4>

          {/* Status Label & Message */}
          <div className="space-y-1">
            <p className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </p>
            {message && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Badge */}
        {status !== 'pending' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor} whitespace-nowrap`}
          >
            {status === 'complete' ? '✓' : status === 'error' ? '✗' : '...'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function GenerationQueue({ queueItems, currentIndex, totalPosts }) {
  const completedCount = queueItems.filter(item => item.status === 'complete').length;
  const errorCount = queueItems.filter(item => item.status === 'error').length;
  const progressPercent = totalPosts > 0 ? (completedCount / totalPosts) * 100 : 0;

  // Calculate estimated time remaining
  const remainingPosts = totalPosts - completedCount - errorCount;
  const estimatedMinutes = Math.ceil((remainingPosts * 30) / 60); // ~30 seconds per post

  return (
    <Card className="bg-white/90 backdrop-blur-md border-indigo-200 shadow-xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Generation Queue
          </h3>
          <div className="text-sm font-medium text-gray-600">
            {completedCount + errorCount} / {totalPosts}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-indigo-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="font-medium">{completedCount} completed</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-600">
                <XCircle className="w-3.5 h-3.5" />
                <span className="font-medium">{errorCount} failed</span>
              </div>
            )}
            {remainingPosts > 0 && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">~{estimatedMinutes} min remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* Queue Items */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {queueItems.map((item, index) => (
              <QueueItem
                key={item.post.id}
                post={item.post}
                status={item.status}
                message={item.message}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Info Box */}
        {remainingPosts === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-green-900">Generation Complete!</p>
                <p className="text-green-700 text-xs mt-1">
                  {completedCount} article{completedCount !== 1 ? 's' : ''} generated successfully.
                  {errorCount > 0 && ` ${errorCount} failed - check console for details.`}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Warning Box for Errors */}
        {errorCount > 0 && remainingPosts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900">Some Errors Occurred</p>
                <p className="text-amber-700 text-xs mt-1">
                  {errorCount} article{errorCount !== 1 ? 's' : ''} failed to generate. Continuing with remaining posts...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </Card>
  );
}
