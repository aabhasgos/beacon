"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconShield, IconGraph, IconUsers, IconBriefcase } from "@/components/icons/Icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@beacon.network");
  const [password, setPassword] = useState("beacon-admin-2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (directEmail || email).trim().toLowerCase();
    const passwordToUse = directPassword || password || "beacon-admin-2026";

    if (!emailToUse) {
      setError("Please provide your institutional administrator email.");
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
          portal: "admin",
          role: "admin",
        }),
      });

      const d = await res.json();
      if (res.ok) {
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        window.location.href = d.redirectUrl || "/app/admin";
      } else {
        setError(d.error || "Authentication failed. Unauthorized administrator access attempt logged.");
      }
    } catch {
      setError("Unable to connect to Beacon Institutional Governance authority.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Beacon Admin Emblem */}
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 border border-indigo-400/30 group-hover:scale-105 transition-transform">
            <IconShield size={28} />
          </div>
          <span className="font-black text-2xl tracking-tight text-white flex items-center gap-2">
            <span>Beacon Control Center</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase font-mono">
              Admin
            </span>
          </span>
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
            Institutional Master Administration Console
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          System Administration Login
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium max-w-sm mx-auto">
          Authorized console for system auditors, credential verification chairs, and platform governance officers.
        </p>

        {/* Multi-Portal Switcher Tabs */}
        <div className="mt-4 inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Student Portal
          </Link>
          <Link
            href="/mentor-login"
            className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Mentor Council
          </Link>
          <Link
            href="/recruiter-login"
            className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Recruiter Console
          </Link>
          <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            Admin Console
          </span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-slate-800 sm:px-10 space-y-6">
          {/* Security Governance Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-800/60 text-indigo-200 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Institutional Audit & Governance Floor</span>
            </div>
            <p className="text-[11px] text-slate-300">
              All administrative queries, candidate verification updates, and credential approvals are cryptographically logged with immutable timestamps.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleAdminLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Institutional Admin Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@beacon.network"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Security Master Key
                </label>
                <span className="text-[10px] text-slate-500 font-mono">256-bit AES Authenticated</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <IconShield size={16} />
              <span>{loading ? "Authenticating Master Session..." : "Authenticate as System Administrator →"}</span>
            </button>
          </form>

          {/* Quick-Access Demo Master Admin */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Evaluation Quick-Access (Click to Authenticate)
            </span>
            <button
              type="button"
              onClick={() => handleAdminLogin(undefined, "admin@beacon.network", "beacon-admin-2026")}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center justify-between cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Master System Administrator
                </div>
                <div className="text-[11px] text-slate-400 font-mono">admin@beacon.network</div>
              </div>
              <span className="text-xs text-indigo-400 font-bold">1-Click Sign In →</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
            >
              ← Back to Unified Gateway
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
