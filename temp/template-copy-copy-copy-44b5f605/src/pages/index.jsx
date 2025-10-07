import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, FileText, Share2, Calendar, MessagesSquare, ArrowRight } from 'lucide-react';

const features = [
    {
        title: "AI Content Agents",
        description: "Engage with specialized AI to generate platform-specific content.",
        icon: BrainCircuit,
        url: createPageUrl("AIAgents"),
        color: "pcc-text-blue" // This color will no longer be used directly in the card title or icon hover effect, but keeping it in the data for potential future use or if other parts of the app rely on it.
    },
    {
        title: "Blog Library",
        description: "Manage, review, and schedule all generated blog articles.",
        icon: FileText,
        url: createPageUrl("BlogLibrary"),
        color: "pcc-text-coral"
    },
    {
        title: "Social Post Library",
        description: "Organize and approve AI-generated social media content.",
        icon: Share2,
        url: createPageUrl("SocialPostLibrary"),
        color: "pcc-text-green"
    },
    {
        title: "Content Calendar",
        description: "Get a global view of all scheduled blog and social content.",
        icon: Calendar,
        url: createPageUrl("ContentCalendar"),
        color: "pcc-text-yellow"
    },
    {
        title: "Team Chat",
        description: "Collaborate with your team and PCC admins in real-time.",
        icon: MessagesSquare,
        url: createPageUrl("TeamChat"),
        color: "pcc-text-brown"
    }
];

export default function Index() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
        {/* Removed the PCC logo image */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2 font-sans">
          Welcome to the AI Agent Center
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Your central hub for creating, managing, and deploying content across all digital channels.
        </p>
        <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-slate-800 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link to={feature.url} key={feature.title}>
            <Card className="group h-full bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-lg font-bold font-sans text-slate-800`}>{feature.title}</CardTitle>
                <feature.icon className={`h-8 w-8 text-slate-300 group-hover:text-slate-500 transition-colors`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  Go to {feature.title}
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}