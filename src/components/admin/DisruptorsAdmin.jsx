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
  Smartphone,
  Shield,
  TrendingUp
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
    cpu_usage: 23,
    memory_usage: 45
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
      description: 'Manage all database tables and records',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500'
    },
    {
      id: 'blog',
      label: 'Blog Manager',
      icon: FileText,
      description: 'AI-powered content creation and publishing',
      gradient: 'from-blue-500 via-sky-500 to-cyan-500'
    },
    {
      id: 'media',
      label: 'Media Studio',
      icon: Image,
      description: 'Intelligent asset generation and management',
      gradient: 'from-pink-500 via-rose-500 to-red-500'
    },
    {
      id: 'seo',
      label: 'SEO Tools',
      icon: Zap,
      description: 'Keyword research and optimization',
      gradient: 'from-amber-500 via-yellow-500 to-orange-500'
    },
    {
      id: 'presentation',
      label: 'Presentation',
      icon: Smartphone,
      description: 'PWA and tablet optimization',
      gradient: 'from-amber-500 via-orange-500 to-yellow-500'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      description: 'Performance monitoring and insights',
      gradient: 'from-cyan-500 via-sky-500 to-blue-500'
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: Terminal,
      description: 'Advanced system controls',
      gradient: 'from-slate-500 via-gray-500 to-zinc-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-montreal">

      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-orange-500/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg blur opacity-50" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-lg rounded-lg shadow-xl">
                  D
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Disruptors Admin
                </h1>
                <p className="text-sm text-white/50 font-supply">
                  v3.1.0 • Neural Network Interface
                </p>
              </div>
            </div>

            {/* System Status and User Info */}
            <div className="flex items-center space-x-6">

              {/* System Status */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-white/70">Online</span>
                </div>
                <div className="text-white/50">
                  CPU: <span className="text-white/70 font-medium">{systemStats.cpu_usage}%</span>
                </div>
                <div className="text-white/50">
                  <span className="text-white/70 font-medium">{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* User Badge */}
              <div className="flex items-center space-x-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-950" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{username}</span>
                  <Badge variant="outline" className="border-amber-400/50 text-amber-400 text-[10px] px-1.5 py-0 w-fit">
                    ADMIN
                  </Badge>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="border-red-400/50 text-red-400 hover:bg-red-400/10 hover:border-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full mx-auto px-6 py-6">

        {/* Welcome Banner */}
        <Card className="mb-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Welcome back, {username}
                </h2>
                <p className="text-white/60">
                  All systems operational • Ready for deployment
                </p>
              </div>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-8">
                <div className="text-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <div className="text-2xl font-bold text-white">{systemStats.connections}</div>
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Connections</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <div className="text-2xl font-bold text-white">{systemStats.requests}</div>
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Requests</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-2 mb-1">
                    <Database className="w-4 h-4 text-blue-400" />
                    <div className="text-2xl font-bold text-white">{systemStats.storage}</div>
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Storage</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tabs */}
        <Tabs defaultValue="database" className="w-full">

          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-2 bg-slate-900/50 border border-white/10 mb-6 p-2 backdrop-blur-sm">
            {adminTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative flex flex-col items-center justify-center space-y-2 data-[state=active]:bg-white/10 text-white/60 hover:text-white transition-all py-4 rounded-lg group overflow-hidden"
                >
                  {/* Gradient Background on Active */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-0 group-data-[state=active]:opacity-10 transition-opacity`} />

                  {/* Icon with Gradient */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-lg blur opacity-0 group-data-[state=active]:opacity-50 transition-opacity`} />
                    <div className={`relative p-2 rounded-lg bg-gradient-to-br ${tab.gradient} opacity-50 group-data-[state=active]:opacity-100 transition-opacity`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Label */}
                  <span className="text-xs font-medium hidden lg:block">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-300">

            {/* Database Tab */}
            <TabsContent value="database" className="space-y-4">
              <DataManager />
            </TabsContent>

            {/* Blog Manager Tab */}
            <TabsContent value="blog" className="space-y-4">
              <AdminBlogManager />
            </TabsContent>

            {/* Media Studio Tab */}
            <TabsContent value="media" className="space-y-4">
              <IntelligentMediaStudio />
            </TabsContent>

            {/* SEO Tools Tab */}
            <TabsContent value="seo" className="space-y-4">
              <SEOKeywordResearch />
            </TabsContent>

            {/* Presentation Mode Tab */}
            <TabsContent value="presentation" className="space-y-4">
              <PresentationModeControl />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${adminTabs[5].gradient}`}>
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">System Analytics</CardTitle>
                      <CardDescription className="text-white/60">
                        Performance monitoring and insights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-16">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${adminTabs[5].gradient} flex items-center justify-center opacity-50`}>
                      <Activity className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-xl font-medium text-white/80 mb-2">Analytics Dashboard</p>
                    <p className="text-white/50">Coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terminal Tab */}
            <TabsContent value="terminal" className="space-y-4">
              <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm">
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${adminTabs[6].gradient}`}>
                      <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">Command Center</CardTitle>
                      <CardDescription className="text-white/60">
                        Direct system command interface
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-16">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${adminTabs[6].gradient} flex items-center justify-center opacity-50`}>
                      <Terminal className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-xl font-medium text-white/80 mb-2">Terminal Interface</p>
                    <p className="text-white/50">Coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* Footer Status Bar */}
      <div className="hidden xl:block fixed bottom-0 left-0 right-0 bg-slate-950/80 border-t border-white/10 backdrop-blur-xl z-10">
        <div className="max-w-full mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-xs text-white/50 font-supply">
            <div className="flex items-center space-x-6">
              <span>STATUS: <span className="text-emerald-400">OPTIMAL</span></span>
              <span>UPTIME: {systemStats.uptime}</span>
              <span>MEMORY: {systemStats.memory_usage}%</span>
            </div>
            <div className="flex items-center space-x-6">
              <span>CPU: {systemStats.cpu_usage}%</span>
              <span>NETWORK: <span className="text-emerald-400">SECURE</span></span>
              <span>© 2025 Disruptors AI</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DisruptorsAdmin;
