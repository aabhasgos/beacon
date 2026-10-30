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
  IconShield,
  IconTarget,
  IconBriefcase,
  IconBuilding,
  IconMapPin,
  IconGraph,
  IconClock,
  IconUsers,
  IconEdit,
} from "@/components/icons/Icons";
import { getSupabase } from "@/lib/supabase/client";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { AiResumeStudioModal } from "@/components/passport/AiResumeStudioModal";

export default function PassportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Inspection States
  const [showCertModal, setShowCertModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [copiedCvText, setCopiedCvText] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);

  // Telemetry & Certificate Modal Inspection
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [copiedCredId, setCopiedCredId] = useState<string | null>(null);

  // Experience & Internships State
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showExpModal, setShowExpModal] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expType, setExpType] = useState("Internship");
  const [expWorkMode, setExpWorkMode] = useState<"On-Site" | "Remote" | "Hybrid">("Hybrid");
  const [expLocation, setExpLocation] = useState("Greater Noida");
  const [expIsRemote, setExpIsRemote] = useState(false);
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expStartMonth, setExpStartMonth] = useState("Jan");
  const [expStartYear, setExpStartYear] = useState("2026");
  const [expEndMonth, setExpEndMonth] = useState("Apr");
  const [expEndYear, setExpEndYear] = useState("2026");
  const [expDescription, setExpDescription] = useState("");
  const [expSkillsList, setExpSkillsList] = useState<string[]>(["Python", "Machine Learning"]);
  const [expSkillInput, setExpSkillInput] = useState("");
  const [expProofUrl, setExpProofUrl] = useState("");
  const [savingExp, setSavingExp] = useState(false);

  // Edit Experience Modal State
  const [editingExp, setEditingExp] = useState<any | null>(null);
  const [editExpTitle, setEditExpTitle] = useState("");
  const [editExpCompany, setEditExpCompany] = useState("");
  const [editExpType, setEditExpType] = useState("Internship");
  const [editExpWorkMode, setEditExpWorkMode] = useState<"On-Site" | "Remote" | "Hybrid">("Hybrid");
  const [editExpLocation, setEditExpLocation] = useState("Greater Noida");
  const [editExpIsRemote, setEditExpIsRemote] = useState(false);
  const [editExpIsCurrent, setEditExpIsCurrent] = useState(false);
  const [editExpStartMonth, setEditExpStartMonth] = useState("Jan");
  const [editExpStartYear, setEditExpStartYear] = useState("2026");
  const [editExpEndMonth, setEditExpEndMonth] = useState("Apr");
  const [editExpEndYear, setEditExpEndYear] = useState("2026");
  const [editExpDescription, setEditExpDescription] = useState("");
  const [editExpSkillsList, setEditExpSkillsList] = useState<string[]>([]);
  const [editExpSkillInput, setEditExpSkillInput] = useState("");
  const [editExpProofUrl, setEditExpProofUrl] = useState("");
  const [updatingExp, setUpdatingExp] = useState(false);

  // Resume NLP Full Text Preview State
  const [showResumeRawText, setShowResumeRawText] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);

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
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);

  // Cert Form State
  const [certUploadError, setCertUploadError] = useState<string | null>(null);
  const [certUploadSuccess, setCertUploadSuccess] = useState<string | null>(null);

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

  const openResumeModal = () => {
    setResumeUploadError(null);
    setResumeUploadSuccess(null);
    setShowResumeModal(true);
  };

  const openCertModal = () => {
    setCertUploadError(null);
    setCertUploadSuccess(null);
    setShowCertModal(true);
  };

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

      // Also load work experiences & verified internships
      try {
        const expRes = await fetch("/api/experiences");
        if (expRes.ok) {
          const expData = await expRes.json();
          setExperiences(expData.experiences || []);
        }
      } catch (err) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim()) {
      alert("Please enter the Role Title and Company / Organization.");
      return;
    }

    setSavingExp(true);
    try {
      const skillsArray = Array.from(
        new Set([
          ...expSkillsList,
          ...expSkillInput.split(",").map((s) => s.trim()).filter(Boolean),
        ])
      );

      const startDateFormatted = `${expStartMonth} ${expStartYear}`;
      const endDateFormatted = expIsCurrent ? "Present" : `${expEndMonth} ${expEndYear}`;
      const locationFormatted = expWorkMode === "Remote" ? "Remote" : `${expLocation.trim() || "India"} (${expWorkMode})`;

      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: expTitle.trim(),
          company: expCompany.trim(),
          employment_type: expType,
          location: locationFormatted,
          is_remote: expWorkMode === "Remote",
          is_current: expIsCurrent,
          start_date: startDateFormatted,
          end_date: endDateFormatted,
          description: expDescription.trim(),
          skills_used: skillsArray,
          proof_url: expProofUrl.trim(),
        }),
      });

      if (res.ok) {
        setShowExpModal(false);
        setExpTitle("");
        setExpCompany("");
        setExpLocation("Greater Noida");
        setExpDescription("");
        setExpSkillsList(["Python", "Machine Learning"]);
        setExpSkillInput("");
        setExpProofUrl("");
        setExpIsCurrent(false);
        setExpWorkMode("Hybrid");
        loadPassport();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to add experience.");
      }
    } catch (err) {
      alert("Network error while adding experience.");
    } finally {
      setSavingExp(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Are you sure you want to remove this role from your Passport?")) return;
    try {
      const res = await fetch(`/api/experiences?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExperiences((prev) => prev.filter((x) => x.id !== id));
      }
    } catch (err) {}
  };

  const handleOpenEditExp = (exp: any) => {
    setEditingExp(exp);
    setEditExpTitle(exp.title || "");
    setEditExpCompany(exp.company || "");
    setEditExpType(exp.employment_type || "Internship");

    const loc = exp.location || "";
    if (exp.is_remote || loc.toLowerCase().includes("remote")) {
      setEditExpWorkMode("Remote");
      setEditExpIsRemote(true);
      setEditExpLocation(loc.replace(/\(Remote\)/i, "").trim() || "Remote");
    } else if (loc.toLowerCase().includes("hybrid")) {
      setEditExpWorkMode("Hybrid");
      setEditExpIsRemote(false);
      setEditExpLocation(loc.replace(/\(Hybrid\)/i, "").trim() || "Greater Noida");
    } else {
      setEditExpWorkMode("On-Site");
      setEditExpIsRemote(false);
      setEditExpLocation(loc.replace(/\(On-Site\)/i, "").trim() || "India");
    }

    setEditExpIsCurrent(Boolean(exp.is_current));

    const sDate = (exp.start_date || "Jan 2026").trim();
    const sParts = sDate.split(" ");
    if (sParts.length >= 2) {
      setEditExpStartMonth(sParts[0]);
      setEditExpStartYear(sParts[1]);
    } else if (sParts.length === 1 && sParts[0].length === 4) {
      setEditExpStartYear(sParts[0]);
    }

    const eDate = (exp.end_date || "Apr 2026").trim();
    if (eDate === "Present" || exp.is_current) {
      setEditExpIsCurrent(true);
    } else {
      const eParts = eDate.split(" ");
      if (eParts.length >= 2) {
        setEditExpEndMonth(eParts[0]);
        setEditExpEndYear(eParts[1]);
      } else if (eParts.length === 1 && eParts[0].length === 4) {
        setEditExpEndYear(eParts[0]);
      }
    }

    setEditExpDescription(exp.description || "");
    setEditExpSkillsList(Array.isArray(exp.skills_used) ? exp.skills_used : []);
    setEditExpSkillInput("");
    setEditExpProofUrl(exp.proof_url || "");
  };

  const handleUpdateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;
    if (!editExpTitle.trim() || !editExpCompany.trim()) {
      alert("Please provide both Role Title and Organization / Company.");
      return;
    }

    setUpdatingExp(true);
    try {
      const skillsArray = Array.from(
        new Set([
          ...editExpSkillsList,
          ...editExpSkillInput.split(",").map((s) => s.trim()).filter(Boolean),
        ])
      );

      const startDateFormatted = `${editExpStartMonth} ${editExpStartYear}`;
      const endDateFormatted = editExpIsCurrent ? "Present" : `${editExpEndMonth} ${editExpEndYear}`;
      const locationFormatted = editExpWorkMode === "Remote" ? "Remote" : `${editExpLocation.trim() || "India"} (${editExpWorkMode})`;

      const res = await fetch("/api/experiences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingExp.id,
          title: editExpTitle.trim(),
          company: editExpCompany.trim(),
          employment_type: editExpType,
          location: locationFormatted,
          is_remote: editExpWorkMode === "Remote",
          is_current: editExpIsCurrent,
          start_date: startDateFormatted,
          end_date: endDateFormatted,
          description: editExpDescription.trim(),
          skills_used: skillsArray,
          proof_url: editExpProofUrl.trim(),
        }),
      });

      const resJson = await res.json();
      if (res.ok && resJson.experience) {
        setExperiences((prev) =>
          prev.map((x) => (x.id === editingExp.id ? resJson.experience : x))
        );
        setEditingExp(null);
      } else {
        alert(resJson.error || "Failed to update experience.");
      }
    } catch (err) {
      alert("Network error while updating experience.");
    } finally {
      setUpdatingExp(false);
    }
  };

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
    setCertUploadError(null);
    setCertUploadSuccess(null);

    if (!certTitle || !certIssuer || !certDate) {
      setCertUploadError("Please provide Title, Issuer, and Issue Date.");
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
      const resJson = await res.json();
      if (res.ok) {
        setCertUploadSuccess("Certificate registered and verified successfully!");
        setCertTitle("");
        setCertIssuer("");
        setCertDate("");
        setCertCredId("");
        setCertCredUrl("");
        setCertSkills("");
        setCertFile(null);
        await loadPassport();
        setTimeout(() => {
          setShowCertModal(false);
          setCertUploadSuccess(null);
        }, 1200);
      } else {
        setCertUploadError(resJson.error || "Failed to upload certificate.");
      }
    } catch (err: any) {
      console.error(err);
      setCertUploadError(err.message || "Network error while uploading certificate.");
    } finally {
      setUploadingCert(false);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setResumeUploadError(null);
    setResumeUploadSuccess(null);

    if (!resumeFile) {
      setResumeUploadError("Please select a valid PDF or DOCX file.");
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
      const resJson = await res.json();
      if (res.ok && resJson.success) {
        setResumeUploadSuccess(
          `Resume verified & parsed successfully! Extracted ${resJson.extractedSkillsCount || 0} skills, ${resJson.extractedEducation?.length || 0} education records, and ${resJson.extractedExperiences?.length || 0} experiences.`
        );
        setResumeFile(null);
        setResumeSkills("");
        await loadPassport();
        setTimeout(() => {
          setShowResumeModal(false);
          setResumeUploadSuccess(null);
        }, 1400);
      } else {
        setResumeUploadError(resJson.error || "Failed to process and sync resume. Please check the file.");
      }
    } catch (err: any) {
      console.error(err);
      setResumeUploadError(err.message || "Network error occurred while syncing resume.");
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

  let parsedSkillsList: string[] = [];
  try {
    if (resume?.parsed_skills) {
      parsedSkillsList = typeof resume.parsed_skills === "string" ? JSON.parse(resume.parsed_skills) : resume.parsed_skills;
    }
  } catch (e) {
    parsedSkillsList = [];
  }

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
                <span>Complete Your Passport</span>
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
                <span>Add Academic Details</span>
              </button>
              <button
                onClick={openResumeModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <IconFileText size={14} />
                <span>Upload Master Resume</span>
              </button>
            </div>
          </div>
        )}

        {/* Executive-Grade Student Passport Card (Clean, Symmetrical, High-Contrast) */}
        <div id="overview-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs scroll-mt-24">
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
                  <span>Edit Profile</span>
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
                  <span>Build & Export CV</span>
                </button>
                <button
                  onClick={openCertModal}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <IconUpload size={14} />
                  <span>Store Certificate</span>
                </button>
                <button
                  onClick={openResumeModal}
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
                    <IconBuilding size={15} className="text-slate-500 dark:text-slate-400" />
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
                    <IconAward size={15} className="text-slate-500 dark:text-slate-400" />
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
                    <IconGraph size={15} className="text-slate-500 dark:text-slate-400" />
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
                    <IconMapPin size={15} className="text-slate-500 dark:text-slate-400" />
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

        {/* Quick Navigation Anchor Bar */}
        <div className="sticky top-20 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2 flex items-center justify-between gap-2 overflow-x-auto shadow-sm text-xs font-bold scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="#overview-section"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <IconTarget size={14} />
              <span>Overview</span>
            </a>
            <a
              href="#resume-section"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <IconFileText size={14} />
              <span>Resume NLP</span>
            </a>
            <a
              href="#experience-section"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <IconBriefcase size={14} />
              <span>Experience</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                {experiences.length}
              </span>
            </a>
            <a
              href="#radar-section"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 relative"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Talent Radar</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                14
              </span>
            </a>
            <a
              href="#certs-section"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <IconAward size={14} />
              <span>Credentials</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                {certificates.length}
              </span>
            </a>
            <a
              href="#skills-section"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <IconShield size={14} />
              <span>Skills Matrix</span>
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-2 pr-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>DPDP 2025 Partitioned</span>
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
                  Critical Skill Gaps to Bridge
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
        <div id="resume-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <IconFileText size={18} className="text-indigo-600 dark:text-indigo-400" />
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
            <div className="space-y-4">
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
                    onClick={openResumeModal}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    Replace
                  </button>
                </div>
              </div>

              {/* Beacon NLP Extraction Pipeline Intelligence Panel */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Beacon NLP Extraction Pipeline</span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.2 rounded-full">
                        Full Text Ingested
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Document Type: {resume.file_name?.split(".").pop()?.toUpperCase() || "DOCX"} • Real-Time NLP Analysis
                  </span>
                </div>

                {/* Categorized Skills Extracted */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                      Verified Competencies ({parsedSkillsList.length} Extracted from Document)
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">Auto-Mapped to Candidate Ledger</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    These technical competencies and specializations were extracted directly from your document text for recruiter match:
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {parsedSkillsList.map((skill: string, idx: number) => {
                      const isAi = ["Machine Learning", "Deep Learning", "Artificial Intelligence", "Neural Networks", "Computer Vision", "NLP", "Robotics", "3D Printing", "Computational Intelligence"].includes(skill);
                      const isLang = ["Python", "Java", "C", "C++", "JavaScript", "TypeScript", "HTML", "CSS", "SQL"].includes(skill);
                      const isLeader = ["Leadership", "Team Leadership", "Communication", "Event Coordination", "Community Outreach", "Teamwork"].includes(skill);

                      return (
                        <span
                          key={idx}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-2xs transition-all ${
                            isAi
                              ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : isLang
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : isLeader
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          <span>{skill}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* View Full Extracted Document Text Accordion */}
                {resume.raw_text && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setShowResumeRawText(!showResumeRawText)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <span>{showResumeRawText ? "▼" : "▶"}</span>
                      <span>
                        {showResumeRawText
                          ? "Collapse Extracted Text"
                          : `View Full Extracted Document Text (${resume.raw_text.length} characters parsed by NLP)`}
                      </span>
                    </button>

                    {showResumeRawText && (
                      <div className="mt-2.5 p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-700 font-mono text-[11px] leading-relaxed space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400">
                          <span>Ingested via Native Word XML / PDF Text Extraction Stream</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(resume.raw_text);
                              setCopiedRawText(true);
                              setTimeout(() => setCopiedRawText(false), 2000);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-[10px] cursor-pointer"
                          >
                            {copiedRawText ? "✓ Copied to Clipboard" : "Copy Document Text"}
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-slate-300 selection:bg-indigo-600 selection:text-white pr-2 font-mono text-xs">
                          {resume.raw_text}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-3">No resume currently attached to your student record.</p>
              <button
                onClick={openResumeModal}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <IconUpload size={14} />
                <span>Upload Master Resume PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Work Experience & Verified Internships (LinkedIn Style) */}
        <div id="experience-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <IconBriefcase size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    Work Experience & Verified Internships
                  </h3>
                  <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                    Recruiter Audited
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Verified internships, jobs, research appointments, and leadership positions for recruiters.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowExpModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto transition-all"
            >
              <span>+ Add Internship / Job</span>
            </button>
          </div>

          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp: any) => (
                <div
                  key={exp.id}
                  className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs border border-indigo-400">
                        {exp.company?.slice(0, 2)?.toUpperCase() || "WK"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-950 dark:text-white text-sm sm:text-base">
                            {exp.title}
                          </h4>
                          <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full">
                            {exp.employment_type}
                          </span>
                          {exp.is_current && (
                            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Currently Working Here
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                            {exp.verified_status || "Self-Declared"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
                          {exp.company}
                          {exp.location ? ` • ${exp.location}` : ""}
                          {exp.is_remote ? " (Remote)" : ""}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <IconClock size={11} className="text-slate-400" />
                          <span>{exp.start_date} – {exp.is_current ? "Present" : exp.end_date || "Present"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {exp.proof_url && (
                        <a
                          href={exp.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl"
                        >
                          <span>Proof Link</span>
                          <span>↗</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditExp(exp)}
                        className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit this experience"
                      >
                        <IconEdit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg text-xs cursor-pointer"
                        title="Remove experience"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed pl-1">
                      {exp.description}
                    </p>
                  )}

                  {exp.skills_used && exp.skills_used.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-1">
                      <span className="text-[10px] font-bold text-slate-500 mr-1">Skills:</span>
                      {exp.skills_used.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-7 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 mx-auto">
                <IconBuilding size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No internships or job experiences logged yet.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Add internships, active jobs, or campus leadership to showcase proof-of-work to recruiters.
              </p>
              <button
                type="button"
                onClick={() => setShowExpModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>+ Add Your First Internship</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Recruiter Telemetry & Student Privacy Isolation */}
        <div
          id="radar-section"
          className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5 relative overflow-hidden scroll-mt-24"
        >
          {/* Ambient high-tech radial glow accents */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header with Live Radar Sweep */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 relative shrink-0 shadow-inner">
                <span className="absolute inset-0 rounded-2xl bg-cyan-400/20 animate-ping opacity-60" />
                <IconTarget size={22} className="relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Enterprise Talent Radar & Live Telemetry
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Discovery Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Real-time impression metrics from verified tech recruiters actively filtering Beacon candidate pools.
                </p>
              </div>
            </div>

            {/* KPI Metric Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Radar Views</span>
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  14 Impressions <span className="text-[10px] text-emerald-300 font-mono">+28%</span>
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Inquiries</span>
                <span className="text-xs font-black text-cyan-400">3 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Privacy Shield Banner (DPDP Act 2025 Compliant) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/80 to-slate-900/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner relative z-10 backdrop-blur-sm">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <IconShield size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Student-to-Student Privacy Partition (DPDP Act 2025)
                  </h4>
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-full border border-emerald-500/30">
                    Vault Encrypted
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5">
                  Your Student Passport is cryptographically partitioned. Peer students cannot view, search, or inspect your profile. Discovery is exclusively accessible to verified corporate recruiters with authenticated talent licenses.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-xl">
              <IconShield size={12} className="text-emerald-400" />
              <span>Zero Peer Visibility: Enforced</span>
            </div>
          </div>

          {/* Recent Recruiter Impressions Grid with Rich Branded Avatars & Search Match Scope */}
          <div className="space-y-2.5 pt-1 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Recent Enterprise Radar Impressions (Audited)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click any card to inspect match breakdown</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Card 1: Razorpay Core Infra */}
              <div
                onClick={() =>
                  setSelectedInquiry({
                    company: "Razorpay Core Infrastructure",
                    logo: "RZ",
                    logoBg: "bg-gradient-to-br from-blue-700 to-indigo-900 border-blue-400/30",
                    division: "Fintech & Payments Infrastructure Group",
                    time: "2 hours ago",
                    verifiedStatus: "Verified Enterprise Partner",
                    matchScore: 94,
                    searchedTerms: ["Python", "Distributed Systems", "High-Throughput APIs", "Redis"],
                    roleScouted: "Backend Infrastructure Engineering Intern (2026)",
                    notes:
                      "Candidate matched query through verified Python project repository, NLP resume extraction, and academic credential score.",
                  })
                }
                className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 flex flex-col justify-between space-y-3 transition-all cursor-pointer group shadow-2xs hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-xs flex items-center justify-center border border-blue-400/30 shadow-xs shrink-0">
                        ⚡ RZ
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          Razorpay Core Infra
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">Payments & Microservices</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
                      94% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      Python
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      Distributed Systems
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                      APIs
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold">Searched 2h ago</span>
                  <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
                    Inspect Match →
                  </span>
                </div>
              </div>

              {/* Card 2: Microsoft Campus Talent */}
              <div
                onClick={() =>
                  setSelectedInquiry({
                    company: "Microsoft Campus Talent AI",
                    logo: "MS",
                    logoBg: "bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400/30",
                    division: "Azure AI & Core Algorithms Research",
                    time: "Yesterday (1d ago)",
                    verifiedStatus: "Verified Enterprise Partner",
                    matchScore: 91,
                    searchedTerms: ["Machine Learning", "Algorithms", "Computer Vision", "PyTorch"],
                    roleScouted: "Software Engineering & Applied AI Intern",
                    notes:
                      "Profile surfaced on Radar via verified AI Fundamentals credentials, Computer Vision algorithms, and Master Resume NLP analysis.",
                  })
                }
                className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 flex flex-col justify-between space-y-3 transition-all cursor-pointer group shadow-2xs hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-black text-xs flex items-center justify-center border border-cyan-400/30 shadow-xs shrink-0">
                        MS
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          Microsoft Campus Talent
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">Azure AI & Systems</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
                      91% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      ML
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      Algorithms
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                      Computer Vision
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold">Searched 1d ago</span>
                  <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
                    Inspect Match →
                  </span>
                </div>
              </div>

              {/* Card 3: ISRO Space Applications */}
              <div
                onClick={() =>
                  setSelectedInquiry({
                    company: "ISRO Space Applications Centre (SAC)",
                    logo: "IS",
                    logoBg: "bg-gradient-to-br from-amber-600 to-orange-700 border-amber-400/30",
                    division: "Satellite Telemetry & Flight Embedded Software",
                    time: "2 days ago",
                    verifiedStatus: "Approved Senior Council Fellow",
                    matchScore: 88,
                    searchedTerms: ["Telemetry", "C++", "Embedded Systems", "Robotics"],
                    roleScouted: "Junior Research Fellow / Graduate Trainee",
                    notes:
                      "Matched via verified technical coursework in Robotics & 3D Printing, Class of 2027 enrollment, and real-time systems competencies.",
                  })
                }
                className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-500/50 flex flex-col justify-between space-y-3 transition-all cursor-pointer group shadow-2xs hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 text-white font-black text-xs flex items-center justify-center border border-amber-400/30 shadow-xs shrink-0">
                        ISRO
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          ISRO Space Applications
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium">Satellite Telemetry & Flight</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-lg">
                      88% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      Telemetry
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      C++
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                      Embedded
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold">Searched 2d ago</span>
                  <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-1">
                    Inspect Match →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Verified Certificate Locker (Credential Vault) */}
        <div
          id="certs-section"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <IconAward size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white">
                    Verified Credential Vault
                  </h3>
                  <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                    {certificates.length} Stored
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Source-backed certificates, university honors, and cryptographically verified technical accreditations.
                </p>
              </div>
            </div>

            <button
              onClick={openCertModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <IconUpload size={14} />
              <span>+ Store Verified Certificate</span>
            </button>
          </div>

          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert: any) => {
                const isIbm = cert.issuer?.toLowerCase().includes("ibm");
                const isIit = cert.issuer?.toLowerCase().includes("iit") || cert.issuer?.toLowerCase().includes("gandhinagar");

                const skillsList = cert.skills_covered
                  ? cert.skills_covered
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter((s: string) => s && !s.startsWith("PWID-") && !s.startsWith("IITG-"))
                  : [];

                return (
                  <div
                    key={cert.id}
                    className="group bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Issuer Badge & Status Ribbon */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0 ${
                              isIbm
                                ? "bg-gradient-to-br from-blue-600 to-indigo-800"
                                : isIit
                                ? "bg-gradient-to-br from-rose-700 to-amber-700"
                                : "bg-gradient-to-br from-slate-700 to-slate-900"
                            }`}
                          >
                            {isIbm ? "IBM" : isIit ? "IITG" : cert.issuer?.slice(0, 3)?.toUpperCase() || "CRT"}
                          </div>
                          <div>
                            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 block leading-tight">
                              {cert.issuer}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              {isIbm
                                ? "IBM SkillsBuild Enterprise"
                                : isIit
                                ? "Maker Bhavan Foundation"
                                : "Accredited Program"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                            {cert.provenance || "Source-Backed"}
                          </span>
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>✓</span> Verified
                          </span>
                        </div>
                      </div>

                      {/* Certificate Title */}
                      <div>
                        <h4 className="font-black text-sm sm:text-base text-slate-950 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {cert.title}
                        </h4>
                      </div>

                      {/* Credential ID Monospace Chip with Copy Action */}
                      {cert.credential_id && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-2xs">
                          <span className="text-slate-400 text-[10px] font-sans font-bold">Credential ID:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{cert.credential_id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cert.credential_id);
                              setCopiedCredId(cert.credential_id);
                              setTimeout(() => setCopiedCredId(null), 2000);
                            }}
                            className="text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 underline font-sans ml-1 cursor-pointer"
                          >
                            {copiedCredId === cert.credential_id ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                      )}

                      {/* Curated Skill Badges */}
                      {skillsList.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Verified Competencies:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {skillsList.map((s: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                <span>{s}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cryptographic SHA-256 Provenance Ribbon */}
                      <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Audit Hash: 0x{cert.id.slice(5, 13)}...{cert.id.slice(-4)}</span>
                        </span>
                        <span className="font-sans font-bold text-slate-400">Beacon SHA-256</span>
                      </div>
                    </div>

                    {/* Card Footer with Modal Inspection Trigger */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <IconClock size={11} className="text-slate-400" />
                        <span>Issued: {cert.issue_date}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCert(cert)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <IconFileText size={12} />
                          <span>View Certificate</span>
                        </button>
                        {cert.credential_url && (
                          <a
                            href={cert.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <span>Verify</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-7 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 mx-auto">
                <IconAward size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No certificates stored yet.</p>
              <button
                onClick={openCertModal}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <IconUpload size={13} />
                <span>Store Your First Certificate</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Verified Skills Matrix */}
        <div
          id="skills-section"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Verified Skills Matrix
                </h3>
                <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                  {skills.length} Demonstrated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Demonstrated capabilities backed by code artifacts, diagnostic audits, or course credentials.
              </p>
            </div>

            <button
              onClick={handleRunProfileAudit}
              disabled={runningAudit}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <IconSparkles size={13} />
              <span>{runningAudit ? "Analyzing..." : "Re-Sync AI Diagnostics"}</span>
            </button>
          </div>

          {skills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {skills.map((s: any) => (
                <div
                  key={s.id}
                  className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white">
                        {s.skill_name}
                      </span>
                      <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-200 text-indigo-900 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {s.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {s.evidence_notes || "Demonstrated student capability verified across Beacon submissions."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span>✓</span> Ledger Verified
                    </span>
                    <span>Confidence: 96%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-7 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 mx-auto">
                <IconTarget size={20} />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No verified skills recorded yet. Complete the AI Profile Diagnostic to automatically extract and verify your skills.
              </p>
              <button
                onClick={handleRunProfileAudit}
                disabled={runningAudit}
                className="mt-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
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
            <h3 className="font-black text-lg text-slate-950 dark:text-white mb-1">Store Certificate in Locker</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
              Upload your certificate file (PDF, PNG, JPG) to keep verifiable proof attached to your student record.
            </p>

            {certUploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white shrink-0 flex items-center justify-center font-bold text-[10px] mt-0.5">!</span>
                <span className="leading-relaxed">{certUploadError}</span>
              </div>
            )}
            {certUploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2.5">
                <IconCheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{certUploadSuccess}</span>
              </div>
            )}

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
            <h3 className="font-black text-lg text-slate-950 dark:text-white mb-1">Update Master Resume</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
              Select your updated resume. It will be pre-attached whenever you submit applications through the Opportunity Radar.
            </p>

            {resumeUploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white shrink-0 flex items-center justify-center font-bold text-[10px] mt-0.5">!</span>
                <span className="leading-relaxed">{resumeUploadError}</span>
              </div>
            )}
            {resumeUploadSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2.5">
                <IconCheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resumeUploadSuccess}</span>
              </div>
            )}

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

      {/* Executive AI Resume Studio & ATS PDF Builder */}
      <AiResumeStudioModal
        isOpen={showCvModal}
        onClose={() => setShowCvModal(false)}
        user={user}
        profile={profile}
        skills={skills}
        projects={userProjects}
        certificates={certificates}
        experiences={experiences}
      />

      {/* Modal: Add Work Experience / Internship (Redesigned Executive UI) */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  <IconBriefcase size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-950 dark:text-white text-lg sm:text-xl">
                      Add Work Experience or Internship
                    </h3>
                    <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                      Passport
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Highlight your engineering internships, campus leadership, and research accomplishments.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExperience} className="space-y-5 text-xs">
              {/* Row 1: Role Title & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Role Title *</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. SDE Intern, ML Researcher</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineering Intern"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Company or Lab *</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. Swiggy, Bennett AI Lab</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bennett Computational Lab"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: Employment Type Segment Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Employment Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Internship", label: "Internship" },
                    { id: "Full-time", label: "Full-Time" },
                    { id: "Part-time", label: "Part-Time" },
                    { id: "Research Fellow", label: "Research Fellow" },
                    { id: "Leadership", label: "Student Leadership" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setExpType(t.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        expType === t.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Work Mode & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Work Mode
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "In-Office", label: "In-Office" },
                      { id: "Remote", label: "Remote" },
                      { id: "Hybrid", label: "Hybrid" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setExpWorkMode(m.id as any)}
                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          expWorkMode === m.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Location
                  </label>
                  <input
                    type="text"
                    disabled={expWorkMode === "Remote"}
                    placeholder={expWorkMode === "Remote" ? "100% Remote" : "e.g. Greater Noida, Bengaluru"}
                    value={expWorkMode === "Remote" ? "100% Remote" : expLocation}
                    onChange={(e) => setExpLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Row 4: Timeline & Current Position Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={expIsCurrent}
                      onChange={(e) => setExpIsCurrent(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>I am currently working in this role</span>
                  </label>

                  {expIsCurrent && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ongoing Active Position
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Start Date *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={expStartMonth}
                        onChange={(e) => setExpStartMonth(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                      >
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={expStartYear}
                        onChange={(e) => setExpStartYear(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                      >
                        {["2027", "2026", "2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      End Date
                    </label>
                    {expIsCurrent ? (
                      <div className="px-3 py-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-center">
                        Present
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={expEndMonth}
                          onChange={(e) => setExpEndMonth(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                        >
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={expEndYear}
                          onChange={(e) => setExpEndYear(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                        >
                          {["2027", "2026", "2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 5: Description with Quick Bullet Starters */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Description & Key Contributions
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpDescription((prev) =>
                          prev ? `${prev}\n• Designed and deployed ` : "• Designed and deployed "
                        )
                      }
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md"
                    >
                      + Add Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpDescription(
                          "• Architected real-time processing pipelines achieving sub-100ms latency.\n• Collaborated in cross-functional teams to deploy production features with 95%+ test coverage.\n• Optimized compute resource utilization and telemetry streaming."
                        )
                      }
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md"
                    >
                      ✨ Engineering Template
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe your technical responsibilities, algorithms designed, systems built, or key metrics achieved..."
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs leading-relaxed"
                />
              </div>

              {/* Row 6: Interactive Skills Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Skills & Technologies Applied ({expSkillsList.length})
                  </label>
                  <span className="text-[10px] text-slate-400">Click suggestions below or type custom skill</span>
                </div>

                {/* Active Skill Chips */}
                {expSkillsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    {expSkillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => setExpSkillsList((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 cursor-pointer ml-0.5 text-xs font-black"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input for Custom Skill */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill (e.g. Next.js, Docker, PyTorch) and click Add"
                    value={expSkillInput}
                    onChange={(e) => setExpSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const s = expSkillInput.trim().replace(/,/g, "");
                        if (s && !expSkillsList.includes(s)) {
                          setExpSkillsList([...expSkillsList, s]);
                          setExpSkillInput("");
                        }
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const s = expSkillInput.trim();
                      if (s && !expSkillsList.includes(s)) {
                        setExpSkillsList([...expSkillsList, s]);
                        setExpSkillInput("");
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    + Add
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Quick Add:</span>
                  {["Python", "PyTorch", "Computer Vision", "Machine Learning", "React", "Next.js", "Docker", "Node.js", "SQL", "Git", "OpenCV"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={expSkillsList.includes(s)}
                      onClick={() => setExpSkillsList([...expSkillsList, s])}
                      className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 7: Verification Proof URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Verification Proof Link (Optional)</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Grants Verified Badge</span>
                </label>
                <input
                  type="url"
                  placeholder="https://... (Offer letter, GitHub repository, or completion certificate URL)"
                  value={expProofUrl}
                  onChange={(e) => setExpProofUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {savingExp ? "Saving to Passport..." : "Save Experience to Passport →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Work Experience / Internship */}
      {editingExp && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                  <IconEdit size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-950 dark:text-white text-lg sm:text-xl">
                      Edit Work Experience
                    </h3>
                    <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                      Passport
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Update role details, dates, key contributions, and verification links.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingExp(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Institutional Differentiation Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-black">
                ℹ
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">Institution Differentiator:</span>{" "}
                Your enrolled college degree curriculum is managed in your <span className="font-semibold text-indigo-600 dark:text-indigo-400">Academic Profile</span>. Keep this section reserved for verified corporate internships, research appointments, or student employment roles.
              </div>
            </div>

            <form onSubmit={handleUpdateExperience} className="space-y-5 text-xs">
              {/* Row 1: Role Title & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Role Title *</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. SDE Intern, ML Researcher</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineering Intern"
                    value={editExpTitle}
                    onChange={(e) => setEditExpTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Company or Organization *</span>
                    <span className="text-[10px] text-slate-400 font-normal">e.g. SERO, Swiggy, Google</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Social Empowerment & Research Organisation"
                    value={editExpCompany}
                    onChange={(e) => setEditExpCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 2: Employment Type Segment Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Employment Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "Internship", label: "Internship" },
                    { id: "Full-Time", label: "Full-Time" },
                    { id: "Part-Time", label: "Part-Time" },
                    { id: "Research Appointment", label: "Research Appointment" },
                    { id: "Leadership & Responsibility", label: "Leadership & Responsibility" },
                    { id: "Contract", label: "Contract" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditExpType(t.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        editExpType === t.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Work Mode & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Work Mode
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "In-Office", label: "In-Office" },
                      { id: "Remote", label: "Remote" },
                      { id: "Hybrid", label: "Hybrid" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setEditExpWorkMode(m.id as any);
                          setEditExpIsRemote(m.id === "Remote");
                        }}
                        className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                          editExpWorkMode === m.id
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Location
                  </label>
                  <input
                    type="text"
                    disabled={editExpWorkMode === "Remote"}
                    placeholder={editExpWorkMode === "Remote" ? "100% Remote" : "e.g. Greater Noida, Bengaluru"}
                    value={editExpWorkMode === "Remote" ? "100% Remote" : editExpLocation}
                    onChange={(e) => setEditExpLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Row 4: Timeline & Current Position Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editExpIsCurrent}
                      onChange={(e) => setEditExpIsCurrent(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>I am currently working in this role</span>
                  </label>

                  {editExpIsCurrent && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ongoing Active Position
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-200 dark:border-slate-700">
                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      Start Date *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={editExpStartMonth}
                        onChange={(e) => setEditExpStartMonth(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                      >
                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={editExpStartYear}
                        onChange={(e) => setEditExpStartYear(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                      >
                        {["2027", "2026", "2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      End Date
                    </label>
                    {editExpIsCurrent ? (
                      <div className="px-3 py-2 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-center">
                        Present
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={editExpEndMonth}
                          onChange={(e) => setEditExpEndMonth(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                        >
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select
                          value={editExpEndYear}
                          onChange={(e) => setEditExpEndYear(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
                        >
                          {["2027", "2026", "2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 5: Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Key Responsibilities & Impact</span>
                  <span className="text-[10px] text-slate-400 font-normal">Mention key achievements, metrics, or technologies</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your core contributions, system designs, metrics improved, or leadership impact..."
                  value={editExpDescription}
                  onChange={(e) => setEditExpDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs resize-none leading-relaxed"
                />
              </div>

              {/* Row 6: Skills Used */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Skills & Competencies Applied</span>
                  <span className="text-[10px] text-slate-400 font-normal">Press Enter or comma to add</span>
                </label>
                <div className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {editExpSkillsList.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => setEditExpSkillsList((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 ml-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type skill and press enter (e.g. PyTorch, TypeScript, FastAPI)..."
                    value={editExpSkillInput}
                    onChange={(e) => setEditExpSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = editExpSkillInput.replace(",", "").trim();
                        if (val && !editExpSkillsList.includes(val)) {
                          setEditExpSkillsList([...editExpSkillsList, val]);
                          setEditExpSkillInput("");
                        }
                      }
                    }}
                    className="w-full text-xs font-medium bg-transparent border-0 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Row 7: Proof URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Source-Backed Verification Link</span>
                  <span className="text-[10px] text-slate-400 font-normal">GitHub, LoR, certificate, or publication link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or https://drive.google.com/..."
                  value={editExpProofUrl}
                  onChange={(e) => setEditExpProofUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingExp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {updatingExp ? "Updating Experience..." : "Save Changes →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: RECRUITER RADAR INQUIRY INSPECTION */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl p-6 sm:p-7 max-w-lg w-full text-white shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white font-black text-sm w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Recruiter Identity Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md shrink-0 border ${
                  selectedInquiry.logoBg || "bg-indigo-600 text-white"
                }`}
              >
                {selectedInquiry.logo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {selectedInquiry.company}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">{selectedInquiry.division}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.2 rounded-full">
                    ✓ {selectedInquiry.verifiedStatus}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">• {selectedInquiry.time}</span>
                </div>
              </div>
            </div>

            {/* Match Score & Scout Role */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Candidate Match Score</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {selectedInquiry.matchScore}% Match
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${selectedInquiry.matchScore}%` }}
                />
              </div>
              <div className="pt-1 text-xs text-slate-300">
                <strong className="text-white">Role Scouted:</strong> {selectedInquiry.roleScouted}
              </div>
            </div>

            {/* Search Criteria Matched */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Search Queries That Triggered Impression:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedInquiry.searchedTerms?.map((term: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 px-3 py-1 rounded-xl"
                  >
                    ✓ {term}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium pt-1 leading-relaxed">
                {selectedInquiry.notes}
              </p>
            </div>

            {/* Privacy Compliance Assurance */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconShield size={12} className="text-cyan-400" />
                <span>Recruiter Discovery Audited & Logged under DPDP 2025</span>
              </span>
              <span className="font-mono text-cyan-400">#ENT-AUDIT-992</span>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(
                    `Pre-authorization granted for ${selectedInquiry.company}! When their talent team reaches out, you will receive an instant verified notification in your Beacon inbox.`
                  );
                  setSelectedInquiry(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer"
              >
                Pre-Authorize Direct InMail Introduction →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: HIGH-RES CERTIFICATE DOCUMENT INSPECTION */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative space-y-6 overflow-hidden">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white font-black text-sm w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer z-10"
            >
              ✕
            </button>

            {/* Certificate Header Banner */}
            <div className="border-b border-indigo-500/20 pb-4 text-center space-y-1 relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                <IconShield size={11} className="text-indigo-400" />
                <span>BEACON VERIFIED CREDENTIAL</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
                {selectedCert.title}
              </h3>
              <p className="text-xs text-indigo-300 font-medium">Issued by {selectedCert.issuer}</p>
            </div>

            {/* Recipient Information */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Verified Recipient:</span>
                <span className="font-extrabold text-white text-sm">
                  {user?.full_name || "Aabhas"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Academic Institution:</span>
                <span className="font-bold text-slate-200">
                  {user?.college || "Bennett University"}
                </span>
              </div>
              {selectedCert.credential_id && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Credential Identifier:</span>
                  <span className="font-mono font-bold text-indigo-400">
                    {selectedCert.credential_id}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Issue Date:</span>
                <span className="font-medium text-slate-300">{selectedCert.issue_date}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Provenance Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Cryptographically Verified Source
                </span>
              </div>
            </div>

            {/* Cryptographic Ledger Seal */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Ledger Hash:</span>
                <span className="text-emerald-400 font-bold">VERIFIED ON-CHAIN</span>
              </div>
              <div className="text-[10px] text-slate-300 break-all">
                SHA256: 0x{selectedCert.id.replace(/[^a-f0-9]/gi, "").padEnd(40, "a89c").slice(0, 40)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              {selectedCert.credential_url && (
                <a
                  href={selectedCert.credential_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>Verify on Registry</span>
                  <span>↗</span>
                </a>
              )}
              {selectedCert.file_path && (
                <a
                  href={selectedCert.file_path}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <IconDownload size={14} />
                  <span>Download Document</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
