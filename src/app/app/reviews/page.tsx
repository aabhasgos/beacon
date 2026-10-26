"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconCheckCircle,
  IconCalendar,
  IconAward,
  IconSparkles,
} from "@/components/icons/Icons";

export default function ReviewsPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [reflection, setReflection] = useState("");
  const [savedReflection, setSavedReflection] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadActivities() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const d = await res.json();
        setActivities(d.activities || []);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  const handleSaveReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection: reflection.trim() }),
      });

      if (res.ok) {
        setSavedReflection(true);
        setReflection("");
        loadActivities();
        setTimeout(() => setSavedReflection(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Progress & Reflection
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                Action-Driven Metric
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Weekly Activity & Milestones
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Beacon measures weekly progress by actual actions completed, not vanity page opens or artificial streaks. Review what changed in your student record over the past 7 days.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0">
            <span className="block text-2xl font-black text-white">{activities.length}</span>
            <span className="text-xs text-indigo-200">Logged Actions</span>
          </div>
        </div>

        {/* Weekly Reflection Input */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-black text-base sm:text-lg text-slate-950">Weekly Student Reflection</h2>
            <p className="text-xs text-slate-500">
              What helped or hindered your progress this week? This reflection is stored in your private student ledger to ground Beacon AI recommendations.
            </p>
          </div>

          <form onSubmit={handleSaveReflection} className="space-y-4">
            <textarea
              rows={3}
              placeholder="e.g. Completed the Raft consensus leader election, but found timer synchronization tricky. Need to review POSIX monotonic clock before exam week..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-normal"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {savedReflection ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 self-start">
                  <IconCheckCircle size={14} className="text-emerald-600" />
                  <span>Reflection recorded in your private ledger!</span>
                </span>
              ) : <div />}
              <button
                type="submit"
                disabled={submitting || !reflection.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-6 py-2.5 rounded-xl cursor-pointer shadow-xs ml-auto transition-all disabled:opacity-50"
              >
                {submitting ? "Recording..." : "Record Reflection"}
              </button>
            </div>
          </form>
        </div>

        {/* Immutable Activity Ledger */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-black text-base sm:text-lg text-slate-950">Chronological Activity Stream</h2>
            <p className="text-xs text-slate-500">
              Every verified certificate, completed roadmap task, and submitted application is logged here.
            </p>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No recent activity logged in your student record yet.
              </div>
            ) : (
              activities.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-black shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className="font-black text-slate-950 text-sm">{act.title}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {act.created_at}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs font-normal">
                      {act.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
