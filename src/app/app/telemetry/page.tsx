"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconShield,
  IconSearch,
  IconCheckCircle,
  IconSparkles,
  IconFileText,
  IconBriefcase,
  IconExternalLink,
  IconUsers,
} from "@/components/icons/Icons";

export default function TelemetryIntelligencePage() {
  const [data, setData] = useState<{
    events: any[];
    applications: any[];
    aiQueries: any[];
    stats: { students: number; applications: number; events: number; projects: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stream" | "applications" | "ai">("stream");
  const [filterType, setFilterType] = useState("all");

  async function loadTelemetry() {
    try {
      const res = await fetch("/api/telemetry/stream");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  const events = data?.events || [];
  const applications = data?.applications || [];
  const aiQueries = data?.aiQueries || [];
  const stats = data?.stats || { students: 0, applications: 0, events: 0, projects: 0 };

  const filteredEvents = events.filter((e) => {
    if (filterType === "all") return true;
    return e.event_type?.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Recruiter & Student Intelligence
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Live Data Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Telemetry & Candidate Application Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Real-time audit log of student registrations, verified applications, hackathon redirects, proof-of-work project submissions, and AI queries.
            </p>
          </div>

          <button
            onClick={loadTelemetry}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer shrink-0 self-start md:self-auto"
          >
            ↻ Refresh Stream
          </button>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Registered Students
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-950">{stats.students}</span>
            <span className="text-[11px] text-slate-400 block font-medium">Verified Accounts</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Applications Logged
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600">{stats.applications}</span>
            <span className="text-[11px] text-indigo-600/70 block font-medium">Multi-Step Screened</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Proof of Work Artifacts
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.projects}</span>
            <span className="text-[11px] text-emerald-600/70 block font-medium">Audited Projects</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Telemetry Events
            </span>
            <span className="text-2xl sm:text-3xl font-black text-violet-600">{stats.events}</span>
            <span className="text-[11px] text-violet-600/70 block font-medium">Recorded Actions</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-xs">
          <button
            onClick={() => setActiveTab("stream")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "stream"
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ⚡ Live Telemetry Stream ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "applications"
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Candidate Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-slate-950 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            AI Queries & Prompts ({aiQueries.length})
          </button>
        </div>

        {/* Tab 1: Live Telemetry Stream */}
        {activeTab === "stream" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Real-Time Event Stream
                </h2>
                <p className="text-xs text-slate-500">
                  Every user interaction, application submission, hackathon click, and skill audit.
                </p>
              </div>

              {/* Event Filter */}
              <div className="flex gap-1.5 flex-wrap">
                {["all", "application", "hackathon", "project", "diagnostic", "task"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                      filterType === f
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading telemetry feed...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No matching telemetry events.</div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-black shrink-0 mt-0.5">
                        ⚡
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-slate-950 font-black text-sm">{evt.title}</strong>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {evt.event_type}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-normal">{evt.description}</p>
                        {evt.user_name && (
                          <span className="text-[11px] text-slate-400 block font-medium">
                            Student: {evt.user_name} ({evt.user_email || "authenticated"}) {evt.user_college ? `• ${evt.user_college}` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0 font-medium self-end sm:self-auto">
                      {evt.created_at}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Candidate Applications */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Submitted Application Dossiers ({applications.length})
              </h2>
              <p className="text-xs text-slate-500">
                Candidate screening responses, verified academic scores, Statements of Purpose, and project links.
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No job applications submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                            {app.company}
                          </span>
                          <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                            {app.status}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-950">{app.role_title}</h3>
                        <p className="text-xs text-slate-500">
                          Applied: {app.applied_at} • Stipend: {app.stipend}
                        </p>
                      </div>

                      <div className="text-right self-start sm:self-auto">
                        <strong className="text-sm font-black text-slate-900 block">
                          {app.applicant_name || "Applicant"}
                        </strong>
                        <span className="text-xs text-slate-600 block">{app.applicant_email}</span>
                        {app.applicant_phone && (
                          <span className="text-xs text-slate-500 block">Phone: {app.applicant_phone}</span>
                        )}
                      </div>
                    </div>

                    {/* Academic info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">College</span>
                        <strong className="text-slate-950 truncate block">{app.college || "N/A"}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Degree</span>
                        <strong className="text-slate-950 truncate block">{app.degree || "N/A"}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">CGPA</span>
                        <strong className="text-slate-950 block">{app.cgpa ? `${app.cgpa} / 10` : "N/A"}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Availability</span>
                        <strong className="text-slate-950 block">{app.availability || "Immediate"}</strong>
                      </div>
                    </div>

                    {/* Statement / Cover note */}
                    {app.cover_note && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <strong className="text-slate-900 block font-bold text-xs">
                          Candidate Statement of Purpose:
                        </strong>
                        <p className="text-slate-700 leading-relaxed text-xs">{app.cover_note}</p>
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold">
                      {app.project_link && (
                        <a
                          href={app.project_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <span>Candidate Project Proof</span>
                          <IconExternalLink size={12} />
                        </a>
                      )}
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-700 hover:text-slate-950 flex items-center gap-1"
                        >
                          <span>Attached Resume</span>
                          <IconExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: AI Learning Ledger */}
        {activeTab === "ai" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Beacon AI Query & Prompt Ledger ({aiQueries.length})
              </h2>
              <p className="text-xs text-slate-500">
                Audited questions submitted to Beacon AI by students. Powers continuous RAG grounding and learning.
              </p>
            </div>

            {aiQueries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No AI queries recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {aiQueries.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-400 font-medium text-[11px]">
                      <span>Student: {q.user_name || "Student"} ({q.user_email || "User"})</span>
                      <span>{q.created_at}</span>
                    </div>
                    <p className="text-slate-900 font-bold text-sm leading-relaxed">
                      &ldquo;{q.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
