"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AcademyPublicPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const d = await res.json();
          setCourses(d.courses || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold bg-violet-100 text-violet-800 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Curated Course Directory
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Top-rated courses from Harvard, DeepLearning.AI, & MIT
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Don't get tricked into paying ₹30,000 for low-quality recorded bootcamps. Beacon curates the best verified free and accredited computer science, full-stack, and AI courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((crs) => (
            <div
              key={crs.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-200">
                    {crs.is_free ? "⭐ 100% FREE" : "SPECIALIZATION"}
                  </span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    ★ {crs.rating}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug mb-1">
                  {crs.title}
                </h3>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  {crs.provider}
                </p>

                <div className="text-xs text-slate-500 mb-3">
                  {crs.duration} • {crs.level}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {crs.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {crs.review_count?.toLocaleString()} reviews
                </span>

                <a
                  href={crs.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Start Course ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
