
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserIcon, BrainCircuit, Calendar, FileText, Share2, MessagesSquare, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("index"), // Changed from createPageUrl("Home")
    icon: LayoutDashboard,
  },
  {
    title: "AI Content Agents",
    url: createPageUrl("AIAgents"),
    icon: BrainCircuit,
  },
  {
    title: "Blog Library",
    url: createPageUrl("BlogLibrary"),
    icon: FileText,
  },
  {
    title: "Social Post Library",
    url: createPageUrl("SocialPostLibrary"),
    icon: Share2,
  },
  {
    title: "Content Calendar",
    url: createPageUrl("ContentCalendar"),
    icon: Calendar,
  },
  {
    title: "Team Chat",
    url: createPageUrl("TeamChat"),
    icon: MessagesSquare,
  },
];

const profileItem = {
  title: "My Profile",
  url: createPageUrl("Profile"),
  icon: UserIcon,
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
      <SidebarProvider>
        <style jsx global>{`
          /* Minimalist styling */
          body {
            background-color: #f8fafc; /* slate-50 */
            font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            font-weight: 400;
            line-height: 1.5;
            color: #0a0a0a;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          h1, h2, h3, h4, h5, h6, .font-sans {
            font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            font-weight: 600;
          }

          .font-serif {
            font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          }
        `}</style>
        <div className="min-h-screen flex w-full max-w-full overflow-hidden">
          <Sidebar className="border-r border-slate-200 bg-white">
            <SidebarHeader className="border-b p-4">
              <Link to={createPageUrl("index")} className="flex items-center justify-center">
                <BrainCircuit className="h-8 w-8 text-slate-800" />
                <h1 className="text-xl font-bold text-slate-800 ml-2">AI Platform</h1>
              </Link>
            </SidebarHeader>
            
            <SidebarContent className="p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent className="space-y-1">
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`group relative rounded-md mb-1 transition-all duration-200 font-sans ${
                              location.pathname === item.url 
                                ? 'bg-slate-100 text-slate-900' 
                                : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-2.5 relative">
                              {location.pathname === item.url && (
                                <div className="absolute left-0 top-2 bottom-2 w-1 bg-slate-800 rounded-r-full"></div>
                              )}
                              <item.icon className={`w-5 h-5 transition-colors relative z-10 ${
                                location.pathname === item.url ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'
                              }`} />
                              <span className="font-medium relative z-10">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </div>

              <div className="mt-auto">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                </div>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`group relative rounded-md mb-1 transition-all duration-200 font-sans ${
                        location.pathname === profileItem.url 
                          ? 'bg-slate-100 text-slate-900' 
                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Link to={profileItem.url} className="flex items-center gap-3 px-4 py-2.5 relative">
                        {location.pathname === profileItem.url && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-slate-800 rounded-r-full"></div>
                        )}
                        <profileItem.icon className={`w-5 h-5 transition-colors ${
                          location.pathname === profileItem.url ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600'
                        }`} />
                        <span className="font-medium">{profileItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 bg-slate-50 overflow-hidden min-w-0">
            <header className="bg-white backdrop-blur-xl border-b border-slate-200 px-4 py-4 md:hidden sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 flex-shrink-0" />
                <h1 className="text-xl font-bold text-slate-800 truncate font-sans">AI Platform</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto w-full h-full">
              <div className="w-full max-w-full h-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
  );
}
