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
  IconTarget,
  IconClock,
  IconUsers,
  IconBuilding,
  IconShield,
} from "@/components/icons/Icons";

// Curated live ecosystem items tailored for addictive high-signal engineering browsing
const ECOSYSTEM_STREAM_ITEMS = [
  {
    id: "eco_sih_2026",
    channel: "hackathon",
    channelLabel: "National Hackathon",
    title: "Smart India Hackathon (SIH 2026) — Central Ministry Problem Statements Released",
    organizer: "Ministry of Education & AICTE",
    organizerMonogram: "SIH",
    organizerType: "Central Government",
    badge: "Official Central SIH",
    timestamp: "2 hours ago",
    highlightText: "₹1,00,000 per problem statement across 52 central ministry statements in AI, Defense, and Smart Mobility.",
    description: "National engineering challenge sponsored by Government of India. Teams of 6 students solve mission-critical problems for Indian Railways, ISRO, and DRDO. Requires college internal SPOC nomination.",
    tags: ["SIH 2026", "AI & Robotics", "Central Gov", "GovTech", "Python"],
    stipendOrPrize: "₹1,00,000 / Problem Pool",
    eligibility: "B.Tech / MCA / Dual Degree Students Across India",
    primaryActionLabel: "Explore SIH in Hackathons Hub",
    primaryActionHref: "/app/hackathons",
    externalUrl: "https://sih.gov.in",
    stats: { likes: 342, bookmarks: 128 },
    verifiedProof: true,
  },
  {
    id: "eco_razorpay_sde",
    channel: "job",
    channelLabel: "Verified Tech Job",
    title: "Razorpay Core Payments Platform — Backend Engineering Intern (Summer 2026)",
    organizer: "Razorpay Software Private Limited",
    organizerMonogram: "RZP",
    organizerType: "Fintech Leader",
    badge: "Verified Recruiter Posting",
    timestamp: "4 hours ago",
    highlightText: "₹1,20,000/month stipend + Fast-track Pre-Placement Offer (PPO: ₹28L - ₹34L CTC).",
    description: "Work directly on high-throughput payment transaction pipelines handling >2,500 requests/sec. Focus on idempotent API semantics, distributed Redis locks, and ACID guarantees. Evaluates student code invariants directly from Beacon Passport.",
    tags: ["Fintech", "Go / Golang", "Redis", "Distributed Systems", "SQL"],
    stipendOrPrize: "₹1,20,000 / month",
    eligibility: "Class of 2026 & 2027 Engineering Students",
    primaryActionLabel: "Review & Apply with Passport",
    primaryActionHref: "/app/opportunities",
    externalUrl: "https://razorpay.com/jobs",
    stats: { likes: 519, bookmarks: 264 },
    verifiedProof: true,
  },
  {
    id: "eco_flipkart_grid",
    channel: "hackathon",
    channelLabel: "National Hackathon",
    title: "Flipkart GRiD 7.0 — Software Development Challenge & Direct SDE Interview Track",
    organizer: "Flipkart India",
    organizerMonogram: "FK",
    organizerType: "Enterprise Tech",
    badge: "Direct PPO Fast-Track",
    timestamp: "6 hours ago",
    highlightText: "₹1.5 Crore Prize Pool + Direct Interview Opportunities for SDE-1 (₹32L CTC).",
    description: "National flagship technology competition for engineering students across India. Features multi-level algorithmic, system design, and real-time stress testing tracks simulating Big Billion Days scale.",
    tags: ["Flipkart GRiD", "Algorithms", "PPO Track", "System Design", "Microservices"],
    stipendOrPrize: "₹1,50,00,000 Total Pool",
    eligibility: "Undergraduate & Postgraduate Tech Students",
    primaryActionLabel: "Inspect in Hackathons Hub",
    primaryActionHref: "/app/hackathons",
    externalUrl: "https://unstop.com/hackathons/flipkart-grid-70",
    stats: { likes: 488, bookmarks: 195 },
    verifiedProof: true,
  },
  {
    id: "eco_proof_bu_lab",
    channel: "peer-proof",
    channelLabel: "Peer Proof of Work",
    title: "Real-Time 3D Point Cloud Computer Vision Pipeline & INT8 Quantization",
    organizer: "Bennett University Computational Intelligence Lab",
    organizerMonogram: "BU",
    organizerType: "Research Lab",
    badge: "Beacon Rubric: 94 / 100",
    timestamp: "8 hours ago",
    highlightText: "Sub-45ms latency inference pipeline validated on low-power edge telemetry streams.",
    description: "Verified engineering milestone published to Beacon Ledger. Implements binary frame sync, ONNX runtime export, and 62% model footprint reduction with zero loss in bounding box precision. Audited by Beacon AI Code Analyzer.",
    tags: ["Computer Vision", "PyTorch", "ONNX", "OpenCV", "Research"],
    stipendOrPrize: "Beacon Verified Artifact",
    eligibility: "Open Source Code Benchmark Available",
    primaryActionLabel: "Inspect Rubric in Passport",
    primaryActionHref: "/app/passport",
    externalUrl: "",
    stats: { likes: 215, bookmarks: 89 },
    verifiedProof: true,
  },
  {
    id: "eco_google_step",
    channel: "job",
    channelLabel: "Verified Tech Job",
    title: "Google India — STEP Software Engineering Internship Program (Summer 2026)",
    organizer: "Google India Private Limited",
    organizerMonogram: "GOOG",
    organizerType: "Big Tech",
    badge: "Global Tech Fellowship",
    timestamp: "12 hours ago",
    highlightText: "₹1,15,000/month stipend + comprehensive corporate housing and mentorship.",
    description: "Development internship program designed for 2nd and 3rd-year undergraduate students. Combines hands-on software engineering with technical development and direct mentorship from Google senior engineers.",
    tags: ["Google India", "Data Structures", "C++", "Java", "Python"],
    stipendOrPrize: "₹1,15,000 / month",
    eligibility: "2nd / 3rd Year B.Tech / B.E. Computer Science",
    primaryActionLabel: "Apply with Audited Passport",
    primaryActionHref: "/app/opportunities",
    externalUrl: "https://careers.google.com/students",
    stats: { likes: 672, bookmarks: 390 },
    verifiedProof: true,
  },
  {
    id: "eco_proof_campusone",
    channel: "peer-proof",
    channelLabel: "Peer Proof of Work",
    title: "CampusOne — Integrated Higher Education ERP & Cryptographic Ledger Mesh",
    organizer: "Full-Stack Architecture Showcase",
    organizerMonogram: "C1",
    organizerType: "Production System",
    badge: "Beacon Rubric: 92 / 100",
    timestamp: "1 day ago",
    highlightText: "Production multi-tier web application benchmarked to 1,500 req/sec peak concurrency.",
    description: "Engineered with Next.js 14 App Router, SQLite/PostgreSQL transactional isolation, and role-based access control (RBAC). Validated on Beacon cryptographic proof ledger.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "RBAC", "Docker"],
    stipendOrPrize: "Beacon Verified Artifact",
    eligibility: "GitHub Repository Audited",
    primaryActionLabel: "Inspect Project Proof",
    primaryActionHref: "/app/projects",
    externalUrl: "https://github.com/aabhasgos/campusone",
    stats: { likes: 198, bookmarks: 76 },
    verifiedProof: true,
  },
  {
    id: "eco_isro_sac",
    channel: "job",
    channelLabel: "Verified Tech Job",
    title: "ISRO Space Applications Centre (SAC) — Satellite Telemetry Data Systems Research",
    organizer: "Indian Space Research Organisation (ISRO)",
    organizerMonogram: "ISRO",
    organizerType: "Central Government",
    badge: "Government Research Fellowship",
    timestamp: "1 day ago",
    highlightText: "₹45,000/month government research grant + ISRO Scientist Mentorship.",
    description: "Opportunity to contribute to real satellite ground station telemetry decoding, CCSDS packet demuxing, and orbital sensor data pipelines at SAC Ahmedabad.",
    tags: ["ISRO", "Satellite Telemetry", "C / C++", "Binary Buffers", "Aerospace"],
    stipendOrPrize: "₹45,000 / month",
    eligibility: "Pre-final / Final Year Tech & Research Scholars",
    primaryActionLabel: "Review & Apply",
    primaryActionHref: "/app/opportunities",
    externalUrl: "https://www.sac.gov.in",
    stats: { likes: 410, bookmarks: 188 },
    verifiedProof: true,
  },
  {
    id: "eco_mentor_masterclass",
    channel: "mentor",
    channelLabel: "Mentor Council Masterclass",
    title: "Engineering Masterclass: How to Design Low-Latency Systems & Crack FAANG Interviews",
    organizer: "Senior Staff Engineer (14+ Yrs Ex-Google & Uber)",
    organizerMonogram: "SMC",
    organizerType: "Senior Mentor Council",
    badge: "100% Pro-Bono Session",
    timestamp: "2 days ago",
    highlightText: "Live architectural breakdown of concurrent lock contention, Raft consensus, and resume rubrics.",
    description: "Interactive Saturday workshop organized by Beacon Senior Mentor Council. Includes live code review of student passports and direct Q&A for tier-2/3 college candidates.",
    tags: ["Masterclass", "System Design", "Staff Engineer", "Zero Fee", "Live AMA"],
    stipendOrPrize: "Zero Fee Pro-Bono Access",
    eligibility: "Verified Beacon Students",
    primaryActionLabel: "RSVP in Mentors Hub",
    primaryActionHref: "/app/mentors",
    externalUrl: "",
    stats: { likes: 312, bookmarks: 145 },
    verifiedProof: true,
  },
];

const TICKER_HEADLINES = [
  "Smart India Hackathon (SIH 2026) central problem statements published across 52 central ministries",
  "Razorpay opens 2026 Core Payments SDE Internships with ₹1.2L/month compensation",
  "Flipkart GRiD 7.0 registers over 40,000 engineers with direct PPO interview tracks",
  "Bennett University Computational Intelligence Lab verifies 3D point cloud computer vision benchmark",
  "Google India STEP Software Engineering Program applications closing this month",
  "ISRO Space Applications Centre opens satellite telemetry research fellowships",
];

export default function StudentAppTodayPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<string>("all");
  const [tickerIndex, setTickerIndex] = useState(0);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [shareToast, setShareToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const profRes = await fetch("/api/profile");
        if (profRes.ok) {
          const d = await profRes.json();
          setProfileData(d);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();

    // Initialize likes counts
    const counts: Record<string, number> = {};
    ECOSYSTEM_STREAM_ITEMS.forEach((it) => {
      counts[it.id] = it.stats.likes;
    });
    setLikesCount(counts);

    // Headline ticker rotation
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_HEADLINES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const isCurrentlyLiked = prev[id];
      setLikesCount((prevCounts) => ({
        ...prevCounts,
        [id]: (prevCounts[id] || 0) + (isCurrentlyLiked ? -1 : 1),
      }));
      return { ...prev, [id]: !isCurrentlyLiked };
    });
  };

  const toggleSave = (id: string) => {
    setSavedItems((prev) => {
      const isSaved = !prev[id];
      if (isSaved) {
        setShareToast("Item saved to your reading list ✓");
        setTimeout(() => setShareToast(null), 2500);
      }
      return { ...prev, [id]: isSaved };
    });
  };

  const handleShare = (title: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/app?item=${encodeURIComponent(title)}`);
    setShareToast("Link copied to clipboard ✓");
    setTimeout(() => setShareToast(null), 2500);
  };

  const user = profileData?.user;

  const filteredItems = ECOSYSTEM_STREAM_ITEMS.filter((item) => {
    if (activeChannel === "all") return true;
    if (activeChannel === "hackathons") return item.channel === "hackathon";
    if (activeChannel === "jobs") return item.channel === "job";
    if (activeChannel === "proof") return item.channel === "peer-proof";
    if (activeChannel === "mentors") return item.channel === "mentor";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        {/* Toast Notification */}
        {shareToast && (
          <div className="fixed top-20 right-6 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{shareToast}</span>
          </div>
        )}

        {/* Live Ecosystem Telemetry Pulse Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Pulse</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
              Ecosystem Wire:
            </span>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-xs text-slate-300 font-medium truncate animate-in fade-in transition-all">
              {TICKER_HEADLINES[tickerIndex]}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400 font-medium">
            <span className="hidden lg:inline">Updated Real-Time</span>
            <Link
              href="/app/hackathons"
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              All India Challenges →
            </Link>
          </div>
        </div>

        {/* Executive Greeting & Student Cockpit Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                Engineering Talent OS
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {user?.college || "Undergraduate Engineering"}
              </span>
              {user?.cgpa && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  CGPA: {user.cgpa} / 10
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Welcome back, {user?.full_name || "Engineer"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Explore live verified technical opportunities, national innovation competitions, peer-reviewed engineering artifacts, and direct recruiter pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/app/passport"
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <IconAward size={15} />
              <span>Student Passport</span>
            </Link>

            <Link
              href="/app/roadmap"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <IconTarget size={15} />
              <span>Interactive Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Channel Navigation Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Ecosystem Highlights" },
              { id: "hackathons", label: "National Hackathons & SIH" },
              { id: "jobs", label: "Verified SDE & Tech Roles" },
              { id: "proof", label: "Peer Proof & Artifacts" },
              { id: "mentors", label: "Senior Mentor Masterclasses" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveChannel(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeChannel === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredItems.length} curated engineering entries
          </span>
        </div>

        {/* Main Layout: Feed on Left (2/3), Sticky Radar Rail on Right (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-4">
            {filteredItems.map((item) => {
              const isLiked = likedItems[item.id];
              const isSaved = savedItems[item.id];
              const currentLikes = likesCount[item.id] || item.stats.likes;

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4 group"
                >
                  {/* Entity Header Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-black text-xs flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
                        {item.organizerMonogram}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs sm:text-sm font-black text-slate-950 truncate">
                            {item.organizer}
                          </strong>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            • {item.organizerType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.2 rounded-md">
                            {item.channelLabel}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  </div>

                  {/* Post Title & Highlight Banner */}
                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h2>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                        <span>{item.highlightText}</span>
                      </div>
                      <span className="text-emerald-700 font-black font-mono shrink-0 text-xs">
                        {item.stipendOrPrize}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* Technical Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Bar & Social Engagement */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      {/* Like / Upvote Button */}
                      <button
                        type="button"
                        onClick={() => toggleLike(item.id)}
                        className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isLiked
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>{isLiked ? "♥" : "♡"}</span>
                        <span>{currentLikes}</span>
                      </button>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => toggleSave(item.id)}
                        className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSaved
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span>{isSaved ? "Saved ✓" : "Save"}</span>
                      </button>

                      {/* Share Link Button */}
                      <button
                        type="button"
                        onClick={() => handleShare(item.title)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold transition-all cursor-pointer"
                        title="Copy link to clipboard"
                      >
                        Share
                      </button>
                    </div>

                    {/* Primary Link CTA */}
                    <Link
                      href={item.primaryActionHref}
                      className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{item.primaryActionLabel}</span>
                      <IconChevronRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}

            {/* Bottom Feed Milestone */}
            <div className="text-center py-6 bg-slate-100 rounded-3xl border border-slate-200 text-xs text-slate-500 font-medium space-y-1">
              <span className="font-bold text-slate-700 block">End of Current Live Wire</span>
              <p>All national hackathons, verified jobs, and peer proof streams are up to date.</p>
            </div>
          </div>

          {/* Sticky Radar & Retention Rail */}
          <div className="space-y-5 lg:sticky lg:top-20">
            {/* Widget 1: Weekly Recruiter Focus Invariants */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <h3 className="font-black text-sm text-slate-950 tracking-tight">
                    Weekly Focus Invariants
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Technical Depth
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Core engineering concepts actively tested by hiring committees at top tech firms this week:
              </p>

              <div className="space-y-2">
                {[
                  {
                    title: "Binary Search Boundary Invariants & O(log N)",
                    type: "Algorithmic Precision",
                    company: "Google / Amazon",
                  },
                  {
                    title: "Idempotent REST APIs & Redis SETNX",
                    type: "Distributed Systems",
                    company: "Razorpay / Stripe",
                  },
                  {
                    title: "CCSDS Binary Frame Sync & CRC-32",
                    type: "Telemetry Engineering",
                    company: "ISRO / Aerospace",
                  },
                ].map((inv, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                        {inv.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{inv.company}</span>
                    </div>
                    <strong className="text-slate-900 font-bold block">{inv.title}</strong>
                    <Link
                      href="/app/roadmap"
                      className="text-[11px] font-bold text-indigo-600 hover:underline inline-block pt-0.5"
                    >
                      Solve in Interactive Workbench →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: National Hackathon Countdown Badges */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="font-black text-sm text-slate-950 tracking-tight">
                    National Challenge Deadlines
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  All-India
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    title: "Smart India Hackathon (SIH 2026)",
                    daysLeft: "12 Days Left",
                    subtext: "SPOC College Internal Nomination Floor",
                    href: "/app/hackathons",
                  },
                  {
                    title: "Flipkart GRiD 7.0 Software Challenge",
                    daysLeft: "18 Days Left",
                    subtext: "Level 1 E-Commerce Algorithmic Quiz",
                    href: "/app/hackathons",
                  },
                  {
                    title: "Google Solution Challenge 2026",
                    daysLeft: "24 Days Left",
                    subtext: "UN SDG Innovation Demo Submission",
                    href: "/app/hackathons",
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 block transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-950 font-bold text-xs group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </strong>
                      <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                        {item.daysLeft}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {item.subtext}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Widget 3: Verified Recruiter Activity Ticker */}
            <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-md space-y-2.5">
              <div className="flex items-center gap-2">
                <IconShield size={16} className="text-indigo-400" />
                <h3 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                  Recruiter Audit Telemetry
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                3 corporate technical recruiters from Razorpay and Google viewed audited engineering profiles in your university today.
              </p>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-slate-300 space-y-1 font-medium">
                <span className="text-emerald-400 font-bold block">Verified Insight:</span>
                <span>Students with artifact-backed GitHub rubrics (&gt;85/100) receive 3.4x faster technical interview passes.</span>
              </div>

              <Link
                href="/app/passport"
                className="w-full mt-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Audit My Passport Proof →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
