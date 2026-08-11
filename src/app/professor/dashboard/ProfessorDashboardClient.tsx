"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { COURSE } from "@/lib/constants";
import { startSession, endSession, getActiveSessionState } from "@/app/actions/session";
import { getProfessorSummaryStats } from "@/app/actions/reports";
import ThemeToggle from "@/components/ThemeToggle";

interface SessionState {
  id: string;
  token: string;
  expiresAt: string;
  active: boolean;
  presentCount: number;
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

export default function ProfessorDashboardClient({ onSignOut, user }: Props) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 77,
    presentToday: 0,
    overallRate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const activeSession = await getActiveSessionState();
      if (activeSession) {
        setSession(activeSession);
        const expiresTime = new Date(activeSession.expiresAt).getTime();
        const diff = Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
        setTimeLeft(diff);
      } else {
        setSession(null);
        setTimeLeft(0);
        setQrDataUrl("");
      }

      // Fetch dynamic stats summary
      const summary = await getProfessorSummaryStats();
      setSummaryStats(summary);
    } catch (err) {
      console.error("Failed to load active session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!session || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          refreshSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeLeft, refreshSession]);

  useEffect(() => {
    if (session?.token) {
      const qrUrl = `${window.location.origin}/attendance/${session.token}`;
      QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [session]);

  const handleStartAttendance = async () => {
    setLoading(true);
    try {
      const newSession = await startSession();
      const sessionState: SessionState = {
        ...newSession,
        presentCount: 0,
      };
      setSession(sessionState);

      const expiresTime = new Date(newSession.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiresTime - Date.now()) / 1000));
      setTimeLeft(diff);
    } catch (err) {
      console.error("Error starting attendance session:", err);
      alert("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndAttendance = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await endSession(session.id);
      setSession(null);
      setTimeLeft(0);
      setQrDataUrl("");
    } catch (err) {
      console.error("Error ending session:", err);
      alert("Failed to end session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading && !session) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Loading Professor Portal...</p>
        </div>
      </div>
    );
  }

  const registeredCount = summaryStats.totalStudents;
  const isSessionActive = session && timeLeft > 0;

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Simplified, Clean Header Navbar */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">Attendance Tracker</span>
          </div>

          {/* Clean Navigation Links & Theme Toggle & Profile Dropdown */}
          <div className="flex items-center" style={{ gap: "24px" }}>
            <nav className="flex items-center" style={{ gap: "24px" }}>
              <Link
                href="/professor/dashboard"
                className="text-sm font-bold transition-all px-1 py-1 text-slate-905 dark:text-white border-b-2 border-slate-900 dark:border-white"
              >
                Attendance
              </Link>
              <Link
                href="/professor/history"
                className="text-sm font-bold transition-all px-1 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                History
              </Link>
            </nav>

            {/* Reusable Theme Toggle Button */}
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
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-350 truncate pr-2 flex-1 text-left" title={user.email}>
                        {user.email}
                      </span>
                      <button 
                        onClick={() => setShowProfileDropdown(false)} 
                        className="text-slate-505 hover:text-slate-800 dark:hover:text-white text-sm font-bold cursor-pointer p-0.5 flex-shrink-0"
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
                          <div className="w-full h-full rounded-full bg-slate-900 dark:bg-slate-955 flex items-center justify-center text-white text-2xl font-bold uppercase">
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
                      className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0b57d0] dark:text-blue-400 font-bold text-xs transition-colors cursor-pointer shadow-sm active:scale-[0.98]"
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

      {/* Main Content Dashboard Layout */}
      <main className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-slate-900 max-w-4xl w-full mx-auto transition-colors">
        <div className="animate-fade-in space-y-8">
          {!isSessionActive ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Main Card (Start Session) */}
              <div className="md:col-span-2 space-y-6">
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors">
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Attendance Session</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Generate a dynamic, secure QR code valid for **5 minutes**. Students will scan the code using their mobile devices to sign in.
                    </p>
                  </div>
                  {/* Styled Small, Compact Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleStartAttendance}
                      disabled={loading}
                      className="py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 font-bold text-white text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {loading ? "Starting..." : "Start Attendance"}
                    </button>
                    <Link
                      href="/professor/history"
                      className="py-2.5 px-4 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 font-bold text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-600 text-xs text-center flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Attendance Reports
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Course Stats Sidebar */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors">
                  <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Course Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-slate-505 dark:text-slate-400 font-semibold">Total Students</span>
                      <span className="text-base font-extrabold text-slate-950 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        {registeredCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-slate-505 dark:text-slate-400 font-semibold">Present Today</span>
                      <span className="text-base font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-955/20 px-2.5 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        {summaryStats.presentToday}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-slate-505 dark:text-slate-400 font-semibold">Overall Rate</span>
                      <span className="text-base font-extrabold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/30">
                        {summaryStats.overallRate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Active Session Display */}
              <div className="md:col-span-2 flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 text-center transition-colors">
                <div>
                  <span className="inline-flex px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-455 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-full uppercase tracking-wider animate-pulse">
                    ● ATTENDANCE SESSION ACTIVE
                  </span>
                </div>

                {/* QR Image Frame */}
                <div className="p-6 bg-white rounded-3xl aspect-square w-full max-w-[260px] shadow-lg flex flex-col items-center justify-center border border-slate-200 dark:border-slate-750 transition-all duration-300">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="Attendance QR Code" className="w-full h-full object-contain animate-fade-in" />
                  ) : (
                    <div className="w-full h-full rounded bg-slate-50 dark:bg-slate-700 animate-pulse flex items-center justify-center text-slate-400 text-xs">
                      Generating QR...
                    </div>
                  )}
                </div>

                {/* Secure link */}
                <div className="space-y-2 w-full max-w-md">
                  <p className="text-xs text-slate-505 dark:text-slate-400 font-bold uppercase tracking-wider">SECURE TOKEN LINK</p>
                  <div className="text-xs font-mono text-primary dark:text-blue-400 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 select-all overflow-x-auto whitespace-nowrap scrollbar-thin">
                    {window.location.origin}/attendance/{session?.token}
                  </div>
                </div>
                <div className="w-full flex justify-center pt-4 border-t border-slate-100 dark:border-slate-700 max-w-md">
                  <button
                    onClick={handleEndAttendance}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 font-bold text-white text-xs transition-colors shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? "Ending Session..." : "End Session Early"}
                  </button>
                </div>
              </div>

              {/* Sidebar Active Session Stats */}
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors">
                  <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Session Stats</h3>
                  
                  <div className="space-y-6">
                    {/* Timer */}
                    <div className="text-center p-5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 dark:border-slate-750">
                      <span className="text-xxs text-emerald-400 dark:text-emerald-455 font-extrabold uppercase tracking-widest">TIME REMAINING</span>
                      <p className="text-4xl font-mono font-bold mt-1 text-white tracking-wider">{formatTime(timeLeft)}</p>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-550 dark:text-slate-400 font-bold">
                        <span>Present Rate</span>
                        <span className="text-slate-900 dark:text-white">
                          {session?.presentCount} / {registeredCount}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${((session?.presentCount || 0) / registeredCount) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-700">
                      <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-550 dark:text-slate-400 font-medium">Total Registered</span>
                        <span className="font-bold text-slate-900 dark:text-white">{registeredCount}</span>
                      </div>
                      <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-550 dark:text-slate-400 font-medium">Current Present</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{session?.presentCount}</span>
                      </div>
                      <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-slate-550 dark:text-slate-400 font-medium">Current Absent</span>
                        <span className="font-extrabold text-rose-500 dark:text-rose-400">
                          {registeredCount - (session?.presentCount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-550 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors mt-8">
        © 2026 Attendance Tracker • Materials Joining Technology Portal.
      </footer>
    </div>
  );
}
