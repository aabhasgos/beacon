"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecruiterLogin = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (directEmail || email).trim().toLowerCase();
    const passwordToUse = directPassword || password || "password123";

    if (!emailToUse) {
      setError("Please enter your corporate recruiter email.");
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
          portal: "recruiter",
          role: "recruiter",
        }),
      });

      const d = await res.json();
      if (res.ok) {
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        window.location.href = d.redirectUrl || "/app/opportunities?recruiter=true";
      } else {
        setError(d.error || "Authentication failed. Only verified tech companies and talent partners may enter.");
      }
    } catch {
      setError("Unable to connect to Beacon Enterprise authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Beacon Recruiter Emblem */}
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/20 border border-cyan-400/30 group-hover:scale-105 transition-transform">
            🏢
          </div>
          <span className="font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <span>Beacon Talent Console</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase font-mono">
              Recruiter
            </span>
          </span>
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">
            Audited Engineering Talent & Verified Postings
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Enterprise Recruiter Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
          Post verified technical roles, scout cryptographically audited student passports, and fast-track top engineering talent.
        </p>

        {/* Portal Switcher Tabs */}
        <div className="mt-4 inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>🎓</span>
            <span>Student Portal</span>
          </Link>
          <Link
            href="/mentor-login"
            className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>🏛️</span>
            <span>Mentor Council</span>
          </Link>
          <span className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white shadow-xs flex items-center gap-1.5">
            <span>🏢</span>
            <span>Recruiter Hub</span>
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 sm:px-10 space-y-6">
          {/* Quality Floor Policy Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <span>🛡️</span>
              <span>Beacon Professional Standard Enforced</span>
            </div>
            <p className="text-[11px] text-cyan-200/90 leading-relaxed">
              Only verified technical internships, fellowships, and graduate SDE roles are permitted. Commission-based sales, unpaid telecalling, and spurious tasks are permanently banned.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={(e) => handleRecruiterLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Corporate Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@razorpay.com, recruiter@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Use your corporate domain (e.g. @company.com, @org.in).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Razorpay, Microsoft, ISRO SAC, Google"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Default: password123 (or set your own)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-cyan-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Authenticating Corporate Seat..." : "Enter Recruiter Console →"}
            </button>
          </form>

          {/* Quick-Test Corporate Recruiter Seats */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider text-center">
              One-Click Verified Recruiter Logins (Test Access)
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleRecruiterLogin(undefined, "recruiter@razorpay.com", "password123")}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">⚡ Razorpay Core</div>
                <div className="text-[10px] text-slate-400">recruiter@razorpay.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleRecruiterLogin(undefined, "talent@microsoft.com", "password123")}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">🔷 Microsoft Campus</div>
                <div className="text-[10px] text-slate-400">talent@microsoft.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleRecruiterLogin(undefined, "careers@isro.gov.in", "password123")}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">🚀 ISRO SAC</div>
                <div className="text-[10px] text-slate-400">careers@isro.gov.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleRecruiterLogin(undefined, "recruiter@google.com", "password123")}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-white group-hover:text-cyan-300">🔴 Google India</div>
                <div className="text-[10px] text-slate-400">recruiter@google.com</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400">
            <span>Are you a student? </span>
            <Link href="/login" className="font-bold text-cyan-400 hover:underline">
              Student Sign In
            </Link>
            <span className="mx-2">•</span>
            <Link href="/mentor-login" className="font-bold text-amber-400 hover:underline">
              Mentor Council
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
