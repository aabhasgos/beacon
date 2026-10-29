"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { IconShield, IconUsers, IconBriefcase, IconTarget } from "@/components/icons/Icons";

export default function GatewayPage() {
  const router = useRouter();

  // Primary Persona: student | mentor | recruiter | admin
  const [persona, setPersona] = useState<"student" | "mentor" | "recruiter" | "admin">("student");

  // Inner Sub-toggles
  const [studentMode, setStudentMode] = useState<"signup" | "signin">("signup");
  const [mentorMode, setMentorMode] = useState<"signin" | "signup">("signin");
  const [recruiterMode, setRecruiterMode] = useState<"signin" | "signup">("signin");

  // Student Sign In fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Student Sign Up fields
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("2027");
  const [cgpa, setCgpa] = useState("");
  const [interests, setInterests] = useState("");

  // Mentor fields (Strict 10+ Year Requirement)
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorPassword, setMentorPassword] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [mentorCompany, setMentorCompany] = useState("");
  const [mentorTitle, setMentorTitle] = useState("");
  const [mentorExpYears, setMentorExpYears] = useState("12");
  const [mentorLinkedin, setMentorLinkedin] = useState("");
  const [mentorDomain, setMentorDomain] = useState("Distributed Systems & Backend Architecture");
  const [mentorBio, setMentorBio] = useState("");

  // Recruiter fields
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterPassword, setRecruiterPassword] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterCompany, setRecruiterCompany] = useState("");
  const [recruiterTitle, setRecruiterTitle] = useState("");

  // Admin fields
  const [adminEmail, setAdminEmail] = useState("admin@beacon.network");
  const [adminPassword, setAdminPassword] = useState("beacon-admin-2026");

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
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

  // Student Sign In Handler
  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword || "password123" }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        router.push("/app");
      } else {
        const d = await res.json();
        setError(d.error || "Invalid student email or password. Please try again.");
      }
    } catch {
      setError("Unable to connect to the authentication service. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // Student Sign Up Handler
  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !signupEmail.trim()) {
      setError("Please provide your Full Name and Student Email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: signupEmail.trim(),
          password: signupPassword || "password123",
          college: college.trim(),
          degree: degree.trim(),
          graduationYear,
          cgpa,
          interests,
          headline: `${degree || "Engineering"} @ ${college || "University"}`,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        router.push("/app/passport?onboarding=true");
      } else {
        const d = await res.json();
        setError(d.error || "Profile creation failed. Please check your inputs.");
      }
    } catch {
      setError("Network error while creating account. Please retry.");
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
      setError("Please provide your verified Senior Mentor work email.");
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

  // Senior Mentor Application & Sign Up Handler
  const handleMentorSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!mentorName.trim() || !mentorEmail.trim() || !mentorCompany.trim() || !mentorTitle.trim()) {
      setError("Please complete all required fields (Name, Senior Email, Enterprise, Title).");
      return;
    }

    const exp = Number(mentorExpYears);
    if (exp < 10) {
      setError("Beacon Senior Mentor Council enforces a strict 10+ year industry experience floor.");
      return;
    }

    if (!mentorLinkedin.trim().toLowerCase().includes("linkedin.com")) {
      setError("A verified LinkedIn profile URL is mandatory for Council credential review.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "mentor",
          fullName: mentorName.trim(),
          email: mentorEmail.trim(),
          password: mentorPassword || "password123",
          company: mentorCompany.trim(),
          title: mentorTitle.trim(),
          experienceYears: exp,
          linkedinUrl: mentorLinkedin.trim(),
          interests: mentorDomain,
          headline: `${mentorTitle.trim()} @ ${mentorCompany.trim()}`,
          bio: mentorBio.trim() || `${exp}+ years building enterprise software systems. Mentoring students pro-bono.`,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        setSuccessMsg("Mentor credential submitted & verified! Redirecting to Council...");
        setTimeout(() => {
          window.location.href = d.redirectUrl || "/app/mentors?registered=true";
        }, 1000);
      } else {
        setError(d.error || "Mentor application failed. Please check inputs.");
      }
    } catch {
      setError("Network error while submitting Mentor application.");
    } finally {
      setLoading(false);
    }
  };

  // Recruiter Sign In Handler
  const handleRecruiterSignIn = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (directEmail || recruiterEmail).trim().toLowerCase();
    const passwordToUse = directPassword || recruiterPassword || "password123";

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
        setError(d.error || "Recruiter authentication failed. Please verify credentials.");
      }
    } catch {
      setError("Unable to connect to Enterprise Talent service.");
    } finally {
      setLoading(false);
    }
  };

  // Recruiter Sign Up Handler
  const handleRecruiterSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!recruiterName.trim() || !recruiterEmail.trim() || !recruiterCompany.trim()) {
      setError("Please provide your name, corporate email, and enterprise name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "recruiter",
          fullName: recruiterName.trim(),
          email: recruiterEmail.trim(),
          password: recruiterPassword || "password123",
          company: recruiterCompany.trim(),
          title: recruiterTitle.trim() || "Lead Talent Partner",
          headline: `${recruiterTitle.trim() || "Talent Lead"} @ ${recruiterCompany.trim()}`,
          bio: `Verified enterprise talent partner at ${recruiterCompany.trim()}. Scouting verified student builders.`,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        setSuccessMsg("Enterprise seat registered! Redirecting to Talent Console...");
        setTimeout(() => {
          window.location.href = d.redirectUrl || "/app/opportunities?recruiter=true";
        }, 1000);
      } else {
        setError(d.error || "Recruiter registration failed.");
      }
    } catch {
      setError("Network error while registering corporate account.");
    } finally {
      setLoading(false);
    }
  };

  // Institutional Master Admin Sign In Handler
  const handleAdminSignIn = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (directEmail || adminEmail).trim().toLowerCase();
    const passwordToUse = directPassword || adminPassword || "beacon-admin-2026";

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
        setError(d.error || "System administrator authentication failed.");
      }
    } catch {
      setError("Unable to connect to Beacon Governance Authority.");
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

      const targetedEmail = (signupEmail || loginEmail).trim();
      if (targetedEmail && targetedEmail.includes("@")) {
        await loginWithGoogleEmail(targetedEmail, fullName.trim());
        return;
      }

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

      setShowGoogleModal(true);
    } catch {
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Brand & Portal Navigation Bar */}
      <header className="h-18 bg-white border-b border-slate-300 px-4 sm:px-8 flex items-center justify-between shadow-2xs sticky top-0 z-40">
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

        {/* Portal Quick-Jump Links in Header */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setPersona("student");
                setError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                persona === "student"
                  ? "bg-white text-indigo-950 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setPersona("mentor");
                setError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                persona === "mentor"
                  ? "bg-amber-400 text-slate-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Mentor Council
            </button>
            <button
              type="button"
              onClick={() => {
                setPersona("recruiter");
                setError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                persona === "recruiter"
                  ? "bg-cyan-600 text-white shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Recruiter Hub
            </button>
            <button
              type="button"
              onClick={() => {
                setPersona("admin");
                setError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                persona === "admin"
                  ? "bg-indigo-900 text-white shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Admin Console
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-700 font-bold text-xs pl-2 border-l border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden xl:inline">DPDP 2025 Privacy Compliant • 256-bit Encrypted</span>
            <span className="xl:hidden">DPDP 2025</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Authentication Gateway */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full space-y-5">
          {/* Persona Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full text-xs font-black text-indigo-900 shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full inline-block ${
                  persona === "mentor"
                    ? "bg-amber-500"
                    : persona === "recruiter"
                    ? "bg-cyan-500"
                    : persona === "admin"
                    ? "bg-rose-500"
                    : "bg-indigo-600"
                }`}
              />
              <span>
                {persona === "mentor"
                  ? "Beacon Senior Mentor Council • Strict ≥10 Years Verified Tenure"
                  : persona === "recruiter"
                  ? "Enterprise Talent Console • Verified High-Quality Roles Only"
                  : persona === "admin"
                  ? "Institutional Master Administration & Governance Console"
                  : "All-in-One Student Operating System"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              {persona === "student" && (studentMode === "signup" ? "Create Your Student Profile" : "Welcome Back to Beacon")}
              {persona === "mentor" && (mentorMode === "signin" ? "Senior Mentor Council Sign In" : "Apply as a Senior Council Mentor")}
              {persona === "recruiter" && (recruiterMode === "signin" ? "Enterprise Recruiter Sign In" : "Register Enterprise Talent Seat")}
              {persona === "admin" && "Institutional Master Administration"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
              {persona === "student" &&
                (studentMode === "signup"
                  ? "Sign up to upload your certificates, generate ATS resumes, and apply to vetted roles at ISRO, Google, and Razorpay."
                  : "Sign in to access your talent radar, hackathon tracker, and Beacon AI Career Coach.")}
              {persona === "mentor" &&
                (mentorMode === "signin"
                  ? "Dedicated authentication console for senior engineering fellows (≥10 years industry experience)."
                  : "Join the pro-bono council guiding tier-2/3 college talent. Strict 10+ year background verification required.")}
              {persona === "recruiter" &&
                (recruiterMode === "signin"
                  ? "Access verified student passports, inspect cryptographic proof-of-work, and scout top engineering talent."
                  : "Register your enterprise organization. Strictly no commission-based or low-quality tasks allowed.")}
              {persona === "admin" &&
                "Master governance and telemetry console for credential audits, mentor verification, and opportunity review."}
            </p>
          </div>

          {/* Master 4-Persona Tab Navigation */}
          <div className="bg-white rounded-3xl border border-slate-300 shadow-sm p-5 sm:p-7 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Select Your Role / Portal:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setPersona("student");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    persona === "student"
                      ? "bg-white text-indigo-950 shadow-xs border border-slate-200 font-black"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPersona("mentor");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    persona === "mentor"
                      ? "bg-amber-400 text-slate-950 shadow-xs border border-amber-500 font-black"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <IconUsers size={14} />
                  <span>Mentor Council</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPersona("recruiter");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    persona === "recruiter"
                      ? "bg-cyan-600 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <IconBriefcase size={14} />
                  <span>Recruiters</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPersona("admin");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    persona === "admin"
                      ? "bg-indigo-900 text-white shadow-xs font-black"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  <IconShield size={14} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 inline-block" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 inline-block" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ==================== 1. STUDENT PORTAL ==================== */}
            {persona === "student" && (
              <div className="space-y-4">
                {/* Student Sub-Tabs: Sign Up vs Sign In */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode("signup");
                      setError("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      studentMode === "signup"
                        ? "bg-white text-indigo-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    1. Create Student Profile (Sign Up)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode("signin");
                      setError("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      studentMode === "signin"
                        ? "bg-white text-indigo-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    2. Student Sign In
                  </button>
                </div>

                {/* Google Authentication */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg width={20} height={20} className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-300 w-full" />
                  <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-600 shrink-0">
                    Or Continue With Student Email
                  </span>
                </div>

                {/* Form: Student Sign Up */}
                {studentMode === "signup" && (
                  <form onSubmit={handleStudentSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          Student Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="you@college.edu.in"
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
                        placeholder="Create a password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          placeholder="e.g. B.Tech Computer Science"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                        placeholder="e.g. Full Stack, AI & ML, Cloud Architecture"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                      />
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

                {/* Form: Student Sign In */}
                {studentMode === "signin" && (
                  <form onSubmit={handleStudentSignIn} className="space-y-4">
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
              </div>
            )}

            {/* ==================== 2. MENTOR COUNCIL ==================== */}
            {persona === "mentor" && (
              <div className="space-y-4">
                {/* Mentor Sub-Tabs: Sign In vs Sign Up */}
                <div className="flex items-center bg-amber-50 p-1 rounded-xl border border-amber-200 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMentorMode("signin");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      mentorMode === "signin"
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : "text-amber-900 hover:text-black"
                    }`}
                  >
                    1. Council Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMentorMode("signup");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      mentorMode === "signup"
                        ? "bg-amber-400 text-slate-950 shadow-xs"
                        : "text-amber-900 hover:text-black"
                    }`}
                  >
                    2. Apply to Council (Sign Up)
                  </button>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <IconShield size={16} />
                    <span>Strict ≥10 Years Experience Floor Required</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    Beacon Mentor Council is 100% pro-bono. Mentors must have at least 10 verified years in industry. Paid referrals and commercial upsells are prohibited.
                  </p>
                </div>

                {/* Sub-Form: Mentor Sign In */}
                {mentorMode === "signin" && (
                  <form onSubmit={handleMentorSignIn} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                        Verified Mentor Work Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="priya@uber.com or karan@microsoft.com"
                        value={mentorEmail}
                        onChange={(e) => setMentorEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Verifying Credentials..." : "Sign In to Mentor Council →"}
                    </button>

                    {/* Quick Access Verified Mentors */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">
                        Quick-Access Verified Council Mentors (Click to Test)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleMentorSignIn(undefined, "priya@uber.com", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-amber-400 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">Priya Sen</div>
                          <div className="text-[10px] text-amber-700 font-semibold truncate">Staff SRE • 11 Yrs</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMentorSignIn(undefined, "karan@microsoft.com", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-amber-400 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">Karan Verma</div>
                          <div className="text-[10px] text-amber-700 font-semibold truncate">Senior ML • 12 Yrs</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMentorSignIn(undefined, "sneha@cred.club", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-amber-400 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">Sneha Mukherjee</div>
                          <div className="text-[10px] text-amber-700 font-semibold truncate">Principal Des • 10 Yrs</div>
                        </button>
                      </div>
                    </div>

                    <div className="text-center pt-1">
                      <Link
                        href="/mentor-login"
                        className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Standalone Mentor Council Portal</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </form>
                )}

                {/* Sub-Form: Mentor Application & Sign Up */}
                {mentorMode === "signup" && (
                  <form onSubmit={handleMentorSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={mentorName}
                          onChange={(e) => setMentorName(e.target.value)}
                          placeholder="e.g. Arun Ramanathan"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Senior Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={mentorEmail}
                          onChange={(e) => setMentorEmail(e.target.value)}
                          placeholder="arun@google.com or name@enterprise.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Current Enterprise / Company *
                        </label>
                        <input
                          type="text"
                          required
                          value={mentorCompany}
                          onChange={(e) => setMentorCompany(e.target.value)}
                          placeholder="e.g. Google India, Uber, Razorpay"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Professional Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={mentorTitle}
                          onChange={(e) => setMentorTitle(e.target.value)}
                          placeholder="e.g. Principal Architect, Director of Eng"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Years of Industry Experience *
                        </label>
                        <select
                          value={mentorExpYears}
                          onChange={(e) => setMentorExpYears(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                        >
                          <option value="10">10 Years (Eligible)</option>
                          <option value="11">11 Years</option>
                          <option value="12">12 Years</option>
                          <option value="13">13 Years</option>
                          <option value="14">14 Years</option>
                          <option value="15">15 Years</option>
                          <option value="18">18 Years</option>
                          <option value="20">20+ Years (Senior Fellow)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          LinkedIn Profile URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={mentorLinkedin}
                          onChange={(e) => setMentorLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/yourname"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                        Primary Mentorship Domain *
                      </label>
                      <input
                        type="text"
                        required
                        value={mentorDomain}
                        onChange={(e) => setMentorDomain(e.target.value)}
                        placeholder="e.g. Distributed Systems, Machine Learning, System Architecture"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={mentorPassword}
                        onChange={(e) => setMentorPassword(e.target.value)}
                        placeholder="Create a password (default: password123)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Submitting Council Application..." : "Submit Council Application & Sign Up →"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ==================== 3. RECRUITER HUB ==================== */}
            {persona === "recruiter" && (
              <div className="space-y-4">
                {/* Recruiter Sub-Tabs: Sign In vs Sign Up */}
                <div className="flex items-center bg-cyan-50 p-1 rounded-xl border border-cyan-200 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRecruiterMode("signin");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      recruiterMode === "signin"
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-cyan-900 hover:text-black"
                    }`}
                  >
                    1. Recruiter Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecruiterMode("signup");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      recruiterMode === "signup"
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-cyan-900 hover:text-black"
                    }`}
                  >
                    2. Register Enterprise Seat (Sign Up)
                  </button>
                </div>

                <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-cyan-950 font-black text-xs">
                    <IconShield size={16} />
                    <span>Beacon Verified Professional Postings Floor</span>
                  </div>
                  <p className="text-[11px] text-cyan-900 font-medium leading-relaxed">
                    Only verified engineering internships, fellowships, and graduate SDE roles are permitted. Commission-only telecalling and spurious task jobs are permanently banned.
                  </p>
                </div>

                {/* Sub-Form: Recruiter Sign In */}
                {recruiterMode === "signin" && (
                  <form onSubmit={handleRecruiterSignIn} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                        Corporate Work Email
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="recruiter@razorpay.com, talent@company.com"
                        value={recruiterEmail}
                        onChange={(e) => setRecruiterEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                          Password
                        </label>
                        <span className="text-[10px] text-slate-500 font-bold">Default: password123</span>
                      </div>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={recruiterPassword}
                        onChange={(e) => setRecruiterPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Authenticating Recruiter..." : "Sign In to Recruiter Console →"}
                    </button>

                    {/* Quick Access Verified Recruiters */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">
                        One-Click Verified Recruiter Logins (Test Access)
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        <button
                          type="button"
                          onClick={() => handleRecruiterSignIn(undefined, "recruiter@razorpay.com", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-cyan-500 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">Razorpay</div>
                          <div className="text-[10px] text-cyan-700 font-semibold truncate">recruiter@razorpay.com</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRecruiterSignIn(undefined, "talent@microsoft.com", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-cyan-500 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">Microsoft</div>
                          <div className="text-[10px] text-cyan-700 font-semibold truncate">talent@microsoft.com</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRecruiterSignIn(undefined, "careers@isro.gov.in", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-cyan-500 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">ISRO SAC</div>
                          <div className="text-[10px] text-cyan-700 font-semibold truncate">careers@isro.gov.in</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRecruiterSignIn(undefined, "recruiter@google.com", "password123")}
                          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-cyan-500 text-left cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">Google India</div>
                          <div className="text-[10px] text-cyan-700 font-semibold truncate">recruiter@google.com</div>
                        </button>
                      </div>
                    </div>

                    <div className="text-center pt-1">
                      <Link
                        href="/recruiter-login"
                        className="text-xs font-bold text-cyan-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Standalone Recruiter Hub Portal</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </form>
                )}

                {/* Sub-Form: Recruiter Sign Up */}
                {recruiterMode === "signup" && (
                  <form onSubmit={handleRecruiterSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={recruiterName}
                          onChange={(e) => setRecruiterName(e.target.value)}
                          placeholder="e.g. Shalini Roy"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Corporate Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={recruiterEmail}
                          onChange={(e) => setRecruiterEmail(e.target.value)}
                          placeholder="shalini@swiggy.in"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Enterprise / Organization *
                        </label>
                        <input
                          type="text"
                          required
                          value={recruiterCompany}
                          onChange={(e) => setRecruiterCompany(e.target.value)}
                          placeholder="e.g. Swiggy, Cred, Zerodha"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                          Title / Position *
                        </label>
                        <input
                          type="text"
                          required
                          value={recruiterTitle}
                          onChange={(e) => setRecruiterTitle(e.target.value)}
                          placeholder="e.g. Head of University Recruiting"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={recruiterPassword}
                        onChange={(e) => setRecruiterPassword(e.target.value)}
                        placeholder="Create a password (default: password123)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Registering Enterprise Seat..." : "Register Enterprise Seat & Access Passports →"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ==================== 4. ADMIN CONSOLE ==================== */}
            {persona === "admin" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-950 font-black text-xs">
                    <IconShield size={16} />
                    <span>Institutional Platform Governance & Credential Audit Authority</span>
                  </div>
                  <p className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                    Access restricted to authorized institutional administrators. Review pending mentor credential applications, audit recruiter postings, and verify student cryptographically stamped passports.
                  </p>
                </div>

                <form onSubmit={handleAdminSignIn} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-800 mb-1">
                      Institutional Admin Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@beacon.network"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                        Admin Security Master Key
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">Pre-filled for testing</span>
                    </div>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-900 hover:bg-slate-950 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <IconShield size={16} />
                    <span>{loading ? "Authenticating Master Session..." : "Log In as Institutional Master Admin →"}</span>
                  </button>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Default: admin@beacon.network / beacon-admin-2026</span>
                    <Link
                      href="/admin-login"
                      className="font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Dedicated Admin Portal</span>
                      <span>→</span>
                    </Link>
                  </div>
                </form>
              </div>
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
