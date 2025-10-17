import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Terminal,
  Image,
  Database,
  Activity,
  Zap,
  LogOut,
  User,
  FileText,
  Smartphone
} from 'lucide-react';
import DataManager from './DataManager';
import IntelligentMediaStudio from './IntelligentMediaStudio';
import SEOKeywordResearch from './SEOKeywordResearch';
import AdminBlogManager from './AdminBlogManager';
import PresentationModeControl from './PresentationModeControl';

const DisruptorsAdmin = ({ username, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStats] = useState({
    uptime: '47:23:12',
    connections: 12,
    requests: 1547,
    storage: '78.3 GB',
    neural_load: 23
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const adminTabs = [
    {
      id: 'database',
      label: 'Data Manager',
      icon: Database,
      description: 'Manage all Supabase database tables',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'blog',
      label: 'Blog Manager',
      icon: FileText,
      description: 'AI-powered blog content management system',
      color: 'from-indigo-500 to-cyan-0'
    },
    {
      id: 'media',
      label: 'Intelligent Media Studio',
      icon: Image,
      description: 'AI-powered media generation with context awareness',
      color: 'from-cyan-0 to-pink-500'
    },
    {
      id: 'seo',
      label: 'SEO Keywords',
      icon: Zap,
      description: 'Keyword research with DataForSEO',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'presentation',
      label: 'Presentation Mode',
      icon: Smartphone,
      description: 'PWA download and tablet optimization',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics',
      label: 'System Analytics',
      icon: Activity,
      description: 'Monitor performance and usage',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'terminal',
      label: 'Command Center',
      icon: Terminal,
      description: 'Advanced system controls',
      color: 'from-gray-500 to-gray-700'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">

      {/* Matrix Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #00ff00 1px, transparent 0),
              linear-gradient(45deg, transparent 40%, #00ff0010 40%, #00ff0010 60%, transparent 60%)
            `,
            backgroundSize: '20px 20px, 40px 40px'
          }}
        />
      </div>

      {/* Compact Header */}
      <div className="relative z-10 border-b border-green-400/30 bg-black/95 backdrop-blur-sm">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between">

            {/* Logo and Title - Compact */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-400 flex items-center justify-center text-black font-bold text-sm">
                D
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-400">DISRUPTORS NEURAL NETWORK</h1>
                <p className="text-green-400/80 text-xs">ADMIN v3.0.1</p>
              </div>
            </div>

            {/* User Info and Controls - Compact */}
            <div className="flex items-center space-x-4">

              {/* System Status - Compact */}
              <div className="hidden lg:flex items-center space-x-3 text-xs text-green-400">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>ONLINE</span>
                </div>
                <div>LOAD: {systemStats.neural_load}%</div>
                <div>{currentTime.toLocaleTimeString()}</div>
              </div>

              {/* User Badge - Compact */}
              <div className="flex items-center space-x-2 bg-green-400/10 border border-green-400/30 rounded px-2 py-1">
                <User className="w-3 h-3" />
                <span className="text-xs text-green-400">{username}</span>
                <Badge variant="outline" className="border-green-400 text-green-400 text-[10px] px-1 py-0">
                  ADMIN
                </Badge>
              </div>

              {/* Logout - Compact */}
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="border-red-400 text-red-400 hover:bg-red-400/20 h-7 px-2 text-xs"
              >
                <LogOut className="w-3 h-3 mr-1" />
                EXIT
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Maximized Space */}
      <div className="relative z-10 w-full mx-auto px-4 py-3 pb-8 xl:pb-6">

        {/* Compact Welcome Banner */}
        <Card className="mb-3 bg-green-400/5 border-green-400/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-green-400 mb-0.5">
                  WELCOME, {username.toUpperCase()}
                </h2>
                <p className="text-xs text-green-400">
                  All systems operational
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4 text-xs">
                <div className="text-center">
                  <div className="text-green-400 font-bold">{systemStats.connections}</div>
                  <div className="text-green-400/80">CONNECTIONS</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{systemStats.requests}</div>
                  <div className="text-green-400/80">REQUESTS</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">{systemStats.storage}</div>
                  <div className="text-green-400/80">STORAGE</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tabs */}
        <Tabs defaultValue="database" className="w-full">

          {/* Compact Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-1 bg-black/70 border border-green-400/30 mb-3 p-1">
            {adminTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center justify-center space-x-1 data-[state=active]:bg-green-400/20 data-[state=active]:text-green-400 text-green-400 hover:text-green-300 transition-colors py-1.5 text-xs"
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Database Tab - Data Manager */}
          <TabsContent value="database" className="space-y-3">
            <DataManager />
          </TabsContent>

          {/* Blog Manager Tab */}
          <TabsContent value="blog" className="space-y-3">
            <AdminBlogManager />
          </TabsContent>

          {/* Intelligent Media Studio Tab */}
          <TabsContent value="media" className="space-y-3">
            <IntelligentMediaStudio />
          </TabsContent>

          {/* SEO Keywords Tab */}
          <TabsContent value="seo" className="space-y-3">
            <SEOKeywordResearch />
          </TabsContent>

          {/* Presentation Mode Tab */}
          <TabsContent value="presentation" className="space-y-3">
            <PresentationModeControl />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-3">
            <Card className="bg-black/70 border-green-400/30">
              <CardHeader className="p-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded bg-gradient-to-r ${adminTabs[5].color} flex items-center justify-center`}>
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-green-400 text-sm">System Analytics</CardTitle>
                    <CardDescription className="text-green-400/80 text-xs">
                      Performance monitoring
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-center py-8 text-green-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-mono">ANALYTICS INTERFACE</p>
                  <p className="text-xs text-green-400/80">Coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terminal Tab */}
          <TabsContent value="terminal" className="space-y-3">
            <Card className="bg-black/70 border-green-400/30">
              <CardHeader className="p-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded bg-gradient-to-r ${adminTabs[6].color} flex items-center justify-center`}>
                    <Terminal className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-green-400 text-sm">Command Center</CardTitle>
                    <CardDescription className="text-green-400/80 text-xs">
                      Direct command interface
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-center py-8 text-green-400">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-mono">TERMINAL INTERFACE</p>
                  <p className="text-xs text-green-400/80">Coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Minimal Footer Status - Only on large screens */}
      <div className="hidden xl:block fixed bottom-0 left-0 right-0 bg-black/95 border-t border-green-400/30">
        <div className="max-w-full mx-auto px-4 py-1">
          <div className="flex items-center justify-between text-[10px] text-green-400/80">
            <div className="flex items-center space-x-3">
              <span>STATUS: OPTIMAL</span>
              <span>UPTIME: {systemStats.uptime}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>CPU: {systemStats.neural_load}%</span>
              <span>NET: SECURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Matrix Styling */}
      <style>{`
        /* Matrix-style glow effects */
        .glow-green {
          box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 40px #00ff00;
        }

        /* Subtle scan line animation - less intrusive */
        @keyframes matrix-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .matrix-scanline {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent);
          animation: matrix-scan 4s linear infinite;
          pointer-events: none;
          z-index: 100;
          opacity: 0.5;
        }

        /* Better text rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      {/* Animated Scan Line */}
      <div className="matrix-scanline" />

    </div>
  );
};

export default DisruptorsAdmin;