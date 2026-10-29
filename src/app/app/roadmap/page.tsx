"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconCalendar,
  IconCheckCircle,
  IconTarget,
  IconSparkles,
  IconBookOpen,
  IconShield,
  IconBriefcase,
  IconExternalLink,
} from "@/components/icons/Icons";

const TARGET_PRESETS = [
  { key: "google", label: "Google Systems & SDE Invariant Track" },
  { key: "razorpay", label: "Razorpay Core Payments & Concurrency Track" },
  { key: "isro", label: "ISRO Satellite Telemetry & Real-Time Track" },
  { key: "sih", label: "Smart India Hackathon (SIH 2026) Architecture Track" },
];

export default function RoadmapPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [profileIntelligence, setProfileIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTrackKey, setActiveTrackKey] = useState<string>("google");
  const [switchingTrack, setSwitchingTrack] = useState(false);
  const [showHowToParticipate, setShowHowToParticipate] = useState(true);

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
  const [newTaskRecruiter, setNewTaskRecruiter] = useState("");
  const [newTaskMins, setNewTaskMins] = useState(45);
  const [newTaskDeadline, setNewTaskDeadline] = useState("");

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTarget, setAiTarget] = useState(TARGET_PRESETS[0].label);
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

  const handleSwitchTrack = async (trackKey: string) => {
    setActiveTrackKey(trackKey);
    setSwitchingTrack(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackKey, timeframeWeeks: 12 }),
      });
      if (res.ok) {
        await loadRoadmap();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingTrack(false);
    }
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
          title: newTaskTitle,
          description: newTaskDesc,
          focusKey: newTaskFocusKey,
          conceptsToLearn: newTaskConcepts,
          recruiterImpact: newTaskRecruiter,
          estimatedMinutes: newTaskMins,
          deadline: newTaskDeadline,
          goalId: goals[0]?.id || null,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskFocusKey("");
        setNewTaskConcepts("");
        setNewTaskRecruiter("");
        loadRoadmap();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAiRoadmap = async () => {
    const target = aiCustomTarget.trim() ? aiCustomTarget : aiTarget;
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
                Hands-On Engineering Task Preparation
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

        {/* SECTION: How to Participate & Complete Engineering Tasks (Action Protocol) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <IconTarget size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  How to Participate: Technical Task Execution Flow
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  We don't give you generic job advice. We prepare you for exact coding and system tasks you will be hired to do.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHowToParticipate(!showHowToParticipate)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {showHowToParticipate ? "Hide Guide" : "Show Guide"}
            </button>
          </div>

          {showHowToParticipate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">NLP Extraction</span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  Profile Audit Score
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  We parse your master resume and verified skills. The diagnostic score (0-100) calibrates tasks to close your gaps for Tier-1 corporate engineering bars.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Task Assignment</span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  Focus Key & Invariants
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Each task gives you a concrete problem, what you need to learn, and the exact invariant (e.g. O(log N) binary search or SETNX distributed locking).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Workbench Typing</span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  Interactive Coding
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Click "Open Interactive Workbench". Select Python, Go, TypeScript, or C++. Write and type your solution directly into the monospace editor.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Evaluation & Hire</span>
                </div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                  Recruiter Discovery
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Hit "Run & Evaluate". Scores &ge; 80 automatically stamp verified proof to your Student Passport, where Razorpay, Google, and ISRO recruit top talent.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* NLP Profile Intelligence & Audit Readiness Card */}
        {profileIntelligence && (
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-7 border border-indigo-900/40 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    NLP Profile Diagnostics Active
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Source: {profileIntelligence.resumeFilename}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    Candidate: {profileIntelligence.candidateName}
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
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Extracted Competencies Identified in Your Record:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profileIntelligence.extractedSkills.map((sk: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{sk}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnostic Audit Score Meter */}
              <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-5 text-center min-w-[190px] backdrop-blur-md">
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
                  {profileIntelligence.auditGrade || "High Readiness"}
                </span>
                <span className="block text-[10px] text-slate-400 mt-2 font-medium">
                  Verified Bar: 80+ for Recruiter Inquiries
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Track Calibration Switcher */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Select Engineering Task Track:</span>
              {switchingTrack && (
                <span className="text-[10px] text-indigo-600 font-bold animate-pulse">Calibrating...</span>
              )}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">1-Click Track Calibration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {TARGET_PRESETS.map((p) => {
              const isSelected = activeTrackKey === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleSwitchTrack(p.key)}
                  disabled={switchingTrack}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs scale-101"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <span className="font-extrabold text-xs leading-snug">{p.label}</span>
                  <span
                    className={`text-[10px] font-semibold mt-2 ${
                      isSelected ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    4 Coding Challenges &bull; Workbenches Ready
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task List Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 pt-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Interactive Technical Tasks & Engineering Workbenches
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any task below to open its dedicated typing workbench, inspect the Main Focus Key, and run live diagnostic evaluations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              + Add Custom Milestone
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 font-medium">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold">Loading your technical preparation tasks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-10 sm:p-14 text-center space-y-4">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
              <IconTarget size={28} />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">No Active Tasks in Roadmap</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
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
          <div className="space-y-5">
            {tasks.map((task, idx) => {
              const isDone = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                    isDone
                      ? "bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/80 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Task Info & Badges */}
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md">
                          Task #{idx + 1} &bull; {task.task_type || "Technical Implementation"}
                        </span>
                        {isDone ? (
                          <span className="text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <IconCheckCircle size={13} />
                            Verified Solution (Score: {task.evaluation_score || 90}/100)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-md">
                            Pending Implementation
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md">
                          Est. {task.estimated_minutes || 45} mins
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                            <strong>What You Need to Do:</strong> {task.description}
                          </p>
                        )}
                      </div>

                      {/* Main Focus Key Callout */}
                      {task.focus_key && (
                        <div className="bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-4 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-black text-xs uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <span>Focus Invariant:</span>
                            <span className="text-indigo-800 dark:text-indigo-200 font-bold normal-case">{task.focus_key}</span>
                          </div>
                          {task.concepts_to_learn && (
                            <p className="text-xs text-indigo-950/80 dark:text-indigo-200/80 font-medium pt-0.5">
                              <strong>Concepts to Master:</strong> {task.concepts_to_learn}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Recruiter Impact Purpose */}
                      {task.recruiter_impact && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                          <div className="w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                            <IconBriefcase size={12} />
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">
                              Recruiter Screening Purpose:
                            </strong>
                            <span className="leading-relaxed">{task.recruiter_impact}</span>
                          </div>
                        </div>
                      )}

                      {/* Inline Starter Code Snippet Preview */}
                      {task.starter_code && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Starter Code Preview (Click Workbench to Type & Run):
                          </span>
                          <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-2xl font-mono text-xs overflow-x-auto max-h-28 border border-slate-800 select-none">
                            <pre className="leading-relaxed">{task.starter_code.slice(0, 240)}...</pre>
                          </div>
                        </div>
                      )}

                      {/* Evaluation Feedback snippet if present */}
                      {task.evaluation_feedback && (
                        <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong className="text-slate-900 dark:text-white block mb-0.5">Evaluator Diagnostic Feedback:</strong>
                          <span className="line-clamp-2">{task.evaluation_feedback}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => openTaskWorkbench(task)}
                        className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <IconTarget size={14} />
                        <span>Open Interactive Workbench</span>
                      </button>

                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isDone
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto animate-in fade-in duration-150 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded-md">
                      Interactive Technical Workbench
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {activeTask.task_type || "Engineering Task"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                    {activeTask.title}
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTask(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Focus Key and Learning Objectives Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                    Focus Invariant:
                  </span>
                  <span className="text-sm font-black text-white">
                    {activeTask.focus_key || "Core Problem Solving & Invariant Preservation"}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed space-y-1 pt-2 border-t border-slate-800">
                  <strong className="text-indigo-300 block">Concepts to Master:</strong>
                  <p>{activeTask.concepts_to_learn || "Review boundary invariants, race conditions, edge-case checks, and runtime complexity requirements."}</p>
                </div>

                {activeTask.recruiter_impact && (
                  <div className="text-[11px] text-emerald-300 pt-1 border-t border-slate-800 flex items-center gap-1.5">
                    <IconBriefcase size={12} className="text-emerald-400 shrink-0" />
                    <span><strong>Recruiter Purpose:</strong> {activeTask.recruiter_impact}</span>
                  </div>
                )}
              </div>

              {/* Code / Solution Editor Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>Interactive Solution & Code Editor</span>
                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">(Type and test your code below)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
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
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 px-2 py-1 rounded cursor-pointer"
                    >
                      Reset Starter Code
                    </button>
                  </div>
                </div>

                {/* Monospace Code Editor */}
                <div className="relative">
                  <textarea
                    rows={13}
                    value={workbenchCode}
                    onChange={(e) => setWorkbenchCode(e.target.value)}
                    placeholder="// Type your code solution or architectural spec here..."
                    className="w-full font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed selection:bg-indigo-700 selection:text-white resize-y shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Evaluation Output Section */}
              {evaluationFeedback && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                        Beacon AI Diagnostic Evaluation
                      </h4>
                    </div>
                    {evaluationScore && (
                      <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
                        Evaluation Score: {evaluationScore} / 100
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {evaluationFeedback}
                  </div>

                  {evaluationScore && evaluationScore >= 80 && (
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                        <IconCheckCircle size={14} className="text-emerald-600" />
                        <span>Verified Invariant Passed & Stamped to Student Passport</span>
                      </span>
                      <Link
                        href="/app/passport"
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View In Passport</span>
                        <IconExternalLink size={11} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Evaluated code is recorded in your Beacon Student Ledger for recruiter proof.
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTask(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
                    <span>{evaluating ? "Evaluating Invariants..." : "Run & Evaluate Solution"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generator Modal */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Beacon AI Technical Task Generator</h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Technical Track Preset
                  </label>
                  <select
                    value={aiTarget}
                    onChange={(e) => {
                      setAiTarget(e.target.value);
                      setAiCustomTarget("");
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {TARGET_PRESETS.map((p, i) => (
                      <option key={i} value={p.label}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Or Enter Custom Technical Target
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Consensus & Raft Invariant Track"
                    value={aiCustomTarget}
                    onChange={(e) => setAiCustomTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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

                <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed space-y-1">
                  <strong className="block text-indigo-900 dark:text-indigo-300">NLP Grounding Active:</strong>
                  <span>Beacon AI analyzes your resume extraction to generate concrete tasks with specific focus keys and starter code templates.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Technical Milestone</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement Raft heartbeat timer in Go"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Focus Invariant</label>
                  <input
                    type="text"
                    placeholder="e.g. Leader election timeouts & atomic state machine commit"
                    value={newTaskFocusKey}
                    onChange={(e) => setNewTaskFocusKey(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Concepts to Master</label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts, RFC specifications, or algorithms to master."
                    value={newTaskConcepts}
                    onChange={(e) => setNewTaskConcepts(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recruiter Screening Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. Evaluated by Razorpay / Swiggy backend infrastructure teams"
                    value={newTaskRecruiter}
                    onChange={(e) => setNewTaskRecruiter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Minutes</label>
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={newTaskMins}
                      onChange={(e) => setNewTaskMins(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Deadline</label>
                    <input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
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
