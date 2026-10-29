"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconTarget,
  IconShield,
  IconSparkles,
  IconAward,
  IconFileText,
  IconExternalLink,
  IconCheckCircle,
  IconSearch,
} from "@/components/icons/Icons";

export default function RecruiterRadarPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minCgpa, setMinCgpa] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [minRubric, setMinRubric] = useState("");

  // Invite Modal
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [companyName, setCompanyName] = useState("Razorpay Core Infrastructure");
  const [roleTitle, setRoleTitle] = useState("Software Engineering Intern (Distributed Systems)");
  const [stipend, setStipend] = useState("₹65,000 / month + Full-Time PPO");
  const [inviteMessage, setInviteMessage] = useState(
    "We reviewed your audited proof-of-work project artifacts and cryptographic credentials on Beacon. Your telemetry engine aligns with our high-throughput payment systems."
  );
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  async function loadCandidates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (minCgpa) params.append("minCgpa", minCgpa);
      if (skillFilter) params.append("skill", skillFilter);
      if (minRubric) params.append("minRubric", minRubric);

      const res = await fetch(`/api/radar/candidates?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setCandidates(d.candidates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, [minCgpa, skillFilter, minRubric]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setSendingInvite(true);

    try {
      const res = await fetch("/api/radar/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedCandidate.id,
          recruiterCompany: companyName,
          roleTitle,
          stipend,
          message: inviteMessage,
        }),
      });

      if (res.ok) {
        setInviteSuccess(true);
        setTimeout(() => {
          setSelectedCandidate(null);
          setInviteSuccess(false);
        }, 1800);
      } else {
        alert("Failed to deliver interview invitation.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Hero Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                🎯 Recruiter Talent Radar • Audited Proof-of-Work
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                <span>✓</span> Zero Placement Fees for Students
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Proof-of-Work Recruiter Talent Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bypass unverified resumes and ATS keyword spam. Discover pre-vetted engineers with demonstrable source code repositories, rubric-scored projects, and SHA-256 cryptographic credential hashes.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0 min-w-44">
            <span className="block text-2xl font-black text-indigo-400 font-mono">
              {candidates.length} Audited
            </span>
            <span className="text-xs text-slate-300 block">Candidates Matched</span>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Direct Recruiter Outreach</span>
          </div>
        </div>

        {/* Multi-Factor Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="font-bold text-slate-500 dark:text-slate-400 mr-2 block sm:inline">Min CGPA:</span>
              <select
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="">Any CGPA</option>
                <option value="7.5">≥ 7.5 CGPA</option>
                <option value="8.0">≥ 8.0 CGPA</option>
                <option value="8.5">≥ 8.5 CGPA (Distinction)</option>
                <option value="9.0">≥ 9.0 CGPA (Top Tier)</option>
              </select>
            </div>

            <div>
              <span className="font-bold text-slate-500 dark:text-slate-400 mr-2 block sm:inline">Verified Skill:</span>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="">All Verified Skills</option>
                <option value="Python">Python</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Robotics">Robotics</option>
                <option value="Java">Java</option>
                <option value="C">C / Systems</option>
                <option value="Git">Git / GitHub</option>
              </select>
            </div>

            <div>
              <span className="font-bold text-slate-500 dark:text-slate-400 mr-2 block sm:inline">Min Project Rubric:</span>
              <select
                value={minRubric}
                onChange={(e) => setMinRubric(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
              >
                <option value="">All Rubric Scores</option>
                <option value="80">≥ 80 / 100 (Production Grade)</option>
                <option value="90">≥ 90 / 100 (Exceptional Proof)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setMinCgpa("");
              setSkillFilter("");
              setMinRubric("");
            }}
            className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>

        {/* Candidates Grid */}
        <div className="space-y-4">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-xs border border-indigo-400/30">
                    {cand.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "ST"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                        {cand.full_name}
                      </h2>
                      <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full uppercase">
                        ✓ Verified Student
                      </span>
                      {cand.cgpa && (
                        <span className="text-[11px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full font-mono">
                          {cand.cgpa} CGPA
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {cand.degree || "Computer Science"} • {cand.college || "University"} (Class of {cand.graduation_year || 2027})
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      {cand.headline || cand.bio || "Demonstrated capabilities backed by code artifacts and diagnostic audits."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCandidate(cand)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 self-start shrink-0"
                >
                  <IconSparkles size={14} />
                  <span>Fast-Track Interview</span>
                </button>
              </div>

              {/* Cryptographic Credentials Strip */}
              {cand.credentials && cand.credentials.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                    <IconShield size={12} className="text-indigo-600" />
                    <span>Cryptographic Proof-of-Work Badges ({cand.credentials.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cand.credentials.map((cr: any) => (
                      <Link
                        key={cr.id}
                        href={`/verify/${cr.credential_hash}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-colors shadow-2xs group"
                      >
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{cr.credential_hash}</span>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{cr.artifact_title}</span>
                        <span className="text-emerald-600 font-mono">({cr.rubric_score} pts)</span>
                        <IconExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Audited Projects Strip */}
              {cand.projects && cand.projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {cand.projects.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-950 dark:text-white block">{p.title}</span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{p.category}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Rubric Score</span>
                        <span className="text-sm font-black text-emerald-600 font-mono">
                          {p.rubric_score || 85} / 100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Tags */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">Verified Skills:</span>
                {cand.skills?.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    {s.skill_name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {candidates.length === 0 && !loading && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
              <span className="text-2xl">🔍</span>
              <p className="font-bold text-slate-700 dark:text-slate-300">No candidates match the specified proof-of-work filters.</p>
              <p className="text-xs">Try lowering minimum CGPA or selecting all verified skills.</p>
            </div>
          )}
        </div>

        {/* FAST-TRACK INTERVIEW INVITATION MODAL */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-fade-in">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-black text-sm w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0">
                  {selectedCandidate.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "ST"}
                </div>
                <div>
                  <h3 className="font-black text-slate-950 dark:text-white text-base">Direct Fast-Track Reach-Out</h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    To: {selectedCandidate.full_name} ({selectedCandidate.college})
                  </p>
                </div>
              </div>

              {inviteSuccess ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 dark:text-white text-base">Invitation Dispatched!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Candidate has been notified in their Beacon activity stream with your verified offer details.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendInvite} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Hiring Organization / Division
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Target Role / Program
                    </label>
                    <input
                      type="text"
                      required
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Stipend / Compensation Package
                    </label>
                    <input
                      type="text"
                      required
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Direct Message & Next Steps
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {sendingInvite ? "Delivering Invitation..." : "Send Direct Fast-Track Interview Invite"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
