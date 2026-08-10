import Link from "next/link";

export default function ProfessorAttendancePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
        <h1 className="text-xl font-bold text-slate-100">Active Attendance Session</h1>
        <p className="text-sm text-slate-400">
          Attendance sessions are managed directly from the primary dashboard portal.
        </p>
        <Link
          href="/professor/dashboard"
          className="inline-block py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
