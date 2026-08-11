"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { COURSE } from "@/lib/constants";
import { getProfessorHistory, getSessionDetails } from "@/app/actions/reports";
import ThemeToggle from "@/components/ThemeToggle";

interface SessionRecord {
  id: string;
  date: string;
  present: number;
  absent: number;
  percentage: string;
  active: boolean;
}

interface StudentStatus {
  rollNo: string;
  name: string;
  status: "PRESENT" | "ABSENT";
}

interface UserProps {
  name: string;
  email: string;
  image: string | null;
}

interface Props {
  onSignOut: () => Promise<void>;
  user: UserProps;
}

export default function ProfessorHistoryClient({ onSignOut, user }: Props) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<StudentStatus[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getProfessorHistory();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load professor sessions history:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!selectedSession) return;
    
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await getSessionDetails(selectedSession);
        setStudentsList(details);
      } catch (err) {
        console.error("Failed to load session details:", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedSession]);

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Simplified, Clean Header Navbar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-95/30 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block">Attendance Tracker</span>
          </div>

          {/* Clean Navigation Links & Theme Toggle & Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-6">
            <nav className="flex items-center gap-3 sm:gap-5">
              <Link
                href="/professor/dashboard"
                className="text-sm font-bold transition-all px-1 py-1 text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Attendance
              </Link>
              <Link
                href="/professor/history"
                className="text-sm font-bold transition-all px-1 py-1 text-slate-905 dark:text-white border-b-2 border-slate-900 dark:border-white"
              >
                History
              </Link>
            </nav>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Dropdown Trigger */}
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
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-355 truncate pr-2 flex-1 text-left" title={user.email}>
                        {user.email}
                      </span>
                      <button 
                        onClick={() => setShowProfileDropdown(false)} 
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-sm font-bold cursor-pointer p-0.5 flex-shrink-0"
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

      {/* Centered Course Title Layout */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-8 px-6 md:px-8 text-center transition-colors">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{COURSE.name}</h1>
        </div>
      </div>

      {/* Main Content History Sheet */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-900 max-w-4xl w-full mx-auto transition-colors">
        {loadingSessions ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Loading sessions history...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Sessions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conducted Sessions</h2>
                <a 
                  href="https://docs.google.com/spreadsheets/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                  </svg>
                  Open Google Sheets
                </a>
              </div>
              {sessions.length > 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4 text-center">Present / Absent</th>
                        <th className="py-3.5 px-4 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {sessions.map((sessionRecord) => (
                        <tr
                          key={sessionRecord.id}
                          onClick={() => setSelectedSession(sessionRecord.id)}
                          className={`text-sm font-semibold transition-colors cursor-pointer ${
                            selectedSession === sessionRecord.id 
                              ? "bg-blue-50/50 dark:bg-blue-955/20 text-primary dark:text-blue-400 border-l-4 border-primary dark:border-blue-500" 
                              : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors">
                              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span>{sessionRecord.date}</span>
                              {sessionRecord.active && (
                                <span className="inline-flex items-center gap-1 text-xxs font-bold text-emerald-600 dark:text-emerald-450 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{sessionRecord.present}</span>
                            <span className="text-slate-300 dark:text-slate-600 px-1.5">|</span>
                            <span className="text-rose-500 dark:text-rose-400 font-bold">{sessionRecord.absent}</span>
                          </td>
                          <td className="py-4 px-4 text-right font-extrabold text-slate-900 dark:text-white">{sessionRecord.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
                  <p className="text-sm font-semibold">No sessions conducted yet.</p>
                </div>
              )}
            </div>

            {/* Right: Selected Session Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedSession
                  ? `Check-in Sheet: ${sessions.find((s) => s.id === selectedSession)?.date.split(",")[0]}`
                  : "Session Details"}
              </h2>

              {selectedSession ? (
                loadingDetails ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-[320px] gap-2 shadow-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading check-in list...</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm max-h-[440px] overflow-y-auto transition-colors">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider sticky top-0 z-10">
                          <th className="py-3.5 px-4">Roll No</th>
                          <th className="py-3.5 px-4">Student Name</th>
                          <th className="py-3.5 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {studentsList.map((student) => (
                          <tr key={student.rollNo} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xxs font-bold border border-slate-200/50 dark:border-slate-800">
                                  #
                                </span>
                                {student.rollNo}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-955/40 text-primary dark:text-blue-400 flex items-center justify-center text-xxs font-bold uppercase border border-blue-100 dark:border-blue-900/30">
                                  {student.name.charAt(0)}
                                </div>
                                <span>{student.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xxs font-bold rounded-full border ${
                                  student.status === "PRESENT"
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-455 border-emerald-200 dark:border-emerald-900/30"
                                    : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border-rose-200 dark:border-rose-900/30"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === "PRESENT" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 h-[320px] shadow-sm transition-colors">
                  <svg
                    className="w-12 h-12 mb-3 text-slate-350 dark:text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Select a session from the list to view check-ins.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-semibold text-slate-405 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
        Made with 🍵 by Abhishek
      </footer>
    </div>
  );
}
