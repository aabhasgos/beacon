"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconTarget,
  IconCheckCircle,
  IconSparkles,
  IconChevronRight,
  IconShield,
  IconGraph,
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
        {/* Unified Page Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full uppercase tracking-wider">
                DECISION STUDIO & TRADE-OFFS
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Counterfactual Engine</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Compare Career Directions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Compare two study pathways side-by-side with objective reversibility scoring, time budget matching, and market demand calibration grounded in your verified Student Passport.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center shrink-0 self-start md:self-auto min-w-[150px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Engine Status
            </span>
            <span className="text-xl font-black text-slate-950 dark:text-white block">Live RAG</span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Grounded Career Intel</span>
          </div>
        </div>

        {/* Pathway Inputs Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">Configure Trade-Off Analysis</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Pick two career directions to evaluate counterfactual costs and returns.</p>
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
                  className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                Pathway A (Primary Contender)
              </label>
              <input
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                placeholder="e.g. Core Systems Engineering (Rust / Distributed Primitives)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Pathway B (Alternative Contender)
              </label>
              <input
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                placeholder="e.g. Full-Stack Web App Development (React / Node.js)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
              Personal Constraints & Context (Optional)
            </label>
            <input
              type="text"
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="e.g. 15 hours/week study budget; university mid-term exams approaching next month"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 transition-all"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || !optionA.trim() || !optionB.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <IconSparkles size={16} />
              <span>{analyzing ? "Running Trade-Off Calibration..." : "Calibrate Trade-offs with Beacon AI →"}</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        {analysisResult && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-500/60 p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full uppercase">
                    Pathway A
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    {analysisResult.pathA.differentiation}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-950 dark:text-white">{analysisResult.pathA.title}</h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-950 dark:text-white block font-black mb-1">Prerequisite Depth:</strong>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.pathA.prerequisiteDepth}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-950 dark:text-white block font-black mb-1">Constraint Compatibility:</strong>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.pathA.constraintCompatibility}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-950 dark:text-white block font-black mb-1">Reversibility:</strong>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md inline-block mb-1 border border-emerald-200 dark:border-emerald-800">
                      {analysisResult.pathA.reversibility}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.pathA.reversibilityNotes}</p>
                  </div>
                </div>
              </div>

              {/* Option B Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase border border-slate-200 dark:border-slate-700">
                    Pathway B
                  </span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                    {analysisResult.pathB.differentiation}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-950 dark:text-white">{analysisResult.pathB.title}</h2>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-950 dark:text-white block font-black mb-1">Prerequisite Depth:</strong>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.pathB.prerequisiteDepth}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-950 dark:text-white block font-black mb-1">Constraint Compatibility:</strong>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.pathB.constraintCompatibility}</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-950 dark:text-white block font-black mb-1">Reversibility:</strong>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md inline-block mb-1 border border-amber-200 dark:border-amber-800">
                      {analysisResult.pathB.reversibility}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.pathB.reversibilityNotes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Synthesis Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-sm uppercase tracking-wider">
                <IconSparkles size={18} />
                <span>Beacon Career Synthesis & Strategic Direction</span>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950/70 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 font-medium leading-relaxed">
                {analysisResult.recommendation}
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Recommended Immediate Milestones:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.suggestedTasks.map((t, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                      <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full shrink-0 border border-indigo-200 dark:border-indigo-800">
                        {t.minutes} mins
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Adopting this pathway automatically synchronizes tasks into your Personal Roadmap.
                </span>

                <button
                  onClick={handleAdoptRoadmap}
                  disabled={adopting || adoptedSuccess}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <IconCheckCircle size={16} />
                  <span>{adoptedSuccess ? "Adopted into Roadmap ✓" : adopting ? "Synchronizing..." : "Adopt Path & Add to Roadmap →"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
