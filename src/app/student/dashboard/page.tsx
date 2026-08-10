import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { COURSE } from "@/lib/constants";
import { getStudentStats } from "@/app/actions/reports";

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== "student") {
    redirect("/login");
  }

  const { name, rollNo } = session.user;
  
  // Fetch real stats from DB
  const { stats, history } = await getStudentStats();

  return (
    <main className="flex-1 p-6 bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Welcome, {name}</h1>
            <p className="text-sm text-slate-400">Roll No: {rollNo}</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Exit Portal
          </Link>
        </div>

        {/* Course Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-800/20 backdrop-blur shadow-xl space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Current Subject</span>
            <h2 className="text-xl font-bold text-slate-100 mt-1">{COURSE.name}</h2>
          </div>
          <Link
            href="/student/scan"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
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
            Scan Attendance QR
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-xs text-slate-400 font-medium">Present</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.present}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-xs text-slate-400 font-medium">Absent</span>
            <p className="text-2xl font-bold text-rose-400 mt-1">{stats.absent}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-xs text-slate-400 font-medium">Total Conducted</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-xs text-slate-400 font-medium">Attendance Rate</span>
            <p className="text-2xl font-bold text-slate-100 mt-1">{stats.percentage}%</p>
          </div>
        </div>

        {/* History Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-200">Attendance History</h3>
          {history.length > 0 ? (
            <div className="rounded-xl border border-slate-800/80 overflow-hidden bg-slate-900/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-800/80 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {history.map((record) => (
                    <tr key={record.id} className="text-sm font-medium hover:bg-slate-900/20">
                      <td className="py-3 px-4 text-slate-300">{record.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                            record.status === "PRESENT"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/30"
                              : "bg-rose-950/60 text-rose-400 border border-rose-800/30"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 text-slate-500">
              <p className="text-sm">No conducted classes found in the records.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
