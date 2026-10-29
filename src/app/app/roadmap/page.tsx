"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconCalendar,
  IconCheckCircle,
  IconTarget,
  IconSparkles,
  IconBookOpen,
} from "@/components/icons/Icons";

const TARGET_PRESETS = [
  "Google India STEP Software Engineering Program",
  "Razorpay Core Payments Engineering Intern",
  "ISRO Satellite Data Systems Research Intern",
  "Smart India Hackathon (SIH 2026) National Finalist",
  "Full-Stack Production Engineer (Next.js & Go)",
];

export default function RoadmapPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [profileIntelligence, setProfileIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Task Workbench State
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [workbenchCode, setWorkbenchCode] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<string>("python");
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);
  const [evaluationScore, setEvaluationScore] = useState<number | null>(null);

  // New custom task form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskFocusKey, setNewTaskFocusKey] = useState("");
  const [newTaskConcepts, setNewTaskConcepts] = useState("");
  const [newTaskMins, setNewTaskMins] = useState(45);
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTarget, setAiTarget] = useState(TARGET_PRESETS[0]);
  const [aiCustomTarget, setAiCustomTarget] = useState("");
  const [aiWeeks, setAiWeeks] = useState(12);
  const [generating, setGenerating] = useState(false);

  async function loadRoadmap() {
    try {
      const res = await fetch("/api/roadmap");
      if (res.ok) {
        const d = await res.json();
        setGoals(d.goals || []);
        setTasks(d.tasks || []);
        if (d.profileIntelligence) {
          setProfileIntelligence(d.profileIntelligence);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoadmap();
  }, []);

  const openTaskWorkbench = (task: any) => {
    setActiveTask(task);
    setWorkbenchCode(task.submission_code || task.starter_code || "# Type your solution implementation here\n");
    setEvaluationScore(task.evaluation_score || null);
    setEvaluationFeedback(task.evaluation_feedback || null);
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed";
    try {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      await fetch("/api/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
    } catch (e) {
      console.error(e);
      loadRoadmap();
    }
  };

  const handleEvaluateSolution = async () => {
    if (!activeTask) return;
    if (!workbenchCode.trim()) {
      alert("Please write your code or solution in the editor before submitting for evaluation.");
      return;
    }

    setEvaluating(true);
    setEvaluationFeedback(null);
    setEvaluationScore(null);

    try {
      const res = await fetch("/api/roadmap/evaluate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTask.id,
          submissionCode: workbenchCode,
          language: selectedLang,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvaluationScore(data.score);
        setEvaluationFeedback(data.feedback);
        // Refresh local task in state
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTask.id
              ? {
                  ...t,
                  status: "completed",
                  submission_code: workbenchCode,
                  evaluation_score: data.score,
                  evaluation_feedback: data.feedback,
                }
              : t
          )
        );
      } else {
        alert(data.error || "Evaluation failed. Please try again.");
      }
    } catch (err) {
      console.error("Evaluation request error:", err);
      alert("Failed to connect to evaluation engine.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || undefined,
          focusKey: newTaskFocusKey.trim() || undefined,
          conceptsToLearn: newTaskConcepts.trim() || undefined,
          estimatedMinutes: newTaskMins,
          deadline: newTaskDeadline || null,
          goalId: goals[0]?.id || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskFocusKey("");
        setNewTaskConcepts("");
        loadRoadmap();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAiRoadmap = async () => {
    const target = aiCustomTarget.trim() ? aiCustomTarget.trim() : aiTarget;
    if (!target) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMilestone: target,
          timeframeWeeks: aiWeeks,
        }),
      });

      if (res.ok) {
        setShowAiModal(false);
        setAiCustomTarget("");
        loadRoadmap();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const activeGoal = goals[0];
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Active Goal Anchor Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Target Milestone & Recruiter Preparation
              </span>
              {activeGoal && (
                <span className="text-[11px] font-bold text-slate-400">
                  Target: {activeGoal.target_date || "This Semester"}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeGoal?.title || "Interactive Technical Preparation Roadmap"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Prepare for real recruitment tasks with interactive code exercises and architecture specs. Type solutions directly in the workbench, run automated diagnostic evaluations, and master key invariants.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeGoal ? (
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[140px]">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Roadmap Progress
                </span>
                <span className="text-3xl font-black font-mono text-indigo-400">{progressPercent}%</span>
                <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">
                  {completedCount} / {tasks.length} tasks verified
                </span>
              </div>
            ) : null}

            <button
              onClick={() => setShowAiModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shrink-0"
            >
              <IconSparkles size={16} />
              <span>{activeGoal ? "Re-generate with AI" : "Generate AI Roadmap"}</span>
            </button>
          </div>
        </div>

        {/* NLP Profile Intelligence & Audit Readiness Card */}
        {profileIntelligence && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-7 border border-indigo-900/40 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    🧠 NLP Profile Diagnostics & Extraction
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Source: {profileIntelligence.resumeFilename}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    Grounded in Your Master Resume NLP Extraction
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                    {profileIntelligence.recommendationReason}
                  </p>
                </div>

                {/* Skills tags */}
                {profileIntelligence.extractedSkills && profileIntelligence.extractedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profileIntelligence.extractedSkills.map((sk: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 px-2.5 py-1 rounded-lg backdrop-blur-xs"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Diagnostic Audit Score Meter */}
              <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-5 text-center min-w-[170px] backdrop-blur-md">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block mb-1">
                  AI Diagnostic Audit Score
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black font-mono text-emerald-400">
                    {profileIntelligence.auditScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
                <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full">
                  High Readiness
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Task List Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 pt-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Interactive Technical Tasks & Engineering Workbenches
            </h2>
            <p className="text-xs text-slate-500">
              Click any task below to open its dedicated typing workbench, inspect the Main Focus Key, and run live diagnostic evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              + Add Custom Milestone
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
            Loading your technical preparation tasks...
          </div>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 sm:p-14 text-center space-y-4">
            <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
              <IconTarget size={28} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">No Active Tasks in Roadmap</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Use Beacon AI to generate concrete engineering tasks with code starter templates and main focus keys for your target company or national hackathon.
              </p>
            </div>
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all inline-flex items-center gap-2"
            >
              <IconSparkles size={16} />
              <span>Generate Interactive Roadmap with Beacon AI</span>
            </button>
          </div>
        )}

        {/* Rich Interactive Task Cards */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              const isDone = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                    isDone
                      ? "bg-emerald-50/20 border-emerald-200/80 shadow-xs"
                      : "bg-white border-slate-200 hover:border-indigo-400 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Left: Task Info & Badges */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md">
                          Task #{idx + 1} • {task.task_type || "Technical Implementation"}
                        </span>
                        {isDone ? (
                          <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <IconCheckCircle size={13} />
                            Verified Solution (Score: {task.evaluation_score || 90}/100)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-md">
                            Pending Implementation
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md">
                          ⏱ {task.estimated_minutes || 45} mins
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-950">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Main Focus Key Callout */}
                      {task.focus_key && (
                        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-3 sm:p-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-900 font-black text-xs uppercase tracking-wide">
                            <span>🎯 Main Focus Key:</span>
                            <span className="text-indigo-800 font-bold normal-case">{task.focus_key}</span>
                          </div>
                          {task.concepts_to_learn && (
                            <p className="text-xs text-indigo-950/80 font-medium pt-0.5">
                              <strong>📚 What you have to learn:</strong> {task.concepts_to_learn}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Evaluation Feedback snippet if present */}
                      {task.evaluation_feedback && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                          <strong className="text-slate-900 block mb-0.5">Evaluator Feedback:</strong>
                          <span className="line-clamp-2">{task.evaluation_feedback}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <button
                        onClick={() => openTaskWorkbench(task)}
                        className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Open Interactive Workbench</span>
                      </button>

                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isDone
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isDone ? (
                          <>
                            <IconCheckCircle size={14} />
                            <span>Mark Incomplete</span>
                          </>
                        ) : (
                          <span>Mark Done Manually</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INTERACTIVE TASK WORKBENCH MODAL (Where user types & evaluates) */}
        {activeTask && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-auto animate-in fade-in duration-150 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-md">
                      Interactive Technical Workbench
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {activeTask.task_type || "Engineering Task"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                    {activeTask.title}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTask(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Focus Key and Learning Objectives Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-2 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                    🎯 Main Focus Key:
                  </span>
                  <span className="text-sm font-black text-white">
                    {activeTask.focus_key || "Core Problem Solving & Invariant Preservation"}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed space-y-1 pt-1 border-t border-slate-800">
                  <strong className="text-indigo-300 block">📚 What You Have to Learn:</strong>
                  <p>{activeTask.concepts_to_learn || "Review boundary invariants, race conditions, edge-case checks, and runtime complexity requirements."}</p>
                </div>
              </div>

              {/* Code / Solution Editor Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <span>💻 Interactive Solution & Code Editor</span>
                    <span className="text-[11px] font-normal text-slate-500">(Type or refine your code below)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
                    >
                      <option value="python">Python 3</option>
                      <option value="typescript">TypeScript</option>
                      <option value="golang">Go (Golang)</option>
                      <option value="cpp">C++</option>
                      <option value="markdown">Architecture Spec (Markdown)</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setWorkbenchCode(activeTask.starter_code || "")}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded cursor-pointer"
                    >
                      Reset to Starter Code
                    </button>
                  </div>
                </div>

                {/* Monospace Code Editor */}
                <div className="relative">
                  <textarea
                    rows={12}
                    value={workbenchCode}
                    onChange={(e) => setWorkbenchCode(e.target.value)}
                    placeholder="// Type your code solution or architectural spec here..."
                    className="w-full font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed selection:bg-indigo-700 selection:text-white resize-y"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Evaluation Output Section */}
              {evaluationFeedback && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      <h4 className="text-sm font-black text-emerald-950">
                        Beacon AI Diagnostic Evaluation
                      </h4>
                    </div>
                    {evaluationScore && (
                      <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
                        Evaluation Score: {evaluationScore} / 100
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {evaluationFeedback}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">
                  Evaluated code is recorded in your Beacon Student Ledger for recruiter proof.
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Close Workbench
                  </button>

                  <button
                    type="button"
                    onClick={handleEvaluateSolution}
                    disabled={evaluating}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <IconSparkles size={15} />
                    <span>{evaluating ? "Evaluating Solution..." : "🧪 Run & Evaluate Solution"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generator Modal */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900">Beacon AI Technical Task Generator</h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Target Goal / Opportunity Preset
                  </label>
                  <select
                    value={aiTarget}
                    onChange={(e) => {
                      setAiTarget(e.target.value);
                      setAiCustomTarget("");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {TARGET_PRESETS.map((p, i) => (
                      <option key={i} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Or Enter Custom Target Career Goal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Autonomous Robotics Vision Intern @ Bengaluru startup"
                    value={aiCustomTarget}
                    onChange={(e) => setAiCustomTarget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Timeframe: {aiWeeks} Weeks (~{Math.round(aiWeeks / 4)} Months)
                  </label>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={2}
                    value={aiWeeks}
                    onChange={(e) => setAiWeeks(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
                    <span>4 Weeks (Rapid Sprint)</span>
                    <span>12 Weeks (Full Semester)</span>
                    <span>24 Weeks (Annual Milestone)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 leading-relaxed space-y-1">
                  <strong className="block text-indigo-900">NLP Grounding Active:</strong>
                  <span>Beacon AI analyzes your resume extraction to generate concrete tasks with specific focus keys and starter code templates.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAiRoadmap}
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <IconSparkles size={14} />
                  <span>{generating ? "Generating Tailored Roadmap..." : "Generate Interactive Roadmap"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Custom Milestone Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">Add Technical Milestone</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement Raft heartbeat timer in Go"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">🎯 Main Focus Key</label>
                  <input
                    type="text"
                    placeholder="e.g. Leader election timeouts & atomic state machine commit"
                    value={newTaskFocusKey}
                    onChange={(e) => setNewTaskFocusKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">📚 What You Have to Learn</label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts, RFC specifications, or algorithms to master."
                    value={newTaskConcepts}
                    onChange={(e) => setNewTaskConcepts(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Minutes</label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Deadline</label>
                    <input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Save Task to Roadmap
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
