import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { COURSE } from "@/lib/constants";
import { getStudentStats } from "@/app/actions/reports";
import StudentHeaderClient from "./StudentHeaderClient";

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== "student") {
    redirect("/login");
  }

  const { name, email, image, rollNo } = session.user;
  
  // Fetch real stats from DB
  const { stats, history } = await getStudentStats();

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  const user = {
    name: name || "Student",
    email: email || "",
    image: image || null,
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors text-slate-800 dark:text-slate-100">
      {/* Unified Header */}
      <StudentHeaderClient onSignOut={handleSignOut} user={user} />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          
          {/* Centered Course Title Layout */}
          <div className="text-center py-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{COURSE.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono mt-1">Roll No: {rollNo}</p>
          </div>

          {/* Subject Card / Action */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 transition-colors">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-primary dark:text-blue-400">Active Subject</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{COURSE.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Course Code: {COURSE.code}</p>
            </div>
            
            <LinkButton />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Present</span>
              <p className="text-2.5xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats.present}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Absent</span>
              <p className="text-2.5xl font-extrabold text-rose-500 dark:text-rose-450 mt-1">{stats.absent}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Conducted</span>
              <p className="text-2.5xl font-extrabold text-primary dark:text-blue-400 mt-1">{stats.total}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-center transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</span>
              <p className="text-2.5xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.percentage}%</p>
            </div>
          </div>

          {/* History Section - Styled with Gorgeous Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance History</h3>
            {history.length > 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-colors">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {history.map((record) => (
                      <tr key={record.id} className="text-sm font-semibold hover:bg-slate-50/50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-300 transition-colors">
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center border border-slate-200/50 dark:border-slate-800 transition-colors">
                              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span>{record.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-bold ${
                              record.status === "PRESENT"
                                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                                : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${record.status === "PRESENT" ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-12 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
                <p className="text-sm font-medium">No conducted classes found in the records.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors mt-8">
        Made with 🍵 by Abhishek
      </footer>
    </div>
  );
}

// Client sub-button for student scan navigation link
import Link from "next/link";
function LinkButton() {
  return (
    <Link
      href="/student/scan"
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover font-bold text-white text-xs shadow-sm transition-all active:scale-[0.99]"
    >
      <svg
        width={14}
        height={14}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Scan Classroom QR Code
    </Link>
  );
}
