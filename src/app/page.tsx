"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function GatewayPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "mentor">("signup");

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Mentor Sign In fields
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorPassword, setMentorPassword] = useState("");

  // Sign Up fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("2027");
  const [cgpa, setCgpa] = useState("");
  const [interests, setInterests] = useState("");

  // State
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  // Check if already authenticated on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("beacon_user");
      const hasCookie = document.cookie.includes("beacon_session") || document.cookie.includes("beacon_user_id");
      if (stored || hasCookie) {
        // User already authenticated -> go to app
        router.push("/app");
      }
    } catch (e) {
      // ignore
    }
  }, [router]);

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        router.push("/app");
      } else {
        const d = await res.json();
        setError(d.error || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication service. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Senior Mentor Sign In Handler (Strict 10+ Year Requirement)
  const handleMentorSignIn = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (directEmail || mentorEmail).trim().toLowerCase();
    const passwordToUse = directPassword || mentorPassword || "password123";

    if (!emailToUse) {
      setError("Please provide your verified Senior Mentor email.");
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
        setError(d.error || "Mentor authentication failed. Please verify your credentials.");
      }
    } catch {
      setError("Unable to connect to the Mentor Council service. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Handler -> Guides directly to Resume & Profile builder
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signupEmail.trim()) {
      setError("Please provide your Full Name and Student Email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: signupEmail,
          password: signupPassword || "password123",
          college,
          degree,
          graduationYear,
          cgpa,
          interests,
          headline: `${degree} @ ${college}`,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        // Redirect straight to passport with onboarding flag to upload resume and certificates
        router.push("/app/passport?onboarding=true");
      } else {
        const d = await res.json();
        setError(d.error || "Profile creation failed. Please check your inputs.");
      }
    } catch (err) {
      setError("Network error while creating account. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Direct Login Helper for Google Account
  const loginWithGoogleEmail = async (emailToUse: string, nameToUse?: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      const cleanEmail = emailToUse.trim().toLowerCase();
      const derivedName =
        nameToUse ||
        cleanEmail
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
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
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to authenticate with Google account.");
      }
    } catch {
      setError("Network error while connecting to Google service.");
    } finally {
      setGoogleLoading(false);
      setShowGoogleModal(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
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
          console.warn("Supabase Google redirect notice:", supaErr.message);
        }
      }

      // 1. If user typed an email in either form, log in immediately
      const targetedEmail = (signupEmail || loginEmail).trim();
      if (targetedEmail && targetedEmail.includes("@")) {
        await loginWithGoogleEmail(targetedEmail, fullName.trim());
        return;
      }

      // 2. Check if user previously logged in
      const savedUserStr = typeof window !== "undefined" ? localStorage.getItem("beacon_user") : null;
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser?.email) {
            await loginWithGoogleEmail(savedUser.email, savedUser.full_name || savedUser.fullName);
            return;
          }
        } catch {}
      }

      // 3. Open the Google Account Selection Modal
      setShowGoogleModal(true);
    } catch {
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Brand Bar */}
      <header className="h-18 bg-white border-b border-slate-300 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            src="/logo-icon.jpg"
            alt="Beacon Logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40, objectFit: "cover" }}
            className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200 beacon-logo"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-950 leading-none">
                Beacon
              </span>
              <span className="text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                Gateway
              </span>
            </div>
            <span className="text-[11px] font-bold text-indigo-700">
              Your journey. Your direction.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>DPDP 2025 Privacy Compliant • 256-bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Gateway */}
      <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-black text-indigo-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              <span>{authMode === "mentor" ? "Beacon Senior Mentor Council (10+ Years Verified)" : "All-in-One Student Operating System"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {authMode === "signup"
                ? "Create Your Student Profile"
                : authMode === "signin"
                ? "Welcome Back to Beacon"
                : "Senior Mentor Sign In"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-md mx-auto leading-relaxed">
              {authMode === "signup"
                ? "Sign up to store your certificates, build your verified passport, and unlock 1-click applications to ISRO, Google, and Razorpay."
                : authMode === "signin"
                ? "Sign in to access your opportunity radar, certificate locker, and Beacon AI Career Coach."
                : "Dedicated access for verified senior practitioners (≥10 years industry tenure) offering pro-bono guidance."}
            </p>
          </div>

          {/* Gateway Card with Crisp Modern Borders */}
          <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Tab Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 gap-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError("");
                }}
                className={`flex-1 py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center ${
                  authMode === "signup"
                    ? "bg-white text-indigo-950 dark:bg-slate-900 dark:text-indigo-200 shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                1. Student Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setError("");
                }}
                className={`flex-1 py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center ${
                  authMode === "signin"
                    ? "bg-white text-indigo-950 dark:bg-slate-900 dark:text-indigo-200 shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                2. Student Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("mentor");
                  setError("");
                }}
                className={`flex-1 py-2.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center ${
                  authMode === "mentor"
                    ? "bg-amber-400 text-slate-950 shadow-xs border border-amber-500 font-black"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                3. Mentor Sign In
              </button>
            </div>

            {/* Google Authentication Button (Only for Student Auth) */}
            {authMode !== "mentor" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg
                    width={20}
                    height={20}
                    style={{ width: 20, height: 20, flexShrink: 0 }}
                    className="w-5 h-5 shrink-0 google-icon"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{googleLoading ? "Connecting with Google..." : "Continue with Google"}</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-300 w-full" />
                  <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 shrink-0">
                    Or Continue With Student Email
                  </span>
                </div>
              </>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 inline-block" />
                <span>{error}</span>
              </div>
            )}

            {/* Tab: CREATE STUDENT ACCOUNT */}
            {authMode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Your Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      Student / College Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@college.edu.in or you@gmail.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create a secure password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      College / University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Bombay, DTU, Anna University"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      Degree & Major
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science, BCA, B.Sc"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      placeholder="2027"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      Current CGPA
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8.5"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                    Learning Interests & Focus Areas
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Development, AI & Machine Learning, Cloud Systems"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                  />
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">
                    Beacon AI uses this to personalize course recommendations and match verified internships.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Creating Profile..." : "Create Account & Build Resume →"}
                </button>
              </form>
            )}

            {/* Tab: SIGN IN */}
            {authMode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@college.edu.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In to Beacon →"}
                </button>
              </form>
            )}

            {/* Tab: SENIOR MENTOR SIGN IN */}
            {authMode === "mentor" && (
              <form onSubmit={handleMentorSignIn} className="space-y-4">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0 inline-block" />
                    <span>Senior Mentor Council Access Only</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    Strict experience floor: Only verified practitioners with ≥10 years of industry tenure can sign in. Student accounts cannot authenticate here.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                    Verified Mentor Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@uber.com or karan@microsoft.com"
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold">Default: password123</span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={mentorPassword}
                    onChange={(e) => setMentorPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs sm:text-sm text-slate-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Authenticating Mentor Council..." : "Sign In as Senior Mentor →"}
                </button>

                {/* 1-Click Fast Verification for Reviewers */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">
                    Quick-Access Verified Council Mentors (Click to Test)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleMentorSignIn(undefined, "priya@uber.com", "password123")}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-amber-400 text-left cursor-pointer transition-all"
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Priya Sen</div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">Staff SRE • 11 Yrs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMentorSignIn(undefined, "karan@microsoft.com", "password123")}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-amber-400 text-left cursor-pointer transition-all"
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Karan Verma</div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">Senior ML • 12 Yrs</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMentorSignIn(undefined, "sneha@cred.club", "password123")}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-amber-400 text-left cursor-pointer transition-all"
                    >
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">Sneha Mukherjee</div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate">Principal Des • 10 Yrs</div>
                    </button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/mentor-login"
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Standalone Mentor Council Portal</span>
                    <span>→</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Google Account Quick Sign-In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
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
                <h3 className="font-black text-slate-900 text-base">Sign in with Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Choose your Google account to sign in and synchronize your verified Student Vault:
            </p>

            {/* Account 1: Aabhas Goswami (One-Click) */}
            <button
              type="button"
              onClick={() => loginWithGoogleEmail("aabhasgos2@gmail.com", "Aabhas Goswami")}
              disabled={googleLoading}
              className="w-full p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 flex items-center gap-3.5 transition-all text-left cursor-pointer group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                AG
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs sm:text-sm text-slate-950">Aabhas Goswami</span>
                  <span className="text-[9px] font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded-full">Primary</span>
                </div>
                <span className="text-xs text-slate-600 block truncate font-medium">aabhasgos2@gmail.com</span>
              </div>
              <span className="text-indigo-600 font-black text-sm group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Account 2: Custom Google Email */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Or sign in with another Google Account:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail && customGoogleEmail.includes("@")) {
                      loginWithGoogleEmail(customGoogleEmail);
                    }
                  }}
                  disabled={!customGoogleEmail || !customGoogleEmail.includes("@") || googleLoading}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                >
                  {googleLoading ? "Signing in..." : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}
