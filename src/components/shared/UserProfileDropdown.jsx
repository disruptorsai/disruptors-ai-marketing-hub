/**
 * UserProfileDropdown - User account menu in navigation
 *
 * Features:
 * - Shows user's first initial or business logo
 * - Dropdown menu with account options
 * - Links to Business Brain Manager, Settings, etc.
 * - Logout functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Brain,
  LogOut,
  FileText,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { BrainAPI } from '@/lib/brain-api';
import { createPageUrl } from '@/utils';

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userBrain, setUserBrain] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get current user
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserBrain(session.user.id);
      } else {
        setUserBrain(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    if (session?.user) {
      loadUserBrain(session.user.id);
    }
  };

  const loadUserBrain = async (userId) => {
    try {
      const brain = await BrainAPI.getBrainByUser(userId);
      setUserBrain(brain);
    } catch (error) {
      console.error('Error loading brain:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!user) return null;

  // Get display info
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const logoUrl = userBrain?.logo_urls?.[0];

  const menuItems = [
    {
      icon: Brain,
      label: 'Business Brain',
      path: '/app/business-brain',
      description: 'Manage your AI knowledge base'
    },
    {
      icon: FileText,
      label: 'AI Content Writer',
      path: '/app/content-writer',
      description: 'Generate AI content'
    },
    {
      icon: User,
      label: 'Account Settings',
      path: '/account',
      description: 'Manage your profile'
    },
    {
      icon: Settings,
      label: 'Preferences',
      path: '/settings',
      description: 'App preferences'
    }
  ];

  const handleMenuClick = (item) => {
    console.log('👤 [USER_PROFILE_DROPDOWN] Menu item clicked:', {
      label: item.label,
      path: item.path,
      fullPath: createPageUrl(item.path)
    });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-12 px-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 group"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold shadow-lg">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm">{initial}</span>
          )}
        </div>

        {/* Name (hidden on small screens) */}
        <span className="hidden xl:inline text-sm font-medium text-white">
          {displayName.split(' ')[0]}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold shadow-lg flex-shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">{initial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{displayName}</p>
                  <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  {userBrain && (
                    <p className="text-xs text-gold-shine mt-0.5 truncate">
                      {userBrain.business_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    onClick={() => handleMenuClick(item)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-900/20 transition-colors group"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                <span className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
                  Sign Out
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
