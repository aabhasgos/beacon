"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconShield,
  IconUsers,
  IconBriefcase,
  IconGraph,
  IconClock,
  IconCheckCircle,
  IconExternalLink,
  IconTarget,
  IconSparkles,
} from "@/components/icons/Icons";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mentors" | "recruiters" | "students" | "telemetry">("mentors");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyMentor = async (applicationId: string, status: "verified" | "rejected") => {
    setVerifyingId(applicationId);
    try {
      const res = await fetch("/api/admin/verify-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (res.ok) {
        setFeedbackMsg(`Mentor application ${status === "verified" ? "approved & badge issued" : "rejected"}.`);
        await loadAdminData();
        setTimeout(() => setFeedbackMsg(""), 3500);
      }
    } catch (err) {
      alert("Error updating mentor credential.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleExportAuditJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beacon-audit-telemetry-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const metrics = data?.metrics || {};

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        {/* Top Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                Institutional Control Center
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DPDP 2025 Audit Compliant
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Institutional Master Administration Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl">
              Platform governance authority: monitor verified mentor applications, scout audited student passports, verify enterprise tech opportunities, and audit telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleExportAuditJson}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-700 shadow-xs"
            >
              Export Audit JSON
            </button>
            <button
              type="button"
              onClick={loadAdminData}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all cursor-pointer"
            >
              {loading ? "Refreshing..." : "Refresh Telemetry"}
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{feedbackMsg}</span>
            <button type="button" onClick={() => setFeedbackMsg("")} className="cursor-pointer">✕</button>
          </div>
        )}

        {/* 6 High-Impact KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Students</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white">{metrics.studentCount ?? 0}</div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Active Profiles</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Mentors</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white">{metrics.mentorCount ?? 0}</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">≥10 Yr Council</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Recruiters</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white">{metrics.recruiterCount ?? 0}</div>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">Enterprise Partners</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Opportunities</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white">{metrics.opportunityCount ?? 0}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified Jobs</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Audited Projects</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white">{metrics.projectCount ?? 0}</div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Rubric Scored</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Audit Events</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white">{metrics.eventCount ?? 0}</div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Immutable Logs</span>
          </div>
        </div>

        {/* Master Governance Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {[
            { id: "mentors", label: "Mentor Council Applications", count: data?.mentorApps?.length || 0 },
            { id: "recruiters", label: "Enterprise Recruiter Postings", count: data?.opportunities?.length || 0 },
            { id: "students", label: "Student Passport Registry", count: data?.students?.length || 0 },
            { id: "telemetry", label: "Security & Audit Telemetry", count: data?.recentEvents?.length || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-900 text-indigo-950 dark:text-white shadow-xs border border-slate-200 dark:border-slate-700"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab 1: Senior Mentor Council Applications */}
        {activeTab === "mentors" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                  Senior Mentor Council Credential Reviews
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Strict ≥10 years industry experience floor. Senior practitioners offering pro-bono guidance.
                </p>
              </div>
              <Link
                href="/mentor-login"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Open Mentor Console</span>
                <span>↗</span>
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.mentorApps || []).length > 0 ? (
                data.mentorApps.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-black text-slate-950 dark:text-white">
                          {app.name}
                        </strong>
                        <span className="text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
                          {app.experience_years} Years Experience
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.verification_status === "verified"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}>
                          {app.verification_status === "verified" ? "Council Verified" : "Pending Audit"}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                        {app.title} • {app.company}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {app.email} • Career Start: {app.career_start_year || 2014}
                      </p>
                      {app.linkedin_url && (
                        <a
                          href={app.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-bold pt-0.5"
                        >
                          <span>Verified LinkedIn Profile</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {app.verification_status !== "verified" ? (
                        <button
                          type="button"
                          disabled={verifyingId === app.id}
                          onClick={() => handleVerifyMentor(app.id, "verified")}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          Approve & Grant Badge
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <IconCheckCircle size={14} />
                          Active Council Fellow
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No mentor applications registered yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Enterprise Recruiter Activity & Opportunities */}
        {activeTab === "recruiters" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                  Enterprise Postings & Talent Console
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Only audited professional tech roles from verified enterprises are displayed.
                </p>
              </div>
              <Link
                href="/recruiter-login"
                className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Open Recruiter Console</span>
                <span>↗</span>
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.opportunities || []).length > 0 ? (
                data.opportunities.map((opp: any) => (
                  <div
                    key={opp.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-black text-slate-950 dark:text-white">
                          {opp.title}
                        </strong>
                        <span className="text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 px-2 py-0.5 rounded-full">
                          {opp.company}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          {opp.stipend || "Competitive Stipend"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {opp.role_type || "Internship"} • {opp.location || "Hybrid"} • Status: {opp.status || "Active"}
                      </p>
                    </div>

                    <Link
                      href="/app/opportunities"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-bold text-xs shrink-0 inline-flex items-center gap-1"
                    >
                      <span>View in Radar</span>
                      <span>↗</span>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No active opportunities recorded in database.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Student Passport Registry */}
        {activeTab === "students" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                  Student Passport Registry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Student profiles with cryptographic credentials, academic details, and verified skills.
                </p>
              </div>
              <Link
                href="/app/passport"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Inspect Passport View</span>
                <span>↗</span>
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.students || []).map((st: any) => (
                <div
                  key={st.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-black text-slate-950 dark:text-white">
                        {st.full_name || "Student"}
                      </strong>
                      <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        {st.college || "University Candidate"}
                      </span>
                      {st.cgpa && (
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          CGPA: {st.cgpa}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {st.degree || "Computer Science"} • Grad Year: {st.graduation_year || 2027} • {st.email}
                    </p>
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    ID: {st.id.slice(0, 16)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Security & Audit Telemetry */}
        {activeTab === "telemetry" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                  Security & Activity Audit Trail
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Immutable chronological audit logs for candidate actions, certificate verifications, and recruiter inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportAuditJson}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Download Audit CSV/JSON</span>
                <span>↓</span>
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              {(data?.recentEvents || []).map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <strong className="text-slate-900 dark:text-white font-sans text-xs">
                        {ev.title}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-mono">[{ev.event_type}]</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans pl-3.5">
                      {ev.description}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {ev.created_at || "Recent"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
