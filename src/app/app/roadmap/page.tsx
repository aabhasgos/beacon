"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconCalendar,
  IconCheckCircle,
  IconTarget,
  IconSparkles,
} from "@/components/icons/Icons";

const TARGET_PRESETS = [
  "Razorpay Core Payments Engineering Intern",
  "ISRO Satellite Data Systems Research Intern",
  "Google India STEP Software Engineering Program",
  "Smart India Hackathon (SIH 2026) National Finalist",
  "Full-Stack Production Engineer (Next.js & Go)",
];

export default function RoadmapPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
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

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "todo" : "completed";
    try {
      // Optimistic update
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
          estimatedMinutes: newTaskMins,
          deadline: newTaskDeadline || null,
          goalId: goals[0]?.id || null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
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
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Active Goal Anchor Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Target Career Milestone
              </span>
              {activeGoal && (
                <span className="text-[11px] font-bold text-slate-400">
                  Target: {activeGoal.target_date || "This Semester"}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeGoal?.title || "Your Execution Roadmap is Unset"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {activeGoal
                ? `Milestones tailored to your verified skills and exam blackout periods. Track progress as you build proof.`
                : `Generate a personalized semester roadmap grounded in your target company or national hackathon.`}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeGoal ? (
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[130px]">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  Roadmap Progress
                </span>
                <span className="text-3xl font-black font-mono text-indigo-400">{progressPercent}%</span>
                <span className="text-[11px] text-slate-300 block mt-0.5 font-medium">
                  {completedCount} / {tasks.length} tasks done
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

        {/* Task List Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">Roadmap Execution Checklist</h2>
            <p className="text-xs text-slate-500">
              Clear, bite-sized tasks to build proof of ability without overwhelming your university schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              + Add Custom Task
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
            Loading your execution checklist...
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
                Use Beacon AI to generate a step-by-step semester roadmap for Razorpay, ISRO, Google, or Smart India Hackathon, or create custom tasks manually.
              </p>
            </div>
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all inline-flex items-center gap-2"
            >
              <IconSparkles size={16} />
              <span>Generate Semester Roadmap with Beacon AI</span>
            </button>
          </div>
        )}

        {/* Task Cards */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-3">
            {tasks.map((task) => {
              const isDone = task.status === "completed";
              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? "bg-slate-50/80 border-slate-200 opacity-75"
                      : "bg-white border-slate-200 hover:border-indigo-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isDone
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white hover:border-indigo-500"
                      }`}
                    >
                      {isDone && <IconCheckCircle size={15} />}
                    </button>

                    <div className="space-y-1">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isDone ? "line-through text-slate-500" : "text-slate-950 font-black"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      {task.prerequisite && (
                        <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mt-1">
                          Prereq: {task.prerequisite}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      ⏱ {task.estimated_minutes || 45} mins
                    </span>
                    {task.deadline && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        Due: {task.deadline}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI Generator Modal */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900">Beacon AI Roadmap Generator</h3>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
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

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  Beacon AI uses RAG to ground the roadmap in verified company hiring rubrics, required skills, and your personal Student Passport ledger.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAiRoadmap}
                  disabled={generating}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <IconSparkles size={14} />
                  <span>{generating ? "Generating Tailored Roadmap..." : "Generate Semester Roadmap"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Custom Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">Add Milestone to Roadmap</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Context / Deliverable</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of code, concept, or test cases to implement."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
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
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
