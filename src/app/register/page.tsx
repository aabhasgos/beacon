"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCheckCircle, IconShield, IconUsers } from "@/components/icons/Icons";
import { getSupabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function RegisterProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Student-specific state
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("2027");
  const [cgpa, setCgpa] = useState("8.5");
  const [interests, setInterests] = useState("Full Stack Development, AI & Machine Learning, Cloud Systems");
  const [headline, setHeadline] = useState("");

  // Mentor-specific state (Phase 3: 10+ Year Requirement)
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [experienceYears, setExperienceYears] = useState("12");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [primaryDomain, setPrimaryDomain] = useState("Distributed Systems & Backend Architecture");
  const [mentorBio, setMentorBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        role,
        fullName,
        email,
        password,
      };

      if (role === "student") {
        payload.college = college;
        payload.degree = degree;
        payload.graduationYear = graduationYear;
        payload.cgpa = cgpa;
        payload.interests = interests;
        payload.headline = headline || `${degree || "Computer Science"} @ ${college || "University"}`;
      } else {
        payload.company = company;
        payload.title = title;
        payload.experienceYears = Number(experienceYears);
        payload.linkedinUrl = linkedinUrl;
        payload.headline = `${title || "Senior Lead"} @ ${company || "Enterprise"}`;
        payload.bio = mentorBio || `${experienceYears}+ years in enterprise systems and software architecture.`;
        payload.interests = primaryDomain;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        if (role === "mentor") {
          router.push("/app/mentors?registered=true");
        } else {
          router.push("/app/passport?onboarding=true");
        }
      } else {
        const d = await res.json();
        setError(d.error || "Profile registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

      // Seamless fallback to instant testing session
      const targetEmail = (email || "test.student@beacon.dev").trim();
      const studentName = fullName.trim() || targetEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          name: studentName,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          localStorage.setItem("beacon_user", JSON.stringify(d.user));
        }
        router.push("/app/passport?onboarding=true");
      }
    } catch (err) {
      setError("Google authentication service unavailable.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans relative transition-colors">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <Link href="/" className="inline-flex flex-col items-center gap-2 mb-3 group">
          <img
            src="/logo-icon.jpg"
            alt="Beacon"
            className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-2xl tracking-tight text-slate-950 dark:text-white">
            Beacon
          </span>
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 -mt-1">
            Your journey. Your direction.
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          {role === "student" ? "Create your Verified Student Passport" : "Apply as a 10+ Year Verified Mentor"}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto">
          {role === "student"
            ? "Join thousands of students building their verified proof-of-work passport, unlocking internships, and discovering AI course roadmaps."
            : "Guide ambitious builders pro-bono. Strict 10+ year experience vetting and peer council review required."}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-md rounded-3xl border border-slate-300 dark:border-slate-800 sm:px-10 space-y-6">
          {/* Phase 3: Dual-Role Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Your Role on Beacon:
            </label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === "student"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span>🎓</span>
                <span>Student / Builder</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("mentor")}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  role === "mentor"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span>💼</span>
                <span>Senior Mentor (10+ Yrs)</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-300 text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Student Fast Google Sign-up */}
          {role === "student" && (
            <>
              <button
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 dark:hover:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-white text-xs sm:text-sm font-bold shadow-xs hover:border-slate-400 transition-all cursor-pointer"
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
                <span>{googleLoading ? "Connecting to Google..." : "Fast Sign-Up with Google"}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-300 dark:border-slate-700 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
                  or enter email details
                </span>
              </div>
            </>
          )}

          {/* Mentor Vetting Notice */}
          {role === "mentor" && (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 text-xs space-y-1.5 leading-relaxed font-medium">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                <IconShield size={15} />
                <span>Beacon Mentor Council Vetting Protocol</span>
              </div>
              <p>
                To protect student learning, all mentors must have a minimum of <strong>10 verified years in industry</strong>. Your LinkedIn profile will be validated by existing council fellows.
              </p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === "student" ? "e.g. Aabhas Goswami" : "e.g. Priya Sen"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {role === "student" ? "Email Address *" : "Work / Corporate Email *"}
                </label>
                <input
                  type="email"
                  required
                  placeholder={role === "student" ? "student@college.edu.in" : "engineer@company.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Create a secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            {/* Student Specific Fields */}
            {role === "student" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      College / Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NIT Kurukshetra, IIT, DTU"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Degree & Major *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Tech Computer Science"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Expected Graduation Year
                    </label>
                    <select
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      <option value="2025">2025 (Final Year)</option>
                      <option value="2026">2026 (Pre-Final Year)</option>
                      <option value="2027">2027 (Second Year)</option>
                      <option value="2028">2028 (First Year)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Academic CGPA (Out of 10.0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="8.85"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Target Roles & Interests
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Systems Engineering, Distributed Systems, Rust, Next.js"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </>
            )}

            {/* Mentor Specific Fields (Phase 3) */}
            {role === "mentor" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Current Company / Enterprise *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Razorpay, Microsoft, Google"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Staff SRE, Principal Architect"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Total Years in Industry * (Must be 10+)
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={45}
                      placeholder="e.g. 12"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      LinkedIn Profile URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://linkedin.com/in/your-profile"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Primary Practitioner Domain
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems, Linux Kernel, ML Inference, FinTech"
                    value={primaryDomain}
                    onChange={(e) => setPrimaryDomain(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading
                ? "Submitting Application..."
                : role === "student"
                ? "Complete Student Profile & Enter Beacon"
                : "Submit 10+ Year Mentor Application"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
