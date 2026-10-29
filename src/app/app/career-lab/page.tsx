"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconTarget,
  IconCheckCircle,
  IconSparkles,
  IconAward,
  IconChevronRight,
  IconShield,
  IconBriefcase,
} from "@/components/icons/Icons";

interface SandboxTask {
  id: string;
  role: string;
  trackKey: string;
  employerProvenance: string;
  difficulty: string;
  estimatedMinutes: number;
  title: string;
  scenario: string;
  deliverable: string;
  rubric: string[];
}

const SANDBOX_TASKS: SandboxTask[] = [
  {
    id: "s1",
    role: "Systems & Infrastructure SRE",
    trackKey: "Systems Track",
    employerProvenance: "Simulated Razorpay Core Payments Challenge",
    difficulty: "Advanced",
    estimatedMinutes: 45,
    title: "Diagnose Cascading Redis Connection Exhaustion",
    scenario: "Your payments microservice is dropping 12% of requests during peak UPI transaction spikes. The Redis cluster CPU is only at 25%, but client timeouts are surging past 5000ms. Analyze the connection pool configuration under high concurrency.",
    deliverable: "Write a 3-point remediation plan detailing max client pool sizing, TCP keepalive, and exponential jitter backoff.",
    rubric: [
      "Identifies thread starvation vs server CPU saturation",
      "Calculates pool size relative to container worker threads",
      "Proposes jitter backoff to avoid thundering herd problem",
    ],
  },
  {
    id: "s2",
    role: "FinTech & Payments Engineering",
    trackKey: "FinTech Track",
    employerProvenance: "Simulated CRED / Razorpay Webhook Standard",
    difficulty: "Advanced",
    estimatedMinutes: 40,
    title: "Idempotent Webhook Processing Engine",
    scenario: "Third-party payment gateways periodically replay webhook notifications during network partitions. Two concurrent HTTP workers received the same transaction authorization event within 4ms.",
    deliverable: "Specify the database unique constraints, Redis distributed lock pattern (Redlock or SET NX PX), and transaction boundary steps to guarantee zero double-crediting.",
    rubric: [
      "Atomic idempotency key verification prior to balance mutations",
      "Correct distributed lock acquisition with TTL safety margins",
      "Handling duplicate webhooks returning idempotent 200 OK responses",
    ],
  },
  {
    id: "s3",
    role: "AI & LLM Systems Engineering",
    trackKey: "AI Systems Track",
    employerProvenance: "Simulated Enterprise RAG Production Problem",
    difficulty: "Intermediate",
    estimatedMinutes: 35,
    title: "RAG Latency Optimization & Chunk Re-ranking",
    scenario: "Your student RAG pipeline has a p95 retrieval latency of 3.4 seconds across 200,000 course syllabus chunks. High query latency is causing user dropout in live chat sessions.",
    deliverable: "Propose a multi-stage retrieval architecture: hybrid lexical search + vector ANN index (HNSW), cross-encoder re-ranking top-20 to top-5, and Redis semantic caching.",
    rubric: [
      "Hierarchical retrieval (fast lexical/HNSW stage followed by heavy re-ranker)",
      "Cache invalidation strategy for semantic query matching",
      "Quantization / dimensionality trade-offs for embedding vectors",
    ],
  },
  {
    id: "s4",
    role: "Frontend & Design Systems",
    trackKey: "Frontend Track",
    employerProvenance: "Simulated WCAG 2.2 Enterprise Standard",
    difficulty: "Intermediate",
    estimatedMinutes: 30,
    title: "Implement Accessible ARIA 1.2 Combobox Focus Traps",
    scenario: "A screen-reader user reports that when selecting an autocomplete suggestion, focus jumps to the bottom of the body element, and ArrowDown wraps around inconsistently.",
    deliverable: "Outline the key DOM attribute states (aria-expanded, aria-activedescendant) and keyboard listener logic to guarantee WCAG 2.2 AA compliance.",
    rubric: [
      "Proper use of aria-activedescendant without moving native DOM focus",
      "Handling Home, End, and PageDown keys gracefully",
      "Virtual announcement of active item index",
    ],
  },
];

export default function CareerLabPage() {
  const [selectedTask, setSelectedTask] = useState<SandboxTask>(SANDBOX_TASKS[0]);
  const [submission, setSubmission] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{
    score: number;
    strengths: string;
    improvements: string;
    provenance: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleEvaluate = async () => {
    if (!submission.trim() || submission.trim().length < 15) {
      setErrorMsg("Please provide a substantive technical deliverable (at least 15 characters).");
      return;
    }

    setErrorMsg("");
    setEvaluating(true);
    setEvalResult(null);

    try {
      const res = await fetch("/api/career-lab/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          role: selectedTask.role,
          title: selectedTask.title,
          scenario: selectedTask.scenario,
          deliverable: selectedTask.deliverable,
          rubric: selectedTask.rubric,
          submission,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResult({
          score: data.score,
          strengths: data.strengths,
          improvements: data.improvements,
          provenance: data.provenance,
        });
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to evaluate submission.");
      }
    } catch {
      setErrorMsg("An error occurred during evaluation. Please try again.");
    } finally {
      setEvaluating(false);
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
                CAREER SANDBOX & SIMULATION
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>4 Production Tracks</span>
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">• Proof-of-Work Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Real-World Job Mini-Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Experience the actual engineering challenges solved by senior engineers at Razorpay, Google, and top startups. Audited answers directly award verified <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Assessed</strong> badges to your Student Passport.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center shrink-0 self-start md:self-auto min-w-[150px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Tier-1 Standard
            </span>
            <span className="text-xl font-black text-slate-950 dark:text-white block">100% Free</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Zero Paywalls</span>
          </div>
        </div>

        {/* Unified 4-Track Selector Grid */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Production Engineering Track:
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Click a track to load its simulated incident
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SANDBOX_TASKS.map((task) => {
              const isSelected = selectedTask.id === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setSubmission("");
                    setEvalResult(null);
                    setErrorMsg("");
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        }`}
                      >
                        {task.trackKey}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {task.estimatedMinutes}m
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug">
                      {task.title}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
                    <span className={isSelected ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"}>
                      {task.difficulty}
                    </span>
                    <span className={`font-black ${isSelected ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`}>
                      {isSelected ? "Active Task ✓" : "Load Task →"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Task Workspace Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          {/* Track Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide block">
                  Track: {selectedTask.role}
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedTask.employerProvenance}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full">
                Simulated {selectedTask.estimatedMinutes}-Min Challenge
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mb-4 tracking-tight">
              {selectedTask.title}
            </h2>

            {/* Incident Scenario Context Well */}
            <div className="bg-slate-50 dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-5 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm">
                <IconShield size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Production Incident Scenario Context:</span>
              </div>
              <p className="leading-relaxed">{selectedTask.scenario}</p>
            </div>

            {/* High-Contrast Deliverable Well */}
            <div className="bg-indigo-50 dark:bg-indigo-950/70 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 mb-6 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-black text-indigo-950 dark:text-indigo-200 text-sm">
                <IconAward size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Your Required Technical Deliverable:</span>
              </div>
              <p className="font-medium leading-relaxed">{selectedTask.deliverable}</p>
            </div>

            {/* Official Evaluator Rubric */}
            <div className="space-y-2.5 mb-6">
              <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Official Staff Evaluator Rubric Criteria:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedTask.rubric.map((r, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 leading-snug"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0 text-sm">✓</span>
                    <span className="font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Deliverable Input Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Draft Your Architectural Remediation / Plan:
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {submission.length} characters
                </span>
              </div>

              <textarea
                rows={7}
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Write your technical explanation detailing configuration changes, thread calculations, exponential jitter algorithms, and resilience safeguards..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-400 font-mono leading-relaxed transition-all"
              />

              {errorMsg && (
                <div className="text-xs font-bold text-rose-900 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 p-3.5 rounded-xl border border-rose-300 dark:border-rose-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Evaluated against Staff SRE standards via Beacon AI (Groq LLaMA 3.3).</span>
                </div>

                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={evaluating || !submission.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                >
                  <IconSparkles size={16} />
                  <span>{evaluating ? "Evaluating Deliverable Rigor..." : "Submit for Staff Audit →"}</span>
                </button>
              </div>
            </div>

            {/* Evaluation Results Card */}
            {evalResult && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 p-5 rounded-2xl">
                  <div>
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-wider block">
                      Audit Evaluation Result
                    </span>
                    <strong className="text-base sm:text-lg text-slate-950 dark:text-white font-black">
                      {selectedTask.title}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Rubric Score</span>
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                      {evalResult.score} <span className="text-xs text-slate-500 font-semibold">/ 100</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3.5 text-xs sm:text-sm">
                  <div>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-black block mb-1">
                      Architectural Strengths:
                    </strong>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {evalResult.strengths}
                    </p>
                  </div>

                  {evalResult.improvements && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <strong className="text-amber-700 dark:text-amber-400 font-black block mb-1">
                        Production Opportunities & Hardening:
                      </strong>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {evalResult.improvements}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-3 rounded-xl">
                  <IconCheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Official <strong className="font-black">Assessed Badge</strong> and simulation milestone have been cryptographically stamped to your Student Passport.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
