"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconSearch,
  IconCheckCircle,
  IconExternalLink,
  IconFileText,
  IconAward,
  IconBriefcase,
  IconBuilding,
} from "@/components/icons/Icons";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"radar" | "applied">("radar");
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Comprehensive Apply Modal State (LinkedIn / Internshala standard)
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [appFullName, setAppFullName] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appCollege, setAppCollege] = useState("");
  const [appDegree, setAppDegree] = useState("");
  const [appCgpa, setAppCgpa] = useState("");
  const [appResumeOption, setAppResumeOption] = useState<"master" | "upload">("master");
  const [appProjectLink, setAppProjectLink] = useState("");
  const [appWhyHire, setAppWhyHire] = useState("");
  const [appAvailability, setAppAvailability] = useState("Available immediately for full duration");
  const [appSelectedSkills, setAppSelectedSkills] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Recruiter Job Posting State
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [postJobTitle, setPostJobTitle] = useState("");
  const [postJobOrg, setPostJobOrg] = useState("");
  const [postJobType, setPostJobType] = useState("Internship");
  const [postJobLocation, setPostJobLocation] = useState("Bengaluru, India (Hybrid)");
  const [postJobIsRemote, setPostJobIsRemote] = useState(false);
  const [postJobStipend, setPostJobStipend] = useState("₹50,000 / month + Housing");
  const [postJobDeadline, setPostJobDeadline] = useState("2026-12-31");
  const [postJobSkills, setPostJobSkills] = useState("Python, Distributed Systems, Cloud Architecture");
  const [postJobDesc, setPostJobDesc] = useState("");
  const [postJobUrl, setPostJobUrl] = useState("");
  const [postingJob, setPostingJob] = useState(false);
  const [isRecruiterUser, setIsRecruiterUser] = useState(false);

  async function loadOpportunities() {
    try {
      if (typeof window !== "undefined" && window.location.search.includes("recruiter=true")) {
        setIsRecruiterUser(true);
      }

      const params = new URLSearchParams();
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (remoteOnly) params.append("remote", "1");
      if (search.trim()) params.append("q", search.trim());

      const [oppRes, appRes, profRes] = await Promise.all([
        fetch(`/api/opportunities?${params.toString()}`),
        fetch("/api/applications"),
        fetch("/api/profile"),
      ]);

      if (oppRes.ok) {
        const d = await oppRes.json();
        // Strictly filter out generic Hackathons (they have their own dedicated national hub at /app/hackathons)
        const professionalOnly = (d.opportunities || []).filter((o: any) => o.type !== "Hackathon");
        setOpportunities(professionalOnly);
      }
      if (appRes.ok) {
        const d = await appRes.json();
        setApplications(d.applications || []);
      }
      if (profRes.ok) {
        const p = await profRes.json();
        const u = p.user;
        if (u) {
          if (u.role === "recruiter") setIsRecruiterUser(true);
          setAppFullName(u.full_name || "");
          setAppEmail(u.email || "");
          setAppCollege(u.college || "");
          setAppDegree(u.degree || "");
          setAppCgpa(u.cgpa ? String(u.cgpa) : "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postJobTitle.trim() || !postJobOrg.trim() || !postJobStipend.trim()) {
      alert("Please enter the Role Title, Organization, and Verified Stipend.");
      return;
    }
    setPostingJob(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postJobTitle.trim(),
          organization: postJobOrg.trim(),
          type: postJobType,
          location: postJobLocation.trim(),
          is_remote: postJobIsRemote,
          stipend: postJobStipend.trim(),
          deadline: postJobDeadline,
          skills_required: postJobSkills.split(",").map((s) => s.trim()).filter(Boolean),
          description: postJobDesc.trim(),
          source_url: postJobUrl.trim() || "https://beacon.os/careers",
        }),
      });

      if (res.ok) {
        setShowPostJobModal(false);
        setPostJobTitle("");
        setPostJobOrg("");
        setPostJobDesc("");
        setToastMsg("Verified professional role published successfully! ✓");
        setTimeout(() => setToastMsg(""), 4000);
        await loadOpportunities();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish role.");
      }
    } catch {
      alert("Network error while publishing role.");
    } finally {
      setPostingJob(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [typeFilter, remoteOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOpportunities();
  };

  const handleSyncOpportunities = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/opportunities/sync", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setToastMsg(d.message || "Autonomous opportunity sync completed!");
        setTimeout(() => setToastMsg(""), 4500);
        loadOpportunities();
      } else {
        alert("Failed to sync opportunities.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error while running autonomous crawler.");
    } finally {
      setSyncing(false);
    }
  };

  // Hackathon Redirect Handler (Telemetry + Official Portal)
  const handleHackathonRedirect = async (opp: any) => {
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "hackathon_redirect",
          title: `Explored Hackathon: ${opp.title}`,
          description: `Student opened official portal for ${opp.organization}`,
          metadata: {
            hackathonId: opp.id,
            hackathonTitle: opp.title,
            organization: opp.organization,
            portalUrl: opp.source_url,
          },
        }),
      });
    } catch (e) {}

    setToastMsg(`Redirecting to official ${opp.organization} portal...`);
    setTimeout(() => setToastMsg(""), 3000);
    window.open(opp.source_url, "_blank");
  };

  // Open Multi-Step Application Modal
  const handleOpenApplyModal = (opp: any) => {
    setSelectedOpp(opp);
    setAppSelectedSkills(opp.skills_required || []);
    setAppWhyHire(
      `I am passionate about ${opp.title} at ${opp.organization}. My background includes hands-on projects in ${
        opp.skills_required?.slice(0, 3).join(", ") || "software engineering"
      }, and I am eager to contribute effectively to your engineering deliverables.`
    );
    setApplySuccess(false);
  };

  const handleSkillToggle = (skill: string) => {
    setAppSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    if (!appPhone.trim()) {
      alert("Please provide your contact phone or WhatsApp number.");
      return;
    }
    if (!appWhyHire.trim()) {
      alert("Please provide a brief statement of purpose (Why should you be hired).");
      return;
    }

    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: selectedOpp.id,
          coverNote: appWhyHire.trim(),
          applicantName: appFullName.trim(),
          applicantEmail: appEmail.trim(),
          applicantPhone: appPhone.trim(),
          college: appCollege.trim() || null,
          degree: appDegree.trim() || null,
          cgpa: appCgpa ? Number(appCgpa) : null,
          projectLink: appProjectLink.trim() || null,
          skillsDeclared: appSelectedSkills,
          screeningAnswers: {
            whyHire: appWhyHire.trim(),
            availability: appAvailability,
            projectRepo: appProjectLink.trim(),
            skills: appSelectedSkills,
          },
          availability: appAvailability,
        }),
      });

      if (res.ok) {
        setApplySuccess(true);
        setTimeout(() => {
          setSelectedOpp(null);
          setApplySuccess(false);
          loadOpportunities();
        }, 1800);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit application.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplying(false);
    }
  };

  return (
    <AppLayout>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Dedicated National Hackathons Across India Hub Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-700/80 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider">
              <span>National Competitions</span>
              <span>•</span>
              <span>Smart India Hackathon SIH 2026 & Devfolio</span>
            </div>
            <h3 className="font-black text-base sm:text-lg tracking-tight">
              Looking for National Hackathons & Innovation Challenges?
            </h3>
            <p className="text-xs text-indigo-200 font-medium max-w-xl leading-relaxed">
              We have created a dedicated National Hackathons Radar with live web extraction across Devfolio, Unstop, SIH portal, and direct official registrations.
            </p>
          </div>
          <Link
            href="/app/hackathons"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-black text-xs shadow-md shadow-orange-500/25 shrink-0 transition-all flex items-center justify-center gap-1.5 relative z-10"
          >
            <span>Explore Hackathons Across India</span>
            <span>→</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-0.5 rounded-full uppercase tracking-wider">
                PROFESSIONAL RADAR
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                ✓ 100% Guaranteed Stipend
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">• Zero Unpaid Roles Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Verified Engineering Careers & Fellowships
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1 max-w-2xl leading-relaxed">
              Curated technical internships, graduate SDE roles, and research fellowships. Only verified enterprise employers with competitive stipends (₹15,000/mo floor) are admitted.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0">
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Post Verified Role</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full uppercase">Recruiters</span>
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("radar")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === "radar"
                    ? "bg-white text-indigo-900 dark:bg-slate-900 dark:text-indigo-200 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                All Openings ({opportunities.length})
              </button>
              <button
                onClick={() => setActiveTab("applied")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeTab === "applied"
                    ? "bg-white text-indigo-900 dark:bg-slate-900 dark:text-indigo-200 shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                My Applications ({applications.length})
              </button>
            </div>
          </div>
        </div>

        {activeTab === "radar" ? (
          <>
            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by role, company, or skills (e.g. Razorpay, ISRO, Python, C++, Distributed Systems)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-800 text-xs focus:outline-none"
                >
                  <option value="all">All Professional Roles</option>
                  <option value="Internship">Engineering Internships</option>
                  <option value="Fellowship">Research Fellowships</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span>Remote Only</span>
                </label>

                <button
                  type="button"
                  onClick={handleSyncOpportunities}
                  disabled={syncing}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Phase 4: Autonomous Live Crawler"
                >
                  <span className={syncing ? "animate-spin" : ""}>⚡</span>
                  <span>{syncing ? "Syncing..." : "Sync Live Radar"}</span>
                </button>
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              {opportunities.map((opp) => {
                const isApplied = Boolean(opp.appliedStatus);
                const isHackathon = opp.type === "Hackathon";

                return (
                  <div
                    key={opp.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-indigo-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider ${
                              isHackathon
                                ? "bg-amber-50 text-amber-900 border border-amber-300"
                                : opp.type === "Fellowship"
                                ? "bg-purple-50 text-purple-900 border border-purple-300"
                                : "bg-emerald-50 text-emerald-900 border border-emerald-300"
                            }`}
                          >
                            {isHackathon ? "National Challenge" : opp.type}
                          </span>
                          <span className="text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            {opp.is_remote ? "Remote" : "On-Site / Hybrid"}
                          </span>
                          <span className="text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                            {opp.matchPercent}% Match
                          </span>
                          {opp.fitTier && (
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                              {opp.fitTier}
                            </span>
                          )}
                          {opp.rubricBoost > 0 && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                              +{opp.rubricBoost}% Proof Boost
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-slate-950">
                          {opp.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {opp.organization}
                          </span>
                          <span className="text-indigo-600 font-bold text-xs">✓ Verified Opportunity</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          {isHackathon ? "Prizes / Grants" : "Verified Stipend"}
                        </span>
                        <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                          {opp.stipend_range}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      {opp.description}
                    </p>

                    {opp.explanation && (
                      <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 font-medium flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1" />
                        <span>{opp.explanation}</span>
                      </div>
                    )}

                    {/* Metadata strip: Internshala & LinkedIn style */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Duration</span>
                        <span className="font-extrabold text-slate-900">{opp.duration || "3-6 Months"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Location</span>
                        <span className="font-extrabold text-slate-900">{opp.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Deadline</span>
                        <span className="font-extrabold text-slate-900">{opp.deadline}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Work Mode</span>
                        <span className="font-extrabold text-slate-900">{opp.is_remote ? "Remote" : "In-Office"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px] uppercase">Application Fee</span>
                        <span className="font-extrabold text-emerald-700">₹0 (Free Portal)</span>
                      </div>
                    </div>

                    {/* Skills & Action */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 mr-1">Skills Required:</span>
                        {opp.skills_required?.map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold bg-white text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-lg"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        {isHackathon ? (
                          /* National Hackathons Redirect directly to Host Portal (SIH, ETHIndia, Devfolio) */
                          <button
                            onClick={() => handleHackathonRedirect(opp)}
                            className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-2"
                          >
                            <span>Register on Official Portal</span>
                            <IconExternalLink size={14} />
                          </button>
                        ) : isApplied ? (
                          <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-black">
                            ✓ Applied (In Review)
                          </span>
                        ) : (
                          /* Formal Internship Application Modal with Screening */
                          <button
                            onClick={() => handleOpenApplyModal(opp)}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Apply with Passport</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Applications List (Full Transparency) */
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                  <IconBriefcase size={22} />
                </div>
                <h3 className="font-bold text-base text-slate-900">No applications submitted yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Select any verified opening from the Opportunity Radar to complete the formal application process.
                </p>
                <button
                  onClick={() => setActiveTab("radar")}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Browse Openings
                </button>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
                          {app.status || "Applied (Under Review)"}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">App ID: {app.id}</span>
                      </div>
                      <h3 className="font-black text-lg text-slate-950">{app.opp_title || app.title}</h3>
                      <p className="text-xs font-bold text-slate-700 mt-0.5 flex items-center gap-1.5">
                        <IconBuilding size={13} className="text-slate-400" />
                        <span>{app.organization}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs font-bold text-slate-500 block">Submitted: {app.applied_at?.slice(0, 10)}</span>
                      <span className="text-xs font-bold text-emerald-700 mt-1 block">Credential Package Delivered ✓</span>
                    </div>
                  </div>

                  {app.cover_note && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                      <span className="font-bold text-slate-900 block mb-1">Statement of Purpose:</span>
                      <p className="italic">&ldquo;{app.cover_note}&rdquo;</p>
                    </div>
                  )}

                  {app.applicant_phone && (
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 pt-1">
                      <span><strong>Contact Phone:</strong> {app.applicant_phone}</span>
                      {app.project_link && (
                        <span><strong>Project Demonstration:</strong> <a href={app.project_link} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View Link ↗</a></span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* COMPREHENSIVE MULTI-STEP APPLICATION MODAL (Internshala / LinkedIn Standard) */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative border border-slate-200 max-h-[92vh] overflow-y-auto animate-fade-in">
            <button
              onClick={() => setSelectedOpp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-black text-sm w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <div className="border-b border-slate-200 pb-3 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                Official Candidate Application
              </span>
              <h3 className="font-black text-xl text-slate-950 mt-0.5">
                Apply to {selectedOpp.organization}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Role: <strong className="text-slate-900">{selectedOpp.title}</strong> • Stipend: <strong className="text-emerald-700">{selectedOpp.stipend_range}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs sm:text-sm">
              {/* Step 1: Contact Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  1. Candidate Profile & Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={appFullName}
                      onChange={(e) => setAppFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={appEmail}
                      onChange={(e) => setAppEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={appPhone}
                      onChange={(e) => setAppPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">College / University</label>
                    <input
                      type="text"
                      placeholder="e.g. NIT Kurukshetra, IIT, DTU"
                      value={appCollege}
                      onChange={(e) => setAppCollege(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Resume & Project Proof */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  2. Resume & Project Artifact
                </span>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="resumeOption"
                      checked={appResumeOption === "master"}
                      onChange={() => setAppResumeOption("master")}
                      className="accent-indigo-600"
                    />
                    <span>Attach Master Resume from Passport</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Relevant Project / GitHub Demonstration Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/relevant-project"
                    value={appProjectLink}
                    onChange={(e) => setAppProjectLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Recruiters at {selectedOpp.organization} prioritize applicants with verified code repositories.
                  </p>
                </div>
              </div>

              {/* Step 3: Screening Questions (Internshala Standard) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                  3. Screening Questions & Statement
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Why should you be hired for this role at {selectedOpp.organization}? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={appWhyHire}
                    onChange={(e) => setAppWhyHire(e.target.value)}
                    placeholder="Describe your technical background, projects built, and how your skills match this role..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>Keep it specific to the required tech stack.</span>
                    <span>{appWhyHire.length} chars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Availability *
                  </label>
                  <select
                    value={appAvailability}
                    onChange={(e) => setAppAvailability(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold bg-white"
                  >
                    <option value="Available immediately for full duration">
                      Yes, available immediately for full duration ({selectedOpp.duration || "3-6 months"})
                    </option>
                    <option value="Available after upcoming semester exams">
                      Available after upcoming semester exams
                    </option>
                    <option value="Seeking part-time / flexible hours">
                      Seeking part-time / flexible hours
                    </option>
                  </select>
                </div>

                {selectedOpp.skills_required && selectedOpp.skills_required.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Confirm skills you have practical experience with:
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedOpp.skills_required.map((skill: string) => (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                            appSelectedSkills.includes(skill)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {appSelectedSkills.includes(skill) ? "✓ " : "+ "}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {applySuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl font-bold flex items-center gap-2 text-xs">
                  <IconCheckCircle size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <span className="block font-black">Application Successfully Delivered!</span>
                    <span className="text-[11px] font-normal">Tracking details saved in My Applications ledger.</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying || applySuccess}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {applying ? "Packaging & Delivering..." : "Submit Candidate Application →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST VERIFIED ROLE (ENTERPRISE RECRUITER CONSOLE) */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setShowPostJobModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white font-black text-sm w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>RECRUITER VERIFIED POSTING</span>
              </div>
              <h3 className="text-xl font-black text-white">Post Verified Engineering Role</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Target verified engineering talent with cryptographic student passport ledgers.
              </p>
            </div>

            {/* Quality Floor Policy Banner */}
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-medium space-y-1">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Minimum Stipend Floor Policy (₹15,000/mo)</span>
              </span>
              <p className="text-[11px] text-cyan-200/90 leading-relaxed">
                Beacon strictly bans unpaid internships, unpaid commission marketing, and generic telecalling. Only technical roles with audited compensation are approved.
              </p>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend SDE Intern, ML Systems Engineer"
                    value={postJobTitle}
                    onChange={(e) => setPostJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Razorpay, Microsoft, ISRO SAC, CRED"
                    value={postJobOrg}
                    onChange={(e) => setPostJobOrg(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Opportunity Type</label>
                  <select
                    value={postJobType}
                    onChange={(e) => setPostJobType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="Internship">Engineering Internship</option>
                    <option value="Full-Time">Full-Time SDE</option>
                    <option value="Fellowship">Research Fellowship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Hyderabad, Delhi NCR"
                    value={postJobLocation}
                    onChange={(e) => setPostJobLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Work Mode</label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 font-medium text-xs">
                      <input
                        type="checkbox"
                        checked={postJobIsRemote}
                        onChange={(e) => setPostJobIsRemote(e.target.checked)}
                        className="w-4 h-4 accent-cyan-500"
                      />
                      <span>Remote Eligible</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Verified Monthly Stipend / Annual CTC *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹50,000 / month + Housing or ₹18–24 LPA"
                    value={postJobStipend}
                    onChange={(e) => setPostJobStipend(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={postJobDeadline}
                    onChange={(e) => setPostJobDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Required Technical Competencies (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, Distributed Systems, PyTorch, SQL, Docker"
                  value={postJobSkills}
                  onChange={(e) => setPostJobSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Role Description & Engineering Deliverables *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe key engineering projects, team structure, and mentorship provided to the candidate..."
                  value={postJobDesc}
                  onChange={(e) => setPostJobDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Application / Careers Portal URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/jobs/..."
                  value={postJobUrl}
                  onChange={(e) => setPostJobUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={postingJob}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-cyan-600/25 cursor-pointer disabled:opacity-50"
                >
                  {postingJob ? "Validating & Publishing..." : "Publish Verified Role on Radar →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
