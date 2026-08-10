"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { COURSE } from "@/lib/constants";
import { getProfessorHistory, getSessionDetails } from "@/app/actions/reports";

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

export default function ProfessorHistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [studentsList, setStudentsList] = useState<StudentStatus[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    <main className="flex-1 p-6 bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">{COURSE.name}</h1>
            <p className="text-sm text-slate-400">Attendance History Reports</p>
          </div>
          <Link
            href="/professor/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {loadingSessions ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading conducted sessions...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Sessions List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-200">Conducted Sessions</h2>
              {sessions.length > 0 ? (
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-center">Present / Absent</th>
                        <th className="py-3 px-4 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {sessions.map((session) => (
                        <tr
                          key={session.id}
                          onClick={() => setSelectedSession(session.id)}
                          className={`text-sm font-medium transition-colors cursor-pointer ${
                            selectedSession === session.id ? "bg-slate-900/80 text-emerald-400" : "hover:bg-slate-900/40 text-slate-300"
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                            {session.date}
                            {session.active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Active Session" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="text-emerald-400">{session.present}</span>
                            <span className="text-slate-600 px-1">/</span>
                            <span className="text-rose-400">{session.absent}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold">{session.percentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 text-slate-500">
                  <p className="text-sm">No sessions conducted yet.</p>
                </div>
              )}
            </div>

            {/* Right: Selected Session Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-200">
                {selectedSession
                  ? `Details: ${sessions.find((s) => s.id === selectedSession)?.date.split(",")[0]}`
                  : "Select a Session to View Details"}
              </h2>

              {selectedSession ? (
                loadingDetails ? (
                  <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-slate-800 bg-slate-900/10 h-[280px] gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Loading student attendance status...</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20 max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider sticky top-0">
                          <th className="py-3 px-4">Roll No</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {studentsList.map((student) => (
                          <tr key={student.rollNo} className="text-sm hover:bg-slate-900/20 text-slate-300">
                            <td className="py-2.5 px-4 font-mono">{student.rollNo}</td>
                            <td className="py-2.5 px-4 font-medium">{student.name}</td>
                            <td className="py-2.5 px-4 text-right">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${
                                  student.status === "PRESENT"
                                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/30"
                                    : "bg-rose-950/60 text-rose-400 border border-rose-800/30"
                                }`}
                              >
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
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 text-slate-500 h-[280px]">
                  <svg
                    className="w-10 h-10 mb-2 text-slate-600"
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
                  <p className="text-sm">Click a session date from the table on the left.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
