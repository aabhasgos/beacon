"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconBriefcase, IconShield, IconUsers, IconTarget } from "@/components/icons/Icons";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign In fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupCompany, setSignupCompany] = useState("");
  const [signupTitle, setSignupTitle] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setSuccessMsg("");

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

  const handleRecruiterSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!fullName.trim() || !signupEmail.trim() || !signupCompany.trim()) {
      setError("Please fill in your name, corporate email, and enterprise name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "recruiter",
          fullName: fullName.trim(),
          email: signupEmail.trim(),
          password: signupPassword || "password123",
          company: signupCompany.trim(),
          title: signupTitle.trim() || "Lead Talent Partner",
          headline: `${signupTitle.trim() || "Talent Lead"} @ ${signupCompany.trim()}`,
          bio: `Verified enterprise talent partner at ${signupCompany.trim()}. Scouting verified student builders.`,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        setSuccessMsg("Enterprise seat registered successfully! Redirecting to Talent Console...");
        setTimeout(() => {
          window.location.href = d.redirectUrl || "/app/opportunities?recruiter=true";
        }, 1000);
      } else {
        setError(d.error || "Recruiter registration failed. Please check inputs.");
      }
    } catch {
      setError("Network error while registering corporate account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar with Portal Switcher */}
      <div className="absolute top-5 left-4 right-4 sm:left-8 sm:right-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Gateway</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-indigo-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
            >
              Student Portal
            </Link>
            <Link
              href="/mentor-login"
              className="text-xs font-bold text-amber-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
            >
              Mentor Council
            </Link>
            <Link
              href="/admin-login"
              className="text-xs font-bold text-rose-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-all"
            >
              Admin Console
            </Link>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 mt-8">
        {/* Beacon Recruiter Emblem */}
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 border border-cyan-400/30 group-hover:scale-105 transition-transform">
            <IconBriefcase size={26} />
          </div>
          <span className="font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <span>Beacon Talent Console</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full uppercase font-mono">
              Recruiter
            </span>
          </span>
          <span className="text-xs font-black text-cyan-400 tracking-wider uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            Verified Engineering Roles & Audited Student Passports
          </span>
        </Link>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium max-w-md mx-auto">
          Post verified technical roles, scout cryptographically audited student proof-of-work, and fast-track top engineering talent.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-7 px-6 shadow-2xl rounded-3xl border border-slate-800 sm:px-10 space-y-5">
          {/* Top Switcher Tabs: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab("signin");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
                tab === "signin"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1. Recruiter Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center ${
                tab === "signup"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2. Register Enterprise (Sign Up)
            </button>
          </div>

          {/* Quality Floor Policy Banner */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-cyan-300">
              <IconShield size={16} />
              <span>Beacon Professional Standard Enforced</span>
            </div>
            <p className="text-[11px] text-cyan-200/90 leading-relaxed">
              Only verified technical internships, fellowships, and graduate SDE roles are permitted. Commission-only sales, unpaid cold calls, and low-quality task gigs are permanently barred.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === "signin" && (
            <form onSubmit={(e) => handleRecruiterLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Corporate Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. recruiter@razorpay.com, talent@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-500">Default: password123</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating Corporate Seat..." : "Enter Recruiter Console →"}
              </button>

              {/* Quick-Test Corporate Recruiter Seats */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider text-center">
                  One-Click Verified Recruiter Logins (Test Access)
                </span>
                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    type="button"
                    onClick={() => handleRecruiterLogin(undefined, "recruiter@razorpay.com", "password123")}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">Razorpay</div>
                    <div className="text-[10px] text-slate-400">recruiter@razorpay.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecruiterLogin(undefined, "talent@microsoft.com", "password123")}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">Microsoft</div>
                    <div className="text-[10px] text-slate-400">talent@microsoft.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecruiterLogin(undefined, "careers@isro.gov.in", "password123")}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">ISRO SAC</div>
                    <div className="text-[10px] text-slate-400">careers@isro.gov.in</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRecruiterLogin(undefined, "recruiter@google.com", "password123")}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">Google India</div>
                    <div className="text-[10px] text-slate-400">recruiter@google.com</div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER ENTERPRISE (SIGN UP) */}
          {tab === "signup" && (
            <form onSubmit={handleRecruiterSignUp} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shalini Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="shalini@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Company / Enterprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupCompany}
                    onChange={(e) => setSignupCompany(e.target.value)}
                    placeholder="e.g. Swiggy, Cred, Zerodha"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Title / Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupTitle}
                    onChange={(e) => setSignupTitle(e.target.value)}
                    placeholder="e.g. Head of Talent Acquisition"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Set account password (default: password123)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Registering Enterprise Seat..." : "Register Enterprise Seat & Access Passports →"}
              </button>
            </form>
          )}

          <div className="text-center pt-2 space-y-2 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-medium">
              Explore other portals:{" "}
              <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300">
                Student Sign In
              </Link>
              <span className="mx-2">•</span>
              <Link href="/mentor-login" className="font-bold text-amber-400 hover:text-amber-300">
                Mentor Council
              </Link>
              <span className="mx-2">•</span>
              <Link href="/admin-login" className="font-bold text-rose-400 hover:text-rose-300">
                Admin Console
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
