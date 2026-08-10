"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { COURSE } from "@/lib/constants";
import { startSession, endSession, getActiveSessionState } from "@/app/actions/session";
import { getProfessorSummaryStats } from "@/app/actions/reports";

interface SessionState {
  id: string;
  token: string;
  expiresAt: string;
  active: boolean;
  presentCount: number;
}

export default function ProfessorDashboard() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 77,
    presentToday: 0,
    overallRate: "0%",
  });
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState("");

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
      <main className="flex-1 flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading Professor Portal...</p>
        </div>
      </main>
    );
  }

  const registeredCount = summaryStats.totalStudents;
  const isSessionActive = session && timeLeft > 0;

  return (
    <main className="flex-1 p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{COURSE.name}</h1>
            <p className="text-sm text-slate-400">Professor Portal</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Exit Portal
          </Link>
        </div>

        {!isSessionActive ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur shadow-2xl space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-100">Start Attendance Session</h2>
                  <p className="text-sm text-slate-400">
                    Create a new time-limited (5 minutes) session. A secure QR code will be generated for students to scan in class.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleStartAttendance}
                    disabled={loading}
                    className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-semibold text-white transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {loading ? "Starting..." : "Start Attendance"}
                  </button>
                  <Link
                    href="/professor/history"
                    className="flex-1 py-3 px-5 rounded-xl bg-slate-850 hover:bg-slate-800 font-semibold text-slate-200 border border-slate-800 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    View History
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur shadow-2xl space-y-6">
                <h3 className="font-bold text-slate-200">Course Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-sm text-slate-400">Total Students</span>
                    <span className="text-lg font-bold text-slate-100">{registeredCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                    <span className="text-sm text-slate-400">Present Today</span>
                    <span className="text-lg font-bold text-slate-100">{summaryStats.presentToday}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-400">Attendance Rate</span>
                    <span className="text-lg font-bold text-slate-100">{summaryStats.overallRate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur shadow-2xl space-y-6 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/30 animate-pulse">
                  Attendance Session Active
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl aspect-square w-full max-w-[240px] shadow-lg flex flex-col items-center justify-center border border-slate-200 transition-all duration-300">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="Attendance QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full rounded bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-2 w-full max-w-sm">
                <p className="text-xs text-slate-505 font-bold uppercase tracking-wider">Secure Token Session</p>
                <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 select-all overflow-x-auto whitespace-nowrap scrollbar-thin">
                  {window.location.origin}/attendance/{session?.token}
                </div>
              </div>

              <div className="w-full flex justify-between items-center max-w-[280px] pt-4 border-t border-slate-800/40">
                <button
                  onClick={handleEndAttendance}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 font-semibold text-white text-sm transition-colors shadow-lg shadow-rose-950/20 active:scale-[0.98] cursor-pointer"
                >
                  {loading ? "Ending..." : "End Attendance"}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur shadow-2xl space-y-6">
                <h3 className="font-bold text-slate-200">Live Session Stats</h3>
                
                <div className="space-y-5">
                  <div className="text-center p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Remaining</span>
                    <p className="text-3.5xl font-mono font-bold text-emerald-400 mt-1">{formatTime(timeLeft)}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Present Students</span>
                      <span>
                        {session?.presentCount} / {registeredCount} Present
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${((session?.presentCount || 0) / registeredCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 divide-y divide-slate-850">
                    <div className="flex justify-between py-2.5 text-sm">
                      <span className="text-slate-400">Total Registered</span>
                      <span className="font-semibold text-slate-200">{registeredCount}</span>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                      <span className="text-slate-400">Current Present</span>
                      <span className="font-semibold text-emerald-400">{session?.presentCount}</span>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                      <span className="text-slate-400">Current Absent</span>
                      <span className="font-semibold text-rose-400">
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
  );
}
