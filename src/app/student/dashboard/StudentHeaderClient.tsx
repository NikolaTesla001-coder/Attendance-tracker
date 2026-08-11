"use client";

import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

interface UserProps {
  name: string;
  email: string;
  image: string | null;
}

interface Props {
  onSignOut: () => Promise<void>;
  user: UserProps;
}

export default function StudentHeaderClient({ onSignOut, user }: Props) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-955/30 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block">Attendance Tracker</span>
        </div>

        {/* Clean Student Portal indicators & Theme Toggle & Dropdown */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-550 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
            Student
          </span>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 overflow-hidden flex items-center justify-center cursor-pointer focus:outline-none transition-transform active:scale-95 bg-slate-900"
            >
              {user.image && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.image} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white text-xs font-extrabold uppercase">
                  {user.name.charAt(0)}
                </span>
              )}
            </button>

            {/* Styled like Google Profile Account Popover (Matches Screenshot) */}
            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-slate-200/60 dark:border-slate-700 bg-[#eef2f6] dark:bg-slate-800 p-5 shadow-2xl z-20 flex flex-col items-center text-center space-y-4 animate-fade-in">
                  
                  {/* Top Row: Flex layout avoiding overlaps */}
                  <div className="w-full flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 truncate pr-2 flex-1 text-left" title={user.email}>
                      {user.email}
                    </span>
                    <button 
                      onClick={() => setShowProfileDropdown(false)} 
                      className="text-slate-500 hover:text-slate-850 dark:hover:text-white text-sm font-bold cursor-pointer p-0.5 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Circular Avatar with custom Google colors gradient border */}
                  <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-blue-500 shadow-md">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-0.5 overflow-hidden flex items-center justify-center">
                      {user.image && !imageError ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={user.image} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          onError={() => setImageError(true)}
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-900 dark:bg-slate-950 flex items-center justify-center text-white text-2xl font-bold uppercase">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Greeting Header */}
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Hi, {user.name.split(" ")[0]}!
                  </div>

                  {/* Pill Sign Out Button styled like "Manage your Google Account" */}
                  <button
                    onClick={async () => {
                      setShowProfileDropdown(false);
                      await onSignOut();
                    }}
                    className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-55 text-[#0b57d0] dark:text-blue-400 font-bold text-xs transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
