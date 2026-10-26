"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconCheckCircle,
  IconSearch,
  IconBriefcase,
  IconBookOpen,
  IconCompass,
  IconCalendar,
  IconAward,
  IconFileText,
  IconSparkles,
  IconChevronRight,
  IconExternalLink,
} from "@/components/icons/Icons";

export default function StudentAppTodayPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"for-you" | "internships" | "courses">("for-you");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, recRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/career/recommendations"),
        ]);
        if (profRes.ok) {
          const d = await profRes.json();
          setProfileData(d);
        }
        if (recRes.ok) {
          const r = await recRes.json();
          setRecommendations(r);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const user = profileData?.user;
  const completeness = recommendations?.profileCompleteness || 30;
  const missingSteps = recommendations?.missingSteps || [];
  const matchedOpportunities = recommendations?.matchedOpportunities || [];
  const recommendedCourses = recommendations?.recommendedCourses || [];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Executive Greeting & Career Cockpit Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
                <span>🎓 {user?.college || "Raw Student Profile"}</span>
                <span>•</span>
                <span>{user?.cgpa ? `Verified CGPA: ${user.cgpa}` : "Account Active"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {user?.full_name || "Student"}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed font-normal">
                Your unified career intelligence feed: Internshala verified openings, Coursera certified courses, and LinkedIn-caliber profile proof combined.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/app/passport"
                className="px-5 py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-200 hover:opacity-95"
                style={{ backgroundColor: "#FFFFFF", color: "#020617" }}
              >
                <IconAward size={16} style={{ color: "#020617" }} className="shrink-0" />
                <span style={{ color: "#020617" }} className="font-black text-xs tracking-tight">
                  My Passport & Locker
                </span>
              </Link>
              <Link
                href="/app/guide"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <IconCompass size={16} className="text-white shrink-0" />
                <span className="text-white font-black">Ask Beacon AI Coach</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Strength & "How to Get Better" Diagnostic Strip */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-base sm:text-lg font-black text-slate-950">
                  Profile Strength & CV Readiness: {completeness}%
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated against verified employer hiring standards at Razorpay, Google, and ISRO.
              </p>
            </div>

            <div className="w-full sm:w-48 bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {/* Missing items checklist to get better */}
          {missingSteps.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                Recommended Actions to Unlock 100% Strength:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {missingSteps.map((step: string, idx: number) => (
                  <Link
                    key={idx}
                    href="/app/passport"
                    className="p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs text-slate-700 flex items-center justify-between group transition-all"
                  >
                    <span className="font-medium group-hover:text-indigo-900">+ {step}</span>
                    <IconChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tailored Career Advice Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                1. What Should You Prefer?
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-950 block">
                {recommendations?.preferredPathway || "Tier-1 Engineering Internships"}
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {recommendations?.pathwayExplanation || "Focus on building verified proof of work."}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                2. What Should You Learn Next?
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-950 block">
                Bridge High-Throughput Distributed Primitives
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Master database ACID semantics and RPC frames (MIT 6.824 & Full Stack Open) to qualify for 50k+/mo stipends.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-violet-700 block">
                3. How to Improve Your CV?
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-950 block">
                Add Measurable Proof & Benchmarks
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Run your GitHub repositories through Beacon AI Project Audit to attach official verified evidence badges.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/app/opportunities"
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">💼</span>
            <span className="font-black text-base text-slate-950 block">Internships</span>
            <span className="text-xs font-semibold text-slate-500">Razorpay, ISRO & Google</span>
          </Link>

          <Link
            href="/app/academy"
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📚</span>
            <span className="font-black text-base text-slate-950 block">Top Courses</span>
            <span className="text-xs font-semibold text-slate-500">Harvard CS50, DeepLearning</span>
          </Link>

          <Link
            href="/app/projects"
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">🛠️</span>
            <span className="font-black text-base text-slate-950 block">Proof of Work</span>
            <span className="text-xs font-semibold text-slate-500">AI Architectural Audit</span>
          </Link>

          <Link
            href="/app/decision-studio"
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all group"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">⚖️</span>
            <span className="font-black text-base text-slate-950 block">Decision Studio</span>
            <span className="text-xs font-semibold text-slate-500">Trade-Off Counterfactuals</span>
          </Link>
        </div>

        {/* Feed & Opportunities Section (Coursera + Internshala Combined) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <button
                onClick={() => setActiveTab("for-you")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === "for-you"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                🎯 Personalized For You
              </button>
              <button
                onClick={() => setActiveTab("internships")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === "internships"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                💼 Verified Internships ({matchedOpportunities.length})
              </button>
              <button
                onClick={() => setActiveTab("courses")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeTab === "courses"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                📚 Certified Courseware ({recommendedCourses.length})
              </button>
            </div>

            <Link
              href="/app/opportunities"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Opportunities</span>
              <IconChevronRight size={14} />
            </Link>
          </div>

          {/* Cards Feed */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-medium text-xs">
              Calibrating personalized career recommendations...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab 1: Personalized Match Feed */}
              {activeTab === "for-you" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchedOpportunities.slice(0, 4).map((opp: any) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between gap-4 shadow-xs hover:border-indigo-300 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full uppercase">
                            {opp.type}
                          </span>
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            🔥 {opp.matchScore}% Profile Match
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-950">{opp.title}</h3>
                          <span className="text-xs font-bold text-slate-600 block mt-0.5">
                            {opp.organization} • {opp.location}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                          {opp.description}
                        </p>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Stipend & Timeline:
                          </span>
                          <strong className="text-slate-900 block font-black">{opp.stipend}</strong>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500 font-medium">Deadline: {opp.deadline}</span>
                        <Link
                          href="/app/opportunities"
                          className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <span>Review & Apply</span>
                          <IconChevronRight size={13} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Internships Tab */}
              {activeTab === "internships" && (
                <div className="space-y-3">
                  {matchedOpportunities.map((opp: any) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-indigo-300 transition-all text-xs sm:text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded-md">
                            {opp.organization}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {opp.matchScore}% Match
                          </span>
                        </div>
                        <h3 className="font-black text-slate-950 text-base">{opp.title}</h3>
                        <p className="text-slate-500 text-xs">
                          {opp.location} • Stipend: {opp.stipend} • Deadline: {opp.deadline}
                        </p>
                      </div>

                      <Link
                        href="/app/opportunities"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl self-start sm:self-auto shrink-0 transition-all shadow-xs"
                      >
                        Start Application
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Courses Tab */}
              {activeTab === "courses" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedCourses.map((crs: any) => (
                    <div
                      key={crs.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between gap-4 shadow-xs hover:border-indigo-300 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full uppercase">
                            {crs.category}
                          </span>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            ★ {crs.rating}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-950">{crs.title}</h3>
                          <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                            Offered by {crs.provider}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {crs.description}
                        </p>

                        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-medium">
                          💡 {crs.whyRecommended}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          {crs.is_free ? "100% Free Courseware" : "Free Audit Available"}
                        </span>
                        <a
                          href={crs.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <span>Launch Courseware</span>
                          <IconExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
