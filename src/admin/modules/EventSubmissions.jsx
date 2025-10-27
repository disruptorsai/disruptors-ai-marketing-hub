/**
 * Event Submissions Module
 * Displays all event check-ins, lead captures, and form submissions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubmissionsManager from '@/components/admin/SubmissionsManager';

export default function EventSubmissions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
            Event Submissions
          </h1>
          <p className="text-white/60">
            Manage event check-ins, surveys, lead captures, and contact form submissions
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Submission Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-2">Event Check-ins</h3>
              <ul className="space-y-1 text-white/70">
                <li>• Survey System: /event-checkin page submissions</li>
                <li>• Kiosk System: Disruptors Connect physical check-ins</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Lead Generation</h3>
              <ul className="space-y-1 text-white/70">
                <li>• Lead Magnet signups with UTM tracking</li>
                <li>• Contact form submissions</li>
                <li>• Content access analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Manager Component */}
      <SubmissionsManager />
    </motion.div>
  );
}
