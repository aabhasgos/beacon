import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AboutPublicPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full inline-block">
              About Beacon
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Giving every student a trustworthy platform connecting learning with real opportunities.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Beacon was founded on a simple observation: students in India and across the world are trapped between expensive coaching institutes, predatory bootcamps, and disconnected social platforms designed for ad impressions rather than genuine student growth.
            </p>
          </div>

          {/* Core Principles */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { num: "01", title: "Continuity over disconnected tools", desc: "Your courses, certificates, resume, and opportunity applications are all linked in one single living workspace." },
                { num: "02", title: "Evidence over self-promotion", desc: "We distinguish a claimed skill from demonstrated ability, verified certificates, and actual code projects." },
                { num: "03", title: "Action over advice alone", desc: "Beacon AI doesn't just talk. It recommends courses, creates roadmap tasks, and matches you to eligible internships." },
                { num: "04", title: "Transparent recommendations", desc: "Every opportunity match explains its eligibility criteria clearly so you know exactly where you stand." },
                { num: "05", title: "Student agency and privacy", desc: "Students can inspect stored memories, export their profile to JSON, and delete their data at any time under DPDP 2025." },
                { num: "06", title: "Zero pay-to-rank incentives", desc: "Commercial sponsors will never secretly buy priority rankings over verified student eligibility." },
              ].map((p) => (
                <div key={p.num} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-2">
                      {p.num}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1">{p.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all"
            >
              Create Free Student Profile
            </Link>
            <Link
              href="/opportunities"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-all"
            >
              Browse Internships
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
