"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconTarget,
  IconCheckCircle,
  IconSparkles,
  IconAward,
  IconChevronRight,
} from "@/components/icons/Icons";

interface SandboxTask {
  id: string;
  role: string;
  title: string;
  scenario: string;
  deliverable: string;
  rubric: string[];
}

const SANDBOX_TASKS: SandboxTask[] = [
  {
    id: "s1",
    role: "Systems & SRE Track",
    title: "Diagnose Cascading Redis Connection Exhaustion",
    scenario: "Your payments microservice is dropping 12% of requests during peak UPI transaction spikes. The Redis cluster CPU is only at 25%, but client timeouts are surging past 5000ms. Analyze the connection pool configuration.",
    deliverable: "Write a 3-point remediation plan detailing max client pool sizing, TCP keepalive, and exponential jitter backoff.",
    rubric: [
      "Identifies thread starvation vs server CPU saturation",
      "Calculates pool size relative to container worker threads",
      "Proposes jitter backoff to avoid thundering herd problem",
    ],
  },
  {
    id: "s2",
    role: "FinTech & Payments Track",
    title: "Idempotent Webhook Processing Engine",
    scenario: "Third-party payment gateways (Razorpay/PayTM) periodically replay webhook notifications during network partitions. Two concurrent HTTP workers received the same transaction authorization event within 4ms.",
    deliverable: "Specify the database unique constraints, Redis distributed lock pattern (Redlock or SET NX PX), and transaction boundary steps to guarantee zero double-crediting.",
    rubric: [
      "Atomic idempotency key verification prior to balance mutations",
      "Correct distributed lock acquisition with TTL safety margins",
      "Handling duplicate webhooks returning idempotent 200 OK responses",
    ],
  },
  {
    id: "s3",
    role: "AI & LLM Systems Track",
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
    role: "Frontend Systems Track",
    title: "Implement Accessible ARIA 1.2 Combobox Focus Traps",
    scenario: "A screen-reader user reports that when selecting an autocomplete suggestion, focus jumps to the bottom of the body element, and ArrowDown wraps around inconsistently.",
    deliverable: "Outline the key DOM attribute states (aria-expanded, aria-activedescendant) and keyboard listener logic to guarantee WCAG 2.2 AA compliance.",
    rubric: [
      "Proper use of aria-activedescendant without moving native DOM focus",
      "Handling Home, End, and PageDown keys",
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
    } catch (err) {
      setErrorMsg("An error occurred during evaluation. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Career Sandbox & Simulation
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                4 Engineering Tracks
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Real-World Job Mini-Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Experience the actual engineering challenges solved by senior engineers at Razorpay, Google, and top startups. Audited answers directly award verified <strong className="text-indigo-300">Assessed</strong> badges to your Student Passport.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0">
            <span className="block text-2xl font-black text-white">100% Free</span>
            <span className="text-xs text-indigo-200">No Paywalls Ever</span>
          </div>
        </div>

        {/* Task Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {SANDBOX_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                setSelectedTask(task);
                setSubmission("");
                setEvalResult(null);
                setErrorMsg("");
              }}
              className={`text-left text-xs font-bold p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedTask.id === task.id
                  ? "bg-slate-950 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] block opacity-70 uppercase tracking-wider mb-0.5">
                {task.role}
              </span>
              <span className="line-clamp-2">{task.title}</span>
            </button>
          ))}
        </div>

        {/* Active Task Workspace */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                Track: {selectedTask.role}
              </span>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full self-start sm:self-auto">
              Simulated 45-Min Challenge
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 mb-3">{selectedTask.title}</h2>

            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 space-y-2">
              <strong className="text-slate-900 block font-bold text-sm">
                Incident Scenario Context:
              </strong>
              <p>{selectedTask.scenario}</p>
            </div>

            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 text-xs sm:text-sm text-indigo-950 mb-5">
              <strong className="block font-bold text-indigo-900 mb-1">
                Your Deliverable:
              </strong>
              <p>{selectedTask.deliverable}</p>
            </div>

            {/* Rubric Points */}
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Official Staff Evaluator Rubric:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedTask.rubric.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                  >
                    <span className="text-indigo-600 font-bold shrink-0">✓</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Deliverable Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Draft Your Architectural Remediation / Plan:
              </label>
              <textarea
                rows={6}
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Write your technical explanation detailing configuration changes, algorithms, and resilience safeguards..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />

              {errorMsg && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Evaluated with Beacon AI (Groq LLaMA 3.3 Engine).
                </span>

                <button
                  onClick={handleEvaluate}
                  disabled={evaluating || !submission.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-6 py-3 rounded-xl cursor-pointer transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <IconSparkles size={16} />
                  <span>{evaluating ? "Evaluating Rigor..." : "Submit for Staff Audit"}</span>
                </button>
              </div>
            </div>

            {/* Evaluation Result */}
            {evalResult && (
              <div className="mt-8 border-t border-slate-100 pt-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
                  <div>
                    <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider block">
                      Audit Evaluation Result
                    </span>
                    <strong className="text-base text-slate-900 font-black">
                      {selectedTask.title}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold block">Rubric Score</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {evalResult.score} <span className="text-xs text-slate-400 font-medium">/ 100</span>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3 text-xs sm:text-sm">
                  <div>
                    <strong className="text-emerald-700 font-bold block mb-1">
                      Architectural Strengths:
                    </strong>
                    <p className="text-slate-700 leading-relaxed">{evalResult.strengths}</p>
                  </div>

                  {evalResult.improvements && (
                    <div className="pt-2 border-t border-slate-200">
                      <strong className="text-indigo-800 font-bold block mb-1">
                        Production Opportunities:
                      </strong>
                      <p className="text-slate-700 leading-relaxed">{evalResult.improvements}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl">
                  <IconCheckCircle size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Official <strong className="font-bold">Assessed</strong> badge and simulation milestone have been recorded in your Student Passport.
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
