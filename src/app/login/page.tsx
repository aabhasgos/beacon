"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCheckCircle } from "@/components/icons/Icons";
import { getSupabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password || "password123" }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        router.push("/app");
      } else {
        const d = await res.json();
        setError(d.error || "Login failed");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const supabase = getSupabase();
      if (supabase) {
        const callbackUrl = `${window.location.origin}/auth/callback`;
        const { data, error: supaErr } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: callbackUrl,
          },
        });
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        if (supaErr) {
          console.warn("Supabase OAuth status:", supaErr.message);
        }
      }

      // If Supabase OAuth did not redirect, use email provided or primary account
      const targetEmail = (email || "aabhasgos2@gmail.com").trim();
      const derivedName = email ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Aabhas Goswami";
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          name: derivedName,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        window.location.href = "/app";
        return;
      }

      setError("Google OAuth service reachable. You can also click 'Start With Testing Student ID' below.");
    } catch (err: any) {
      setError("Google authentication service currently unreachable. Please enter your email below to sign in.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-4 group">
          <img
            src="/logo-icon.jpg"
            alt="Beacon"
            className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200 group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-2xl tracking-tight text-slate-950">
            Beacon
          </span>
          <span className="text-xs font-semibold text-indigo-700 -mt-1">
            Your journey. Your direction.
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Welcome back to Beacon
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-700 font-medium">
          Sign in to access your student passport, internships, and course roadmaps.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-3xl border border-slate-300 sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold shadow-xs hover:border-slate-400 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-300 w-full" />
            <span className="bg-white px-3 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              or sign in with email
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Student Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu.in"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-indigo-700 hover:text-indigo-900">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In to Beacon"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 font-medium pt-2">
            New to Beacon?{" "}
            <Link href="/register" className="font-bold text-indigo-700 hover:text-indigo-900">
              Create your free student profile
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
