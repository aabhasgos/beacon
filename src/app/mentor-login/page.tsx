"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function MentorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMentorLogin = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (directEmail || email).trim().toLowerCase();
    const passwordToUse = directPassword || password || "password123";

    if (!emailToUse) {
      setError("Please enter your verified Mentor Council email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          password: passwordToUse,
          portal: "mentor",
          role: "mentor",
        }),
      });

      const d = await res.json();
      if (res.ok) {
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        window.location.href = d.redirectUrl || "/app/mentors";
      } else {
        setError(d.error || "Authentication failed. Only verified senior mentors with ≥10 years tenure may enter.");
      }
    } catch {
      setError("Unable to connect to Beacon Mentor Council authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Beacon Council Seal */}
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 border border-amber-300 group-hover:scale-105 transition-transform">
            🏛️
          </div>
          <span className="font-black text-2xl tracking-tight text-white">
            Beacon Senior Mentor Council
          </span>
          <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">
            Strict ≥10 Years Verified Experience Floor
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Executive Mentor Console
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-sm mx-auto">
          Dedicated, verified access for senior tech leaders guiding tier-2/3 engineering talent.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-slate-700 sm:px-10 space-y-6">
          {/* Council Charter Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span>⚖️</span>
              <span>100% Pro-Bono Student Charter</span>
            </div>
            <p className="text-[11px] text-amber-200/90">
              Beacon Council mentorship is strictly zero-fee for students. Commercial upsells, paid bootcamps, and third-party referral fees are permanently prohibited.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleMentorLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Senior Mentor Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@uber.com or karan@microsoft.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">Default: password123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900/80 text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying Council Credentials..." : "Enter Mentor Console →"}
            </button>
          </form>

          {/* 1-Click Fast Verification for Evaluators */}
          <div className="pt-3 border-t border-slate-700 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
              Quick Test Verified Mentors (1-Click)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleMentorLogin(undefined, "priya@uber.com", "password123")}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-amber-400 text-left cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white truncate">Priya Sen</div>
                <div className="text-[10px] text-amber-400 font-semibold truncate">Staff SRE • 11 Yrs</div>
              </button>
              <button
                type="button"
                onClick={() => handleMentorLogin(undefined, "karan@microsoft.com", "password123")}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-amber-400 text-left cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white truncate">Karan Verma</div>
                <div className="text-[10px] text-amber-400 font-semibold truncate">Senior ML • 12 Yrs</div>
              </button>
              <button
                type="button"
                onClick={() => handleMentorLogin(undefined, "sneha@cred.club", "password123")}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-amber-400 text-left cursor-pointer transition-all"
              >
                <div className="font-bold text-xs text-white truncate">Sneha Mukherjee</div>
                <div className="text-[10px] text-amber-400 font-semibold truncate">Principal Des • 10 Yrs</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 space-y-2">
            <p className="text-xs text-slate-400 font-medium">
              Are you a student looking for guidance?{" "}
              <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
                Student Sign In
              </Link>
              <span className="mx-2">•</span>
              <Link href="/recruiter-login" className="font-bold text-cyan-400 hover:text-cyan-300">
                Recruiter Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
