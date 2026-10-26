"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconAward,
  IconCheckCircle,
  IconUpload,
  IconFileText,
  IconExternalLink,
  IconDownload,
  IconSparkles,
} from "@/components/icons/Icons";
import { getSupabase } from "@/lib/supabase/client";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

export default function PassportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCertModal, setShowCertModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [copiedCvText, setCopiedCvText] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);

  // AI Diagnostic State
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // Certificate Form State
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certCredId, setCertCredId] = useState("");
  const [certCredUrl, setCertCredUrl] = useState("");
  const [certProvenance, setCertProvenance] = useState("Source-backed");
  const [certSkills, setCertSkills] = useState("");
  const [certFile, setCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);

  // Resume Form State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSkills, setResumeSkills] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);

  // Profile Edit State
  const [editFullName, setEditFullName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editGradYear, setEditGradYear] = useState("");
  const [editCgpa, setEditCgpa] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editHeadline, setEditHeadline] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editPortfolio, setEditPortfolio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Direct Upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState("");

  // Share Notification & Onboarding State
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Auto-resolve Google OAuth session from hash if present
  useEffect(() => {
    async function checkAuthHash() {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("onboarding") === "true") {
          setIsOnboarding(true);
        }

        // Check if returning with #access_token=... from Supabase Google OAuth
        if (window.location.hash.includes("access_token")) {
          try {
            const supabase = getSupabase();
            if (supabase) {
              const { data: authData } = await supabase.auth.getSession();
              const sessionUser = authData?.session?.user;
              if (sessionUser?.email) {
                const res = await fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: sessionUser.email,
                    name:
                      sessionUser.user_metadata?.full_name ||
                      sessionUser.user_metadata?.name ||
                      sessionUser.email.split("@")[0],
                  }),
                });
                if (res.ok) {
                  const googleData = await res.json();
                  if (googleData.user) {
                    localStorage.setItem("beacon_user", JSON.stringify(googleData.user));
                  }
                  window.history.replaceState(null, "", window.location.pathname + (isOnboarding ? "?onboarding=true" : ""));
                  await loadPassport();
                  return;
                }
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    checkAuthHash();
  }, [isOnboarding]);

  async function loadPassport() {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        const u = d.user;
        const p = d.profile;
        if (u) {
          setEditFullName(u.full_name || "");
          setEditCollege(u.college || "");
          setEditDegree(u.degree || "");
          setEditGradYear(u.graduation_year ? String(u.graduation_year) : "");
          setEditCgpa(u.cgpa ? String(u.cgpa) : "");
          setEditLocation(u.location || "");
          setEditHeadline(u.headline || "");
          setEditBio(u.bio || "");
        }
        if (p) {
          setEditGithub(p.github_url || "");
          setEditLinkedin(p.linkedin_url || "");
          setEditPortfolio(p.portfolio_url || "");
        }
      }

      // Also load projects for CV builder
      try {
        const projRes = await fetch("/api/projects");
        if (projRes.ok) {
          const pd = await projRes.json();
          setUserProjects(pd.projects || []);
        }
      } catch (err) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPassport();
  }, []);

  const handleOpenEditModal = () => {
    const u = data?.user;
    const p = data?.profile;
    if (u) {
      setEditFullName(u.full_name || "");
      setEditCollege(u.college || "");
      setEditDegree(u.degree || "");
      setEditGradYear(u.graduation_year ? String(u.graduation_year) : "");
      setEditCgpa(u.cgpa ? String(u.cgpa) : "");
      setEditLocation(u.location || "");
      setEditHeadline(u.headline || "");
      setEditBio(u.bio || "");
    }
    if (p) {
      setEditGithub(p.github_url || "");
      setEditLinkedin(p.linkedin_url || "");
      setEditPortfolio(p.portfolio_url || "");
    }
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce compulsory fields (every field required except CGPA)
    if (!editFullName.trim()) {
      alert("Full Name is compulsory.");
      return;
    }
    if (!editCollege.trim()) {
      alert("College / University is compulsory.");
      return;
    }
    if (!editDegree.trim()) {
      alert("Degree & Major is compulsory.");
      return;
    }
    if (!editGradYear || !String(editGradYear).trim()) {
      alert("Graduation Year is compulsory.");
      return;
    }
    if (!editLocation.trim()) {
      alert("Location / City is compulsory.");
      return;
    }
    if (!editHeadline.trim()) {
      alert("Professional Headline is compulsory.");
      return;
    }
    if (!editBio.trim()) {
      alert("Bio / About You is compulsory.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          college: editCollege.trim(),
          degree: editDegree.trim(),
          graduationYear: editGradYear ? Number(editGradYear) : null,
          cgpa: editCgpa ? Number(editCgpa) : null,
          location: editLocation.trim(),
          headline: editHeadline.trim(),
          bio: editBio.trim(),
          githubUrl: editGithub.trim() || null,
          linkedinUrl: editLinkedin.trim() || null,
          portfolioUrl: editPortfolio.trim() || null,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        await loadPassport();
        try {
          const stored = localStorage.getItem("beacon_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.full_name = editFullName.trim();
            parsed.college = editCollege.trim() || null;
            parsed.degree = editDegree.trim() || null;
            parsed.cgpa = editCgpa ? Number(editCgpa) : null;
            localStorage.setItem("beacon_user", JSON.stringify(parsed));
          }
        } catch (e) {}
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save profile changes.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarSuccessMsg("");
    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const d = await res.json();
        setAvatarSuccessMsg("Photo uploaded successfully! ✓");
        setTimeout(() => setAvatarSuccessMsg(""), 3500);
        await loadPassport();
        try {
          const stored = localStorage.getItem("beacon_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.avatar_url = d.avatarUrl;
            localStorage.setItem("beacon_user", JSON.stringify(parsed));
          }
        } catch (e) {}
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload photo.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRunProfileAudit = async () => {
    setRunningAudit(true);
    try {
      const res = await fetch("/api/agent/analyze-profile", {
        method: "POST",
      });
      if (res.ok) {
        const d = await res.json();
        setAuditResult(d.analysis);
        await loadPassport();
      } else {
        alert("Failed to analyze profile.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningAudit(false);
    }
  };

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle || !certIssuer || !certDate) {
      alert("Please fill in Title, Issuer, and Issue Date.");
      return;
    }

    setUploadingCert(true);
    const fd = new FormData();
    fd.append("title", certTitle);
    fd.append("issuer", certIssuer);
    fd.append("issueDate", certDate);
    fd.append("credentialId", certCredId);
    fd.append("credentialUrl", certCredUrl);
    fd.append("provenance", certProvenance);
    fd.append("skillsCovered", certSkills);
    if (certFile) {
      fd.append("file", certFile);
    }

    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        setShowCertModal(false);
        setCertTitle("");
        setCertIssuer("");
        setCertDate("");
        setCertCredId("");
        setCertCredUrl("");
        setCertSkills("");
        setCertFile(null);
        await loadPassport();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload certificate.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      alert("Please select a PDF or DOCX file.");
      return;
    }

    setUploadingResume(true);
    const fd = new FormData();
    fd.append("resume", resumeFile);
    fd.append("skills", resumeSkills);

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        setShowResumeModal(false);
        setResumeFile(null);
        setResumeSkills("");
        await loadPassport();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload resume.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSharePassport = () => {
    navigator.clipboard.writeText(window.location.origin + "/app/passport");
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const user = data?.user;
  const profile = data?.profile;
  const skills = data?.skills || [];
  const certificates = data?.certificates || [];
  const resume = data?.primaryResume;

  return (
    <AppLayout>
      {/* Hidden File Input for Direct Avatar Upload */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Onboarding Guidance Strip (Light, Friendly, Symmetrical) */}
        {isOnboarding && (
          <div className="bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-3xl p-5 sm:p-6 text-indigo-950 dark:text-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative animate-fade-in shadow-2xs">
            <button
              onClick={() => setIsOnboarding(false)}
              className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 font-black text-xs w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <span>🚀 Complete Your Passport</span>
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white">
                Welcome to Beacon, {user?.full_name ? user.full_name.split(" ")[0] : "Student"}!
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
                Add your actual university, major, and upload your resume and course certificates. Beacon AI uses your verified credentials to match you directly to top internships.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleOpenEditModal}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-xs border border-slate-300 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                ✎ Add Academic Details
              </button>
              <button
                onClick={() => setShowResumeModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <IconFileText size={14} />
                <span>Upload Master Resume</span>
              </button>
            </div>
          </div>
        )}

        {/* Executive-Grade Student Passport Card (Clean, Symmetrical, High-Contrast) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Subtle Accent Header Banner - Spacious with clean top-right status & share controls */}
          <div className="h-36 sm:h-40 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-6 sm:px-8 py-4 sm:py-5 flex items-start justify-end relative">
            <div className="flex flex-wrap items-center justify-end gap-2.5 z-10">
              <div className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-bold border border-emerald-400/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Public Student Passport Live</span>
              </div>
              <button
                onClick={handleSharePassport}
                className="bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <IconExternalLink size={13} />
                <span>{copiedShareLink ? "Link Copied! ✓" : "Share Profile Link"}</span>
              </button>
            </div>
          </div>

          {/* Profile Identity & Main Symmetrical Body */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            {/* Top Row: Avatar on the Left (Unobstructed) & Action Toolbar on the Right */}
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-14 sm:-mt-16 mb-5 gap-4">
              {/* Profile Avatar with Direct Upload Trigger & Resilient Monogram Fallback */}
              <div className="relative group inline-block shrink-0">
                <StudentAvatar
                  name={user?.full_name}
                  avatarUrl={user?.avatar_url}
                  size="xl"
                  showRing
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md border-2 border-white dark:border-slate-900 cursor-pointer transition-transform hover:scale-105"
                  title="Upload / Change Profile Picture"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Action Toolbar: Solid, Clear, High-Contrast & Dark-Mode Ready */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleOpenEditModal}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-transparent dark:border-slate-700"
                >
                  <span>✎ Edit Profile</span>
                </button>
                <button
                  onClick={handleRunProfileAudit}
                  disabled={runningAudit}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <IconSparkles size={14} />
                  <span>{runningAudit ? "Analyzing..." : "AI Diagnostic"}</span>
                </button>
                <button
                  onClick={() => setShowCvModal(true)}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <IconFileText size={14} />
                  <span>📄 Build & Export CV</span>
                </button>
                <button
                  onClick={() => setShowCertModal(true)}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <IconUpload size={14} />
                  <span>Store Certificate</span>
                </button>
                <button
                  onClick={() => setShowResumeModal(true)}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <IconFileText size={14} />
                  <span>Upload Resume</span>
                </button>
              </div>
            </div>

            {/* Avatar feedback message */}
            {avatarSuccessMsg && (
              <div className="mb-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 px-3 py-1.5 rounded-xl inline-block">
                {avatarSuccessMsg}
              </div>
            )}

            {/* Student Name & Subtitle in High-Contrast Obsidian / White Text */}
            <div className="space-y-1.5 mb-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                  {user?.full_name || "Student"}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <span>✓</span> Verified Student
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Public Passport
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {user?.headline || (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    No headline set yet. Click &ldquo;Edit Profile&rdquo; to add your program and career focus.
                  </span>
                )}
              </p>
            </div>

            {/* Symmetrical 4-Card Academic Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 py-5 border-y border-slate-200/90 dark:border-slate-800 text-xs">
              {/* Institution Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🏛️</span>
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
                      Institution
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-950 dark:text-white text-sm block mt-1 leading-snug break-words">
                    {user?.college || <span className="text-slate-400 dark:text-slate-500 font-medium">Not specified yet</span>}
                  </span>
                </div>
                {!user?.college && (
                  <button
                    onClick={handleOpenEditModal}
                    className="mt-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-left underline"
                  >
                    + Add University
                  </button>
                )}
              </div>

              {/* Program & Major Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">🎓</span>
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
                      Degree & Major
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-950 dark:text-white text-sm block mt-1 leading-snug break-words">
                    {user?.degree ? (
                      `${user.degree}${user.graduation_year ? ` (Class of ${user.graduation_year})` : ""}`
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">Not specified yet</span>
                    )}
                  </span>
                </div>
                {!user?.degree && (
                  <button
                    onClick={handleOpenEditModal}
                    className="mt-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-left underline"
                  >
                    + Add Degree
                  </button>
                )}
              </div>

              {/* Academic CGPA Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">📊</span>
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
                      Verified CGPA
                    </span>
                  </div>
                  <span className="font-black text-indigo-700 dark:text-indigo-400 text-base font-mono block mt-1">
                    {user?.cgpa ? `${user.cgpa} / 10.0` : <span className="text-slate-400 dark:text-slate-500 font-sans font-medium text-xs">Not specified yet</span>}
                  </span>
                </div>
                {!user?.cgpa && (
                  <button
                    onClick={handleOpenEditModal}
                    className="mt-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-left underline"
                  >
                    + Add CGPA
                  </button>
                )}
              </div>

              {/* Location Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">📍</span>
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">
                      Location
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-950 dark:text-white text-sm block mt-1 leading-snug break-words">
                    {user?.location || <span className="text-slate-400 dark:text-slate-500 font-medium">Not specified yet</span>}
                  </span>
                </div>
                {!user?.location && (
                  <button
                    onClick={handleOpenEditModal}
                    className="mt-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-left underline"
                  >
                    + Add Location
                  </button>
                )}
              </div>
            </div>

            {/* Bio statement */}
            <div className="pt-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
              {user?.bio ? (
                <p className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 italic text-slate-800 dark:text-slate-200">
                  &ldquo;{user.bio}&rdquo;
                </p>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 italic">
                  No personal bio added yet.{" "}
                  <button
                    onClick={handleOpenEditModal}
                    className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline not-italic cursor-pointer"
                  >
                    Click to add a brief bio
                  </button>
                </p>
              )}
            </div>

            {/* External Links */}
            <div className="pt-3 flex flex-wrap gap-4 text-xs font-bold">
              {profile?.github_url ? (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 underline underline-offset-4"
                >
                  <span>GitHub: {profile.github_url.split("/").pop()}</span>
                  <span>↗</span>
                </a>
              ) : null}
              {profile?.linkedin_url ? (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 underline underline-offset-4"
                >
                  <span>LinkedIn Profile</span>
                  <span>↗</span>
                </a>
              ) : null}
              {profile?.portfolio_url ? (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1 underline underline-offset-4"
                >
                  <span>Personal Portfolio</span>
                  <span>↗</span>
                </a>
              ) : null}
              {!profile?.github_url && !profile?.linkedin_url && (
                <button
                  onClick={handleOpenEditModal}
                  className="text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-400 flex items-center gap-1 font-semibold"
                >
                  <span>+ Link GitHub & LinkedIn</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Profile Diagnostic Card */}
        {auditResult && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-indigo-800 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-300">
                  <IconSparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Beacon AI Diagnostic Report</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {auditResult.readinessTier}
                </h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center shrink-0">
                <span className="text-[10px] text-indigo-200 uppercase font-bold block tracking-wider">Placement Readiness</span>
                <span className="text-2xl font-black text-emerald-400">{auditResult.readinessScore} / 100</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              {auditResult.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  ✓ Verified Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-100">
                  {auditResult.verifiedStrengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  ⚠️ Critical Skill Gaps to Bridge
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-100">
                  {auditResult.skillGaps?.map((g: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section: Master Resume Attachment */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📄</span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Primary Application Resume</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pre-attached when you submit verified internship applications</p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {resume ? "Active" : "Pending"}
            </span>
          </div>

          {resume ? (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  {resume.file_name?.split(".").pop()?.toUpperCase() || "DOC"}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white">{resume.file_name}</h4>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {Math.round(resume.file_size / 1024)} KB • Uploaded {resume.uploaded_at?.slice(0, 10)}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-1 italic leading-relaxed">
                    &ldquo;{resume.parsed_summary}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={resume.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <IconDownload size={13} />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setShowResumeModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  Replace
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">No resume currently attached to your student record.</p>
              <button
                onClick={() => setShowResumeModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <IconUpload size={14} />
                <span>Upload Master Resume PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Certificate Locker */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📜</span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Verified Certificate Locker</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Store and display your verified course credentials, college awards, and hackathon finalists.
              </p>
            </div>

            <button
              onClick={() => setShowCertModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <IconUpload size={13} />
              <span>Store Certificate</span>
            </button>
          </div>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                        {cert.provenance}
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        ✓ {cert.verified_status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white leading-snug">
                        {cert.title}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                        {cert.issuer}
                      </p>
                    </div>

                    {cert.skills_covered && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cert.skills_covered.split(",").map((s: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Issued: {cert.issue_date}</span>
                    <div className="flex items-center gap-2">
                      {cert.file_path && (
                        <a
                          href={cert.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-1"
                          title="Download Document"
                        >
                          <IconDownload size={12} />
                          <span>File</span>
                        </a>
                      )}
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center gap-0.5"
                        >
                          <span>Verify</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">No certificates stored yet.</p>
              <button
                onClick={() => setShowCertModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <IconUpload size={13} />
                <span>Store Your First Certificate</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Verified Skills Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Verified Skills Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Demonstrated capabilities backed by code artifacts, diagnostic audits, or course credentials.
            </p>
          </div>

          {skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {skills.map((s: any) => (
                <div key={s.id} className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white">{s.skill_name}</span>
                    <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-200 text-indigo-900 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                      {s.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {s.evidence_notes || "Demonstrated student capability."}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mb-3">
                No verified skills recorded yet. Complete the AI Profile Diagnostic to automatically extract and verify your skills.
              </p>
              <button
                onClick={handleRunProfileAudit}
                disabled={runningAudit}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <IconSparkles size={14} />
                <span>{runningAudit ? "Analyzing Resume & Syncing Skills..." : "Run AI Skills Diagnostic"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: EDIT PROFILE DETAILS (Full Control for Student) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto border border-slate-200 animate-fade-in">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-black text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-black text-xl text-slate-950 mb-1">Edit Student Passport Details</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Enter your actual university, major, and career goals.
            </p>

            <div className="bg-amber-50/90 border border-amber-200 text-amber-900 text-xs px-3.5 py-2 rounded-xl mb-4 font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>All fields marked with <strong className="text-rose-600">*</strong> are compulsory for student passport verification (CGPA is optional).</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Name <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="e.g. Your Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    College / University <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="e.g. NIT Kurukshetra, IIT, DTU"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Degree & Major <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Graduation Year <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2035}
                    value={editGradYear}
                    onChange={(e) => setEditGradYear(e.target.value)}
                    placeholder="e.g. 2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Actual CGPA <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    placeholder="e.g. 8.5 (Optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Location / City <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Kurukshetra, India"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Professional Headline <span className="text-rose-500 font-black">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  placeholder="e.g. B.Tech CSE Student | Full Stack & AI Developer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Bio / About You <span className="text-rose-500 font-black">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Briefly describe your technical focus, key interests, and career ambitions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    value={editPortfolio}
                    onChange={(e) => setEditPortfolio(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? "Saving Details..." : "Save Passport Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: STORE CERTIFICATE */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto border border-slate-200 animate-fade-in">
            <button
              onClick={() => setShowCertModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-black text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-black text-lg text-slate-950 mb-1">Store Certificate in Locker</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Upload your certificate file (PDF, PNG, JPG) to keep verifiable proof attached to your student record.
            </p>

            <form onSubmit={handleUploadCertificate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Certificate Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Full-Stack Specialization"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Issuer / University *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coursera / IIT Madras"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Credential ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CERT-8823901"
                    value={certCredId}
                    onChange={(e) => setCertCredId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Verification URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={certCredUrl}
                    onChange={(e) => setCertCredUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Skills Covered (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, REST APIs, Databases"
                  value={certSkills}
                  onChange={(e) => setCertSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Upload Certificate File (PDF / Image)</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingCert}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {uploadingCert ? "Saving..." : "Store Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD MASTER RESUME */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-slate-200 animate-fade-in">
            <button
              onClick={() => setShowResumeModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-black text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h3 className="font-black text-lg text-slate-950 mb-1">Update Master Resume</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Select your updated resume. It will be pre-attached whenever you submit applications through the Opportunity Radar.
            </p>

            <form onSubmit={handleUploadResume} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Select File (PDF or DOCX) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Key Skills Highlighted (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Next.js, Python, Node.js, PostgreSQL"
                  value={resumeSkills}
                  onChange={(e) => setResumeSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingResume}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {uploadingResume ? "Uploading..." : "Save Resume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LinkedIn-Style CV Builder & ATS Export Modal */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="text-lg font-black text-slate-950">
                    LinkedIn-Style Verified Student CV
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  ATS-optimized resume generated live from your verified credentials and proof of work.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `# ${user?.full_name || "Student"}\n${user?.headline || ""}\n${user?.email || ""} | ${user?.location || ""}\n\n## Education\n- ${user?.degree || "Undergraduate"}, ${user?.college || "University"}\n- CGPA: ${user?.cgpa || "N/A"}\n- Graduation: ${user?.graduation_year || "N/A"}\n\n## Verified Proof of Work\n${userProjects.map((p) => `- **${p.title}** (${p.category}): ${p.description} [Rubric: ${p.rubric_score || 85}/100]`).join("\n")}\n\n## Verified Skills\n${skills.map((s: any) => `- ${s.skill_name} [${s.provenance}]`).join("\n")}\n\n## Verified Credentials\n${certificates.map((c: any) => `- ${c.title} by ${c.issuer} (${c.credential_id || "Verified"})`).join("\n")}`;
                    navigator.clipboard.writeText(text);
                    setCopiedCvText(true);
                    setTimeout(() => setCopiedCvText(false), 2000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedCvText ? "Copied! ✓" : "📋 Copy Text"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowCvModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable ATS CV Sheet */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-900 font-sans shadow-inner">
              {/* Header */}
              <div className="border-b border-slate-300 pb-4 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {user?.full_name || "Student Name"}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-indigo-700">
                  {user?.headline || "Software Engineer & Computer Science Student"}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 font-medium">
                  {user?.email && <span>📧 {user.email}</span>}
                  {user?.location && <span>📍 {user.location}</span>}
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">
                      GitHub
                    </a>
                  )}
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline">
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  Education & Verification
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                  <div>
                    <strong className="text-slate-950 font-black block">
                      {user?.college || "University Not Specified"}
                    </strong>
                    <span className="text-slate-600 font-medium">
                      {user?.degree || "Major in Engineering"}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                      {user?.cgpa ? `Verified CGPA: ${user.cgpa} / 10` : "Academic Record"}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Graduation: {user?.graduation_year || "2027"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Proof of Work */}
              <div className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  Verifiable Proof of Work ({userProjects.length})
                </h2>
                {userProjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No projects registered in Proof Vault yet. Add your GitHub repositories to display official Artifact-backed badges.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userProjects.map((p) => (
                      <div key={p.id} className="text-xs space-y-1 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-950 font-black text-sm">{p.title}</strong>
                          <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            Rubric: {p.rubric_score || 85} / 100
                          </span>
                        </div>
                        <p className="text-slate-600 font-normal leading-relaxed">{p.description}</p>
                        {p.repository_url && (
                          <a href={p.repository_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold underline inline-block pt-1">
                            Inspect Repository →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Skills Matrix */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  Verified Skills Matrix ({skills.length})
                </h2>
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No skills verified yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s: any) => (
                      <span
                        key={s.id}
                        className="text-xs font-bold bg-white text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span>{s.skill_name}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                          {s.provenance}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Certificates */}
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                  Verified Certifications & Credentials ({certificates.length})
                </h2>
                {certificates.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No certificates uploaded to locker yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {certificates.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <div>
                          <strong className="text-slate-950 font-bold">{c.title}</strong>
                          <span className="text-slate-500 ml-1.5">({c.issuer})</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Verified Credential
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI CV Optimizer Advice */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-black">
                <IconSparkles size={15} />
                <span>Beacon AI CV Optimization Diagnostic</span>
              </div>
              <ul className="space-y-1 text-slate-700 font-medium">
                <li>• <strong>Quantifiable Metrics:</strong> Include specific numbers in project descriptions (e.g. latency, throughput, test coverage) to pass ATS filters at top firms.</li>
                <li>• <strong>Verified Proof:</strong> Upload course completion PDFs and GitHub repositories to upgrade claims from Self-reported to Artifact-backed.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
