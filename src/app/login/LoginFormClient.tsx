"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { COURSE } from "@/lib/constants";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  error?: string;
}

export default function LoginFormClient({ error: serverError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientWarning, setClientWarning] = useState<string | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setClientWarning("Please fill in both email and password fields.");
      return;
    }
    setClientWarning(
      "Direct email/password registration is disabled for security. Please sign in using Google below with your registered college email."
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#f8fafc] dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 font-sans p-6 relative transition-colors">
      
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-slate-950/20 space-y-6 text-left animate-fade-in transition-colors">
        
        {/* Sign In Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <svg width={18} height={18} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">Attendance Tracker</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">Sign In</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wide">
            {COURSE.name} ({COURSE.code})
          </p>
        </div>

        {/* Warnings and errors */}
        {(serverError || clientWarning) && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-sm font-semibold text-red-800 dark:text-red-400 space-y-1">
            <div className="flex items-center gap-2">
              <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Access Denied</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1">
              {clientWarning || (serverError === "AccessDenied"
                ? "This Google account is not whitelisted. Please check with your professor to ensure your Gmail is registered."
                : "An authentication error occurred. Please try again.")}
            </p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary focus:outline-none text-slate-900 dark:text-white transition-colors font-medium text-sm"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary focus:outline-none text-slate-900 dark:text-white transition-colors font-medium text-sm"
              />
              {/* Visibility Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? (
                  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-right pt-1">
              <span className="text-xs font-semibold text-primary dark:text-blue-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer text-sm"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">Or sign in with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Social Logins: Google Button with explicit sizing for the icon */}
        <div className="w-full">
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer text-sm"
          >
            {/* Colorful Google G-Logo - Explicit 18px size */}
            <svg width={18} height={18} viewBox="0 0 24 24" className="flex-shrink-0">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
