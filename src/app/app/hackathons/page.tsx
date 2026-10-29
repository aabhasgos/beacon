"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconTarget,
  IconSearch,
  IconAward,
  IconExternalLink,
  IconCheckCircle,
  IconShield,
  IconBriefcase,
  IconSparkles,
} from "@/components/icons/Icons";

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [extracting, setExtracting] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  async function loadHackathons() {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("q", search.trim());
      if (domainFilter !== "all") params.append("domain", domainFilter);
      if (modeFilter !== "all") params.append("mode", modeFilter);

      const res = await fetch(`/api/hackathons?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setHackathons(d.hackathons || []);
      }
    } catch (err) {
      console.error("Failed to load hackathons:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHackathons();
  }, [domainFilter, modeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHackathons();
  };

  const handleExtractLiveHackathons = async () => {
    setExtracting(true);
    setSyncToast(null);
    try {
      const res = await fetch("/api/hackathons/sync", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setSyncToast(d.message || "Live extraction complete! Updated hackathons across India.");
        setTimeout(() => setSyncToast(null), 6000);
        await loadHackathons();
      }
    } catch (err) {
      setSyncToast("Autonomous extraction encountered network delay.");
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setExtracting(false);
    }
  };

  const handleRedirectToOfficial = async (h: any) => {
    try {
      // Log student exploration telemetry
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "hackathon_official_redirect",
          title: `Redirected to ${h.title}`,
          description: `Student redirected to official portal: ${h.officialUrl}`,
          metadata: {
            hackathonId: h.id,
            organizer: h.organizer,
            officialUrl: h.officialUrl,
            verifiedDomain: h.verifiedDomain,
          },
        }),
      });
    } catch (e) {
      // ignore
    }
    window.open(h.officialUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* National Live Hackathon Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle tri-color India flag ambient glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <span>🇮🇳 National Engineering Radar</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Web Extractor Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Hackathons Across India
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Autonomous multi-source extraction of official national engineering hackathons, central government challenges (Smart India Hackathon SIH 2026), and enterprise innovation competitions. Participate directly on verified official portals.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleExtractLiveHackathons}
                disabled={extracting}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className={extracting ? "animate-spin" : ""}>🔄</span>
                <span>{extracting ? "Crawling India Portals..." : "Extract Latest Hackathons"}</span>
              </button>
              <Link
                href="/app/opportunities"
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-1.5 text-center"
              >
                <IconBriefcase size={14} />
                <span>Switch to Jobs & Internships</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-xs relative z-10">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Cash Pool</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">₹1.8+ Crore</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Challenges</span>
              <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">{hackathons.length} National</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Govt SIH Portal</span>
              <span className="text-base sm:text-lg font-black text-amber-400">sih.gov.in Tracked</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Redirections</span>
              <span className="text-base sm:text-lg font-black text-indigo-300">100% Direct Official</span>
            </div>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncToast && (
          <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <span>{syncToast}</span>
            </div>
            <button
              onClick={() => setSyncToast(null)}
              className="text-cyan-400 hover:text-white font-black text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Search & Domain Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IconSearch size={16} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hackathons by name, organizer, city, or tech stack (e.g. SIH, Flipkart, ETHIndia, AI)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* Domain & Work Mode Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Domain Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Domain:</span>
              {[
                { id: "all", label: "All Challenges" },
                { id: "SIH", label: "🏆 SIH & Open Innovation" },
                { id: "AI", label: "🧠 AI & ML" },
                { id: "Web3", label: "⚡ Web3 & Systems" },
                { id: "Cyber", label: "🛡️ Cyber Security" },
                { id: "Corporate", label: "💼 Corporate PPO Track" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDomainFilter(tab.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    domainFilter === tab.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Mode:</span>
              {[
                { id: "all", label: "All" },
                { id: "Hybrid", label: "Hybrid" },
                { id: "In-Person", label: "In-Person" },
                { id: "Online", label: "Online" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeFilter(m.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    modeFilter === m.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                      : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <span className="text-2xl animate-spin block mb-2">🔄</span>
            <p className="text-xs font-bold text-slate-500">Extracting official Indian hackathons...</p>
          </div>
        ) : hackathons.length > 0 ? (
          <div className="space-y-4">
            {hackathons.map((h: any) => {
              const isGovt = h.organizerType === "Government of India";
              const isPpo = h.domain?.includes("Corporate");

              return (
                <div
                  key={h.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  {/* Featured Ribbon Accent */}
                  {h.isFeatured && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-bl-2xl shadow-xs">
                      ★ Featured National Challenge
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* Top Row: Organizer Monogram, Type, and Mode */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pr-20">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0 ${h.logoBg}`}
                        >
                          {h.logoText}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {h.organizer}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                isGovt
                                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                  : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {h.organizerType}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            📍 {h.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                          {h.mode}
                        </span>
                      </div>
                    </div>

                    {/* Challenge Title */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {h.title}
                      </h3>
                    </div>

                    {/* Prize Banner & Highlights */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block tracking-wider">
                          Prize Pool & Grants
                        </span>
                        <span className="text-sm sm:text-base font-black text-emerald-900 dark:text-emerald-300 font-mono">
                          {h.prizePool}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {isPpo && (
                          <span className="text-[11px] font-black bg-indigo-600 text-white px-2.5 py-1 rounded-xl shadow-2xs">
                            ⚡ Direct PPO Fast-Track
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                          👥 {h.teamSize}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                          ⏳ Deadline: {h.deadline}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {h.description}
                    </p>

                    {/* Key Benefits List */}
                    {h.keyBenefits && h.keyBenefits.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Official Benefits:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {h.keyBenefits.map((b: string, i: number) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-black shrink-0">✓</span>
                              <span className="font-medium">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.tags?.map((t: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Footer with Official Redirection */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <IconShield size={14} className="text-emerald-500" />
                      <span>{h.verifiedDomain}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRedirectToOfficial(h)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Participate on Official Website</span>
                      <IconExternalLink size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-3xl block">🔍</span>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No hackathons found matching your query.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setDomainFilter("all");
                setModeFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* National Hackathon Preparation Advisory */}
        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              Beacon Advisory for Smart India Hackathon (SIH 2026) & National Challenges
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            For Smart India Hackathon (SIH 2026), your college must register via its official Single Point of Contact (SPOC). Under SIH national guidelines, each team consists of 6 student members with mandatory representation of at least one female engineer. Ensure your team projects in your Student Passport are up to date before submitting your college internal nomination.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
