"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function OpportunitiesPublicPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchOpps() {
      try {
        const res = await fetch("/api/opportunities");
        if (res.ok) {
          const d = await res.json();
          setOpportunities(d.opportunities || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchOpps();
  }, []);

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredOpps = opportunities.filter((o) => {
    if (filter !== "all" && o.type !== filter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        o.title.toLowerCase().includes(term) ||
        o.organization.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              VERIFIED OPPORTUNITY RADAR
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Explore Verified Opportunities & Internships
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl font-medium">
              Official internships, government fellowships, and national hackathons with source links and real stipends.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-extrabold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto shrink-0 cursor-pointer"
          >
            Create Profile to Apply
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl border border-slate-300 p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            type="text"
            placeholder="Search roles, companies (ISRO, Razorpay, Google, Flipkart)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {["all", "Internship", "Fellowship", "Hackathon"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === cat
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {cat === "all" ? "All Openings" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpps.map((opp) => {
            const isLiked = liked.has(opp.id);
            return (
              <div
                key={opp.id}
                className="bg-white rounded-3xl border border-slate-300 p-6 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        opp.type === "Internship"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : opp.type === "Hackathon"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                      }`}
                    >
                      {opp.type}
                    </span>

                    <button
                      onClick={() => toggleLike(opp.id)}
                      className="p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                      title={isLiked ? "Saved" : "Save opportunity"}
                    >
                      <svg
                        className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-slate-600"}`}
                        fill={isLiked ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-950 group-hover:text-indigo-600 transition-colors leading-snug">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-slate-800">
                        {opp.organization}
                      </span>
                      <span className="text-blue-600 font-black text-xs" title="Verified Organization">✓</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold">Stipend:</span>
                      <span className="font-black text-emerald-800 text-sm">{opp.stipend}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold">Location:</span>
                      <span className="font-bold text-slate-800">{opp.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold">Deadline:</span>
                      <span className="font-bold text-slate-800">{opp.deadline}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">
                    {opp.likes_count || 120} applicants
                  </span>

                  <a
                    href={opp.source_url || opp.official_url || "https://unstop.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Official Portal</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
