"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconFileText,
  IconCheckCircle,
  IconExternalLink,
  IconSparkles,
  IconShield,
} from "@/components/icons/Icons";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  repository_url?: string;
  live_url?: string;
  rubric_score?: number;
  evidence_notes?: string;
  status: string;
}

export default function ProjectsAppPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState("Systems & Cloud Infrastructure");
  const [newDesc, setNewDesc] = useState("");
  const [newRepo, setNewRepo] = useState("");
  const [newLive, setNewLive] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Evaluation state
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [evalResultModal, setEvalResultModal] = useState<{
    projectTitle: string;
    score: number;
    strengths: string;
    improvements: string;
    credentialHash?: string;
    verificationUrl?: string;
  } | null>(null);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const d = await res.json();
        setProjects(d.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCat,
          description: newDesc,
          repositoryUrl: newRepo,
          liveUrl: newLive,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDesc("");
        setNewRepo("");
        setNewLive("");
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEvaluate = async (proj: ProjectItem) => {
    setEvaluatingId(proj.id);
    try {
      const res = await fetch("/api/projects/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: proj.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResultModal({
          projectTitle: proj.title,
          score: data.rubricScore,
          strengths: data.strengths,
          improvements: data.improvements,
          credentialHash: data.credentialHash,
          verificationUrl: data.verificationUrl,
        });
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this project from your ledger?")) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Proof of Work Ledger
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                {projects.length} Verified {projects.length === 1 ? "Artifact" : "Artifacts"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Projects & Verifiable Artifacts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Transform your software builds and GitHub repositories into verifiable proof. Audited artifacts directly award the coveted <strong className="text-indigo-300">Artifact-backed</strong> badge in your Student Passport.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shrink-0"
          >
            <span>+ Add Project Brief</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
            Loading your project ledger...
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 sm:p-14 text-center space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
              <IconFileText size={28} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Your Project Vault is Raw & Empty</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Connect your GitHub repositories, full-stack systems, or hackathon prototypes. Beacon AI audits the architectural rigor and awards official verified evidence to your profile.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all inline-flex items-center gap-2"
            >
              <span>+ Register Your First Project</span>
            </button>
          </div>
        )}

        {/* Project Cards List */}
        {!loading && projects.length > 0 && (
          <div className="space-y-4">
            {projects.map((proj) => {
              const isVerified = proj.status === "Verified Artifact";
              const isEvaluating = evaluatingId === proj.id;

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-indigo-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-0.5 rounded-full uppercase">
                          {proj.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-950">{proj.title}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                      {proj.rubric_score && (
                        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-right shrink-0">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                            Rubric Score
                          </span>
                          <span className="text-base font-black text-indigo-600">
                            {proj.rubric_score} / 100
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {proj.description}
                  </p>

                  {proj.evidence_notes && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1">
                      <strong className="text-slate-900 block font-bold">
                        Architectural Audit & Evidence Notes:
                      </strong>
                      <p className="leading-relaxed">{proj.evidence_notes}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      {proj.repository_url && (
                        <a
                          href={proj.repository_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-bold"
                        >
                          <span>Inspect Codebase</span>
                          <IconExternalLink size={13} />
                        </a>
                      )}
                      {proj.live_url && (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-700 hover:text-slate-900 flex items-center gap-1.5 font-bold"
                        >
                          <span>Live Prototype Demo</span>
                          <IconExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEvaluate(proj)}
                        disabled={isEvaluating}
                        className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <IconSparkles size={14} className="text-indigo-600" />
                        <span>{isEvaluating ? "Auditing Rigor..." : "Audit with Beacon AI"}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="text-slate-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg transition-colors font-medium text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Project Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Add Project Brief to Vault</h3>
                  <p className="text-xs text-slate-500">Provide verifiable proof for your engineering portfolio.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed In-Memory Cache with Raft Replication"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Technical Domain</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Systems & Cloud Infrastructure">Systems & Cloud Infrastructure</option>
                    <option value="Full-Stack Web Architecture">Full-Stack Web Architecture</option>
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                    <option value="Networking & Security">Networking & Security</option>
                    <option value="Mobile & IoT">Mobile & IoT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Architecture Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe core design decisions, protocols used (e.g. TCP, WebSockets, gRPC), persistence mechanisms, and performance metrics."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GitHub / Code Repository</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={newRepo}
                      onChange={(e) => setNewRepo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Live URL / Demo Link</label>
                    <input
                      type="url"
                      placeholder="https://project.vercel.app"
                      value={newLive}
                      onChange={(e) => setNewLive(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Registering..." : "Save to Evidence Vault"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Evaluation Result Modal */}
        {evalResultModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-lg font-black text-slate-900">Beacon AI Architectural Audit</h3>
                </div>
                <button
                  onClick={() => setEvalResultModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
                  <div>
                    <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider block">
                      Audited Project
                    </span>
                    <strong className="text-base text-slate-900 font-black">
                      {evalResultModal.projectTitle}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold block">Rubric Score</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {evalResultModal.score} <span className="text-xs text-slate-400 font-medium">/ 100</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2 text-xs sm:text-sm">
                  <div>
                    <strong className="text-emerald-700 font-bold block mb-1">
                      Architectural Strengths:
                    </strong>
                    <p className="text-slate-700 leading-relaxed">{evalResultModal.strengths}</p>
                  </div>

                  {evalResultModal.improvements && (
                    <div className="pt-2 border-t border-slate-200">
                      <strong className="text-indigo-800 font-bold block mb-1">
                        Production Opportunities:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{evalResultModal.improvements}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl">
                  <IconCheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Official <strong className="font-bold">Artifact-backed</strong> badge has been issued to your Student Passport.
                  </span>
                </div>

                {evalResultModal.credentialHash && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 text-white border border-indigo-500/30 flex items-center justify-between text-xs gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold block">
                        Cryptographic Proof Hash
                      </span>
                      <span className="font-mono font-bold">{evalResultModal.credentialHash}</span>
                    </div>
                    <Link
                      href={`/verify/${evalResultModal.credentialHash}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                    >
                      <span>Verify Ledger ↗</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setEvalResultModal(null)}
                  className="bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all"
                >
                  Close & View Passport
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
