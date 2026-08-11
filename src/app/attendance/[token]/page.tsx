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
    <div className="flex-1 flex flex-col justify-between bg-slate-50 min-h-screen">
      {/* Top Bar Banner */}
      <div className="bg-[#004ad7] text-white text-xs font-semibold text-center py-2 px-4 shadow-sm">
        ✨ Attendance Verification • Materials Joining Technology (MJT)
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 text-center animate-fade-in">
          <div>
            <span className="inline-flex px-2 py-0.5 text-xxs font-bold text-primary bg-blue-50 border border-blue-100 rounded uppercase tracking-wider">
              {COURSE.code} Check-in
            </span>
            <h1 className="text-2xl font-bold mt-2 text-slate-900">Attendance Verification</h1>
            <p className="text-xxs text-slate-400 font-mono mt-1">Session Token: {token.slice(0, 8)}...</p>
          </div>

          {result.success ? (
            <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-extrabold shadow-sm">
                ✓
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-emerald-700">Attendance Recorded!</h2>
                <p className="text-sm text-slate-800 font-extrabold">{result.studentName}</p>
                <p className="text-xs text-slate-500 font-semibold font-mono">Roll No: {result.rollNo}</p>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">
                Recorded: {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : ""}
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-rose-50/50 border border-rose-200 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-extrabold shadow-sm">
                ✕
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-rose-600">Check-in Failed</h2>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2">
                  {result.error}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <Link
              href="/student/dashboard"
              className="flex-1 py-3 px-4 text-center rounded-xl bg-primary hover:bg-primary-hover font-bold text-white text-sm transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-medium text-slate-400 border-t border-slate-200 bg-white">
        Made with 🍵 by Abhishek
      </footer>
    </div>
  );
}
