"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconTarget,
  IconCheckCircle,
  IconSparkles,
  IconChevronRight,
} from "@/components/icons/Icons";

const PRESET_PAIRS = [
  {
    label: "Systems vs Full-Stack",
    a: "Core Systems & Cloud Infrastructure (Rust / Distributed Engines)",
    b: "Full-Stack Web Engineering (Next.js / Node.js / PostgreSQL)",
  },
  {
    label: "Razorpay vs Google STEP",
    a: "Razorpay Core Payments Platform Internship",
    b: "Google India STEP Software Engineering Internship",
  },
  {
    label: "National Hackathon vs GSoC",
    a: "Smart India Hackathon (SIH 2026) National Finale",
    b: "Google Summer of Code (GSoC) Open Source Fellowship",
  },
  {
    label: "AI Systems vs FinTech",
    a: "Generative AI & LLM Systems Engineering",
    b: "FinTech Transaction Systems & Algorithmic Engines",
  },
];

export default function DecisionStudioPage() {
  const [optionA, setOptionA] = useState("Core Systems & Cloud Infrastructure (Rust / Distributed Engines)");
  const [optionB, setOptionB] = useState("Full-Stack Web Engineering (Next.js / Node.js / PostgreSQL)");
  const [studentNotes, setStudentNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [adopting, setAdopting] = useState(false);
  const [adoptedSuccess, setAdoptedSuccess] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<{
    pathA: {
      title: string;
      prerequisiteDepth: string;
      constraintCompatibility: string;
      reversibility: string;
      reversibilityNotes: string;
      differentiation: string;
    };
    pathB: {
      title: string;
      prerequisiteDepth: string;
      constraintCompatibility: string;
      reversibility: string;
      reversibilityNotes: string;
      differentiation: string;
    };
    recommendation: string;
    suggestedTasks: Array<{ title: string; minutes: number }>;
  } | null>(null);

  const handleRunAnalysis = async () => {
    if (!optionA.trim() || !optionB.trim()) return;

    setAnalyzing(true);
    setAdoptedSuccess(false);

    try {
      const res = await fetch("/api/decision-studio/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathwayA: optionA,
          pathwayB: optionB,
          studentNotes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAdoptRoadmap = async () => {
    if (!analysisResult) return;

    setAdopting(true);
    try {
      const res = await fetch("/api/decision-studio/adopt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGoalTitle: `Master ${analysisResult.pathA.title}`,
          tasks: analysisResult.suggestedTasks,
        }),
      });

      if (res.ok) {
        setAdoptedSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdopting(false);
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
                Decision Studio & Trade-Offs
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Counterfactual Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Compare Career Directions
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Compare two study pathways side-by-side with objective reversibility scoring, time budget matching, and market demand calibration grounded in your verified Student Passport.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0">
            <span className="block text-2xl font-black text-white">Live RAG</span>
            <span className="text-xs text-indigo-200">Grounded Career Intel</span>
          </div>
        </div>

        {/* Pathway Inputs Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Configure Trade-Off Analysis</h2>
              <p className="text-xs text-slate-500">Pick two career directions to evaluate counterfactual costs and returns.</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_PAIRS.map((pair, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setOptionA(pair.a);
                    setOptionB(pair.b);
                    setAnalysisResult(null);
                    setAdoptedSuccess(false);
                  }}
                  className="text-[11px] font-bold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Pathway A (Primary Contender)
              </label>
              <input
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="e.g. Core Systems Engineering (Rust / Distributed Primitives)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pathway B (Alternative Contender)
              </label>
              <input
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="e.g. Full-Stack Web App Development (React / Node.js)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Personal Constraints & Context (Optional)
            </label>
            <input
              type="text"
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="e.g. 15 hours/week study budget; university mid-term exams approaching next month"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !optionA.trim() || !optionB.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <IconSparkles size={16} />
              <span>{analyzing ? "Running Trade-Off Calibration..." : "Calibrate Trade-offs with Beacon AI"}</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        {analysisResult && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A Card */}
              <div className="bg-white rounded-3xl border-2 border-indigo-500/40 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase">
                    Pathway A
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    {analysisResult.pathA.differentiation}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900">{analysisResult.pathA.title}</h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Prerequisite Depth:</strong>
                    <p className="text-slate-600 leading-relaxed">{analysisResult.pathA.prerequisiteDepth}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Constraint Compatibility:</strong>
                    <p className="text-slate-600 leading-relaxed">{analysisResult.pathA.constraintCompatibility}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Reversibility:</strong>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-200">
                      {analysisResult.pathA.reversibility}
                    </span>
                    <p className="text-slate-600 leading-relaxed">{analysisResult.pathA.reversibilityNotes}</p>
                  </div>
                </div>
              </div>

              {/* Option B Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full uppercase">
                    Pathway B
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {analysisResult.pathB.differentiation}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900">{analysisResult.pathB.title}</h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Prerequisite Depth:</strong>
                    <p className="text-slate-600 leading-relaxed">{analysisResult.pathB.prerequisiteDepth}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Constraint Compatibility:</strong>
                    <p className="text-slate-600 leading-relaxed">{analysisResult.pathB.constraintCompatibility}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <strong className="text-slate-900 block font-bold mb-1">Reversibility:</strong>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1 border border-indigo-200">
                      {analysisResult.pathB.reversibility}
                    </span>
                    <p className="text-slate-600 leading-relaxed">{analysisResult.pathB.reversibilityNotes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation & Roadmap Adoption */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-300">
                <IconSparkles size={18} />
                <span className="text-xs font-black uppercase tracking-wider">
                  Beacon AI Executive Recommendation
                </span>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
                {analysisResult.recommendation}
              </p>

              {/* Actionable Milestones */}
              {analysisResult.suggestedTasks && analysisResult.suggestedTasks.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    Recommended Milestone Checklist:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysisResult.suggestedTasks.map((task, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center justify-between gap-2"
                      >
                        <span className="font-medium">{task.title}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md shrink-0 font-bold">
                          {task.minutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
                {adoptedSuccess ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-4 py-2.5 rounded-xl">
                    <IconCheckCircle size={16} />
                    <span>Adopted! Target milestone and tasks written to your Roadmap.</span>
                    <Link href="/app/roadmap" className="underline ml-2 hover:text-white">
                      View Roadmap →
                    </Link>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">
                    Ready to turn this decision into an actionable semester schedule?
                  </span>
                )}

                <button
                  onClick={handleAdoptRoadmap}
                  disabled={adopting || adoptedSuccess}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 self-end sm:self-auto"
                >
                  <span>{adopting ? "Adopting..." : adoptedSuccess ? "Roadmap Active" : "Adopt Recommendation into Roadmap"}</span>
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
