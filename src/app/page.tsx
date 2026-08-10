import Link from "next/link";
import { auth, signOut } from "@/auth";
import { COURSE } from "@/lib/constants";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-radial from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="max-w-4xl w-full text-center space-y-8 animate-fade-in">
        {/* Course Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 uppercase rounded-full bg-emerald-950/50 border border-emerald-800/30">
            Active Semester Course
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {COURSE.name}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium tracking-wide max-w-xl mx-auto">
            College Attendance Portal ({COURSE.code})
          </p>

          {isLoggedIn && (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/50 text-sm text-slate-300 mx-auto mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Signed in as <strong className="text-white">{session.user?.name || session.user?.email}</strong> ({role})
              </span>
              <span className="text-slate-700">|</span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <button type="submit" className="text-xs text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer">
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Action Portals */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto pt-8">
          {/* Student Portal Card */}
          <Link
            href="/student/dashboard"
            className="group relative flex flex-col p-8 text-left rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/60 hover:-translate-y-1 shadow-2xl hover:shadow-slate-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative space-y-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-800/30 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  Student Portal
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Log in, scan attendance QR code, and view your personal attendance history.
                </p>
              </div>
            </div>
          </Link>

          {/* Professor Portal Card */}
          <Link
            href="/professor/dashboard"
            className="group relative flex flex-col p-8 text-left rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/60 hover:-translate-y-1 shadow-2xl hover:shadow-slate-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative space-y-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-800/30 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Professor Portal
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Manage class sessions, display dynamic QR codes, track real-time attendance, and view reports.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-16 text-xs text-slate-500 font-medium">
          Secured with Google OAuth & Real-time Database Validation.
        </div>
      </div>
    </main>
  );
}
