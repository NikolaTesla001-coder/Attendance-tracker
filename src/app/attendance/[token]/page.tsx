import Link from "next/link";
import { COURSE } from "@/lib/constants";
import { submitAttendance } from "@/app/actions/attendance";

interface Props {
  params: Promise<{
    token: string;
  }>;
}

export default async function AttendanceTokenPage({ params }: Props) {
  const { token } = await params;
  const result = await submitAttendance(token);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-radial from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl shadow-2xl space-y-6 text-center animate-fade-in">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{COURSE.code}</span>
          <h1 className="text-2xl font-bold mt-1 text-slate-100">Attendance Verification</h1>
          <p className="text-xs text-slate-505 font-mono mt-1 select-all">Token: {token}</p>
        </div>

        {result.success ? (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800/30 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-900/50 border border-emerald-700/50 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold animate-pulse">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-emerald-400">Attendance Recorded!</h2>
              <p className="text-sm text-slate-300 font-medium">{result.studentName}</p>
              <p className="text-xs text-slate-400">Roll No: {result.rollNo}</p>
            </div>
            <p className="text-xxs text-slate-500 font-mono">
              Timestamp: {result.timestamp ? new Date(result.timestamp).toLocaleString() : ""}
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-800/30 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-900/50 border border-rose-700/50 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✕
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-rose-400">Submission Rejected</h2>
              <p className="text-sm text-slate-300 leading-relaxed font-medium mt-2">
                {result.error}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Link
            href="/student/dashboard"
            className="flex-1 py-2.5 px-4 text-center rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 font-semibold text-slate-300 text-sm transition-colors cursor-pointer"
          >
            Go to Student Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
