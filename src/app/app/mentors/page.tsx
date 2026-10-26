"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconUsers,
  IconShield,
  IconCheckCircle,
  IconChevronRight,
  IconFileText,
  IconExternalLink,
  IconSparkles,
  IconCalendar,
  IconClock,
  IconBookOpen,
} from "@/components/icons/Icons";

export default function MentorsPage() {
  const [activeTab, setActiveTab] = useState<"mentors" | "masterclasses" | "council" | "articles">("mentors");
  const [mentors, setMentors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [masterclasses, setMasterclasses] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [councilApplications, setCouncilApplications] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal 1: Project Review Brief Modal
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [topic, setTopic] = useState("Architecture & Code Design Review");
  const [briefQuestion, setBriefQuestion] = useState("");
  const [artifactLink, setArtifactLink] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modal 2: 1-on-1 Office Hours Booking Modal
  const [bookingMentor, setBookingMentor] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("Wednesday, 6:00 PM - 6:30 PM IST");
  const [bookingTopic, setBookingTopic] = useState("System Design & Architecture Audit");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  // Modal 3: Article Reader Modal
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  // Modal 4: Masterclass RSVP State
  const [rsvpSubmittingId, setRsvpSubmittingId] = useState<string | null>(null);
  const [rsvpResult, setRsvpResult] = useState<{ title: string; meetingUrl: string } | null>(null);

  // Voting state
  const [votingId, setVotingId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [mentorRes, projectRes] = await Promise.all([
        fetch("/api/mentors"),
        fetch("/api/projects"),
      ]);

      if (mentorRes.ok) {
        const d = await mentorRes.json();
        setMentors(d.mentors || []);
        setRequests(d.requests || []);
        setMasterclasses(d.masterclasses || []);
        setArticles(d.articles || []);
        setCouncilApplications(d.councilApplications || []);
        setBookings(d.bookings || []);
      }

      if (projectRes.ok) {
        const pd = await projectRes.json();
        setUserProjects(pd.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBriefModal = (m: any) => {
    setSelectedMentor(m);
    setTopic("Architecture & Code Design Review");
    setBriefQuestion("");
    if (userProjects.length > 0) {
      setSelectedProjectId(userProjects[0].id);
      setArtifactLink(userProjects[0].repository_url || userProjects[0].live_url || "");
    } else {
      setSelectedProjectId("");
      setArtifactLink("");
    }
    setRequestSuccess(false);
  };

  const handleSendBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    if (!briefQuestion.trim()) {
      alert("Please provide a specific review question or technical brief for the mentor.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: selectedMentor.id,
          topic,
          studentBrief: briefQuestion.trim(),
          artifactLink: artifactLink.trim() || undefined,
        }),
      });

      if (res.ok) {
        setRequestSuccess(true);
        setTimeout(() => {
          setSelectedMentor(null);
          setRequestSuccess(false);
          loadData();
        }, 1500);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit brief.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookOfficeHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;
    setBookingSubmitting(true);

    try {
      const res = await fetch("/api/mentors/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: bookingMentor.id,
          slotTime: selectedSlot,
          topic: bookingTopic,
          notes: bookingNotes,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setBookingResult(d);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Booking failed.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleRsvpMasterclass = async (mcId: string) => {
    setRsvpSubmittingId(mcId);
    try {
      const res = await fetch("/api/mentors/masterclass/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterclassId: mcId }),
      });

      if (res.ok) {
        const d = await res.json();
        const mc = masterclasses.find((x) => x.id === mcId);
        setRsvpResult({
          title: mc?.title || "Masterclass",
          meetingUrl: d.meetingUrl || mc?.meeting_url || "https://meet.google.com/bcn-live",
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "RSVP failed.");
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setRsvpSubmittingId(null);
    }
  };

  const handleVoteCouncil = async (appId: string, vote: "for" | "against") => {
    setVotingId(appId);
    try {
      const res = await fetch("/api/mentors/council/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, vote }),
      });

      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Vote submission failed.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVotingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Hero Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Phase 3 Live • 10+ Year Verified Mentorship
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span>✓</span> Pro-Bono Pledge
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Senior Practitioner Mentorship & Council
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Connect directly with verified Staff SREs, ML Researchers, and Principal Architects from Razorpay, Microsoft, Uber, and Cred. Rigorous 10+ year experience vetting, peer council governance, and live masterclasses.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center shrink-0">
            <span className="block text-2xl font-black text-emerald-400">Zero Paywall</span>
            <span className="text-xs text-indigo-200">100% Free for Students</span>
          </div>
        </div>

        {/* Phase 3: 4-Tab Executive Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "mentors"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400"
            }`}
          >
            <IconUsers size={14} />
            <span>10+ Yr Mentors & Office Hours</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {mentors.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("masterclasses")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "masterclasses"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400"
            }`}
          >
            <IconCalendar size={14} />
            <span>Live Virtual Masterclasses</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
              {masterclasses.length} Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab("council")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "council"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400"
            }`}
          >
            <IconShield size={14} />
            <span>Mentor Council & Peer Vetting</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {councilApplications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "articles"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400"
            }`}
          >
            <IconBookOpen size={14} />
            <span>Architecture Teardowns & Guides</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {articles.length}
            </span>
          </button>
        </div>

        {/* TAB 1: 10+ YEAR VERIFIED MENTORS & OFFICE HOURS */}
        {activeTab === "mentors" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mentors.map((m) => (
                <div
                  key={m.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={m.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"}
                        alt={m.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-black text-slate-950 dark:text-white text-base truncate">{m.name}</h3>
                          <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full">
                            {m.experience_years || 10}+ Yrs
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">{m.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{m.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <IconShield size={13} className="text-emerald-600 shrink-0" />
                        <span>{m.verified_level || "10+ Yr Verified Council Fellow"}</span>
                      </div>
                      {m.linkedin_url && (
                        <a
                          href={m.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                          title="Verified LinkedIn"
                        >
                          <span>In</span>
                          <IconExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{m.bio}</p>

                    {/* Domains */}
                    <div className="flex flex-wrap gap-1.5">
                      {m.domains?.map((d: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">⚡ {m.availability}</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">{m.hourly_rate}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setBookingMentor(m);
                          setBookingResult(null);
                        }}
                        className="py-2.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <IconCalendar size={12} />
                        <span>Book 1-on-1</span>
                      </button>
                      <button
                        onClick={() => handleOpenBriefModal(m)}
                        className="py-2.5 px-2 rounded-xl bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1 border border-transparent dark:border-slate-700"
                      >
                        <span>Send Brief</span>
                        <IconChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirmed Office Hours Bookings Ledger */}
            {bookings.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Your Confirmed 1-on-1 Office Hours ({bookings.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Direct Google Meet sessions scheduled with verified senior mentors.
                    </p>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-3 py-1 rounded-full uppercase">
                    Calendar Confirmed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white">
                            {b.mentor_name} ({b.mentor_company})
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                            ✓ {b.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Topic: {b.topic}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Slot: {b.slot_time}</p>
                      </div>

                      {b.meeting_link && (
                        <a
                          href={b.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Join Google Meet Session</span>
                          <IconExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE VIRTUAL MASTERCLASSES */}
        {activeTab === "masterclasses" && (
          <div className="space-y-6">
            <div className="bg-indigo-950 text-white p-6 rounded-3xl border border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span>🔴 Live Virtual Stage</span>
                </div>
                <h2 className="text-xl font-black">Interactive Engineering Masterclasses</h2>
                <p className="text-xs text-indigo-200 max-w-xl">
                  Deep-dive architecture walkthroughs, kernel tracing, and live system design whiteboarding led by verified 10+ year veterans. Free interactive attendance for verified student passports.
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
                <span className="block text-xl font-black text-emerald-400">{masterclasses.length} Upcoming</span>
                <span className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Free Access</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {masterclasses.map((mc) => (
                <div
                  key={mc.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                        {mc.topic}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <IconClock size={12} />
                        <span>{mc.duration_minutes} min</span>
                      </span>
                    </div>

                    <h3 className="font-black text-slate-950 dark:text-white text-base leading-snug">
                      {mc.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {mc.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <img
                        src={mc.mentor_avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"}
                        alt={mc.mentor_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-950 dark:text-white">{mc.mentor_name}</h4>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{mc.mentor_company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>📅 {mc.scheduled_at?.slice(0, 10)}</span>
                      <span>👥 {mc.attendees_count} / {mc.max_capacity} Enrolled</span>
                    </div>

                    <button
                      onClick={() => handleRsvpMasterclass(mc.id)}
                      disabled={rsvpSubmittingId === mc.id}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>{rsvpSubmittingId === mc.id ? "Reserving Seat..." : "RSVP & Get Calendar Link"}</span>
                      <IconExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MENTOR COUNCIL & PEER VETTING */}
        {activeTab === "council" && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span>🏛️ Decentralized Governance</span>
                </div>
                <h2 className="text-xl font-black">Mentor Council Credential Verification Queue</h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Beacon maintains an uncompromising experience floor. Every candidate must possess ≥ 10 verified years in technology and receive at least 3 peer approvals from existing Council Fellows before mentorship privileges are activated.
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20 text-center shrink-0">
                <span className="block text-xl font-black text-amber-300">10-Year Floor</span>
                <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Peer-Audited</span>
              </div>
            </div>

            <div className="space-y-4">
              {councilApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-black text-slate-950 dark:text-white text-base">{app.name}</h3>
                      <span className="text-[11px] font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                        {app.experience_years} Years Experience (Since {app.career_start_year})
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        app.verification_status === "verified"
                          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                      }`}>
                        {app.verification_status === "verified" ? "✓ Council Approved" : "⏳ Peer Vetting in Progress"}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {app.title} @ <strong className="text-slate-900 dark:text-white">{app.company}</strong>
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      &ldquo;{app.bio}&rdquo;
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      {app.linkedin_url && (
                        <a
                          href={app.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>Verify LinkedIn Timeline</span>
                          <IconExternalLink size={11} />
                        </a>
                      )}
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-medium">Applied: {app.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shrink-0 space-y-2.5 w-full md:w-56">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block tracking-wider">
                        Council Votes
                      </span>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          +{app.council_votes_for} For
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-lg font-black text-rose-500">
                          -{app.council_votes_against} Against
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleVoteCouncil(app.id, "for")}
                        disabled={votingId === app.id}
                        className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVoteCouncil(app.id, "against")}
                        disabled={votingId === app.id}
                        className="py-1.5 px-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-800 dark:text-slate-200 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE TEARDOWNS & GUIDES */}
        {activeTab === "articles" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticle(art)}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                        {art.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{art.read_time}</span>
                    </div>

                    <h3 className="font-black text-slate-950 dark:text-white text-base leading-snug group-hover:text-indigo-600 transition-colors">
                      {art.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {art.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.tags?.map((t: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-950 dark:text-white block">{art.mentor_name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{art.mentor_title} • {art.mentor_company}</span>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                      Read ↗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: PROJECT REVIEW BRIEF MODAL */}
        {selectedMentor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-fade-in">
              <button
                onClick={() => setSelectedMentor(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-black text-sm w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={selectedMentor.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"}
                  alt={selectedMentor.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-black text-slate-950 dark:text-white text-base">Request Brief Review</h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedMentor.name} ({selectedMentor.title} @ {selectedMentor.company})
                  </p>
                </div>
              </div>

              {requestSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-black text-slate-950 dark:text-white text-base">Review Brief Dispatched!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Your project brief and artifact evidence have been delivered to {selectedMentor.name}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendBrief} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Review Topic / Focus Area
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Architecture & Code Design Review">Architecture & Code Design Review</option>
                      <option value="Database Indexing & Query Tuning">Database Indexing & Query Tuning</option>
                      <option value="System Scalability & Production Readiness">System Scalability & Production Readiness</option>
                      <option value="Machine Learning Inference & Latency">Machine Learning Inference & Latency</option>
                      <option value="Mock Technical Interview & Resume Feedback">Mock Technical Interview & Resume Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Attach Verified Project Artifact (Optional)
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        const p = userProjects.find((x) => x.id === e.target.value);
                        if (p) setArtifactLink(p.repository_url || p.live_url || "");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">-- None (General Architectural Question) --</option>
                      {userProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Artifact URL / Repository Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={artifactLink}
                      onChange={(e) => setArtifactLink(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Specific Problem / Question for Mentor *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="e.g. In my Go backend, under concurrent load of 500 connections, my SQLite database locks with SQLITE_BUSY. How do I transition to connection pool queues or WAL checkpointing?"
                      value={briefQuestion}
                      onChange={(e) => setBriefQuestion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl text-white bg-slate-950 dark:bg-indigo-600 hover:bg-slate-800 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Sending Brief..." : "Dispatch Project Review Brief"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL 2: 1-ON-1 OFFICE HOURS BOOKING MODAL */}
        {bookingMentor && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-fade-in">
              <button
                onClick={() => setBookingMentor(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-black text-sm w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={bookingMentor.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"}
                  alt={bookingMentor.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-black text-slate-950 dark:text-white text-base">Schedule 1-on-1 Office Hours</h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {bookingMentor.name} • {bookingMentor.company}
                  </p>
                </div>
              </div>

              {bookingResult ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 dark:text-white text-base">Office Hours Confirmed!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Calendar invite and private Google Meet link have been locked in.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-mono break-all text-indigo-700 dark:text-indigo-300">
                    {bookingResult.meetingLink}
                  </div>
                  <button
                    onClick={() => setBookingMentor(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-950 dark:bg-indigo-600 text-white font-bold text-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookOfficeHours} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Select Available 30-Minute Pro-Bono Slot
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Wednesday, 6:00 PM - 6:30 PM IST">Wednesday, 6:00 PM - 6:30 PM IST</option>
                      <option value="Thursday, 7:30 PM - 8:00 PM IST">Thursday, 7:30 PM - 8:00 PM IST</option>
                      <option value="Saturday, 11:00 AM - 11:30 AM IST">Saturday, 11:00 AM - 11:30 AM IST</option>
                      <option value="Sunday, 4:00 PM - 4:30 PM IST">Sunday, 4:00 PM - 4:30 PM IST</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Primary Session Agenda
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Consensus in Raft / Go Backend"
                      value={bookingTopic}
                      onChange={(e) => setBookingTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Session Prep Notes for Mentor
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share repository links or specific architectural blocks you want to deep-dive..."
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {bookingSubmitting ? "Locking In Calendar Slot..." : "Confirm 1-on-1 Office Hours"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL 3: ARTICLE READER MODAL */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-fade-in space-y-5">
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-black text-sm w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-2">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
                  <span>By <strong>{selectedArticle.mentor_name}</strong> ({selectedArticle.mentor_title} @ {selectedArticle.mentor_company})</span>
                  <span>•</span>
                  <span>{selectedArticle.read_time}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 italic text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                &ldquo;{selectedArticle.summary}&rdquo;
              </div>

              <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 font-normal">
                <p>{selectedArticle.content}</p>
                <p>
                  To deep-dive on these production patterns with <strong>{selectedArticle.mentor_name}</strong>, students can book 30-minute office hours or submit a project code brief directly through Beacon.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1">
                  {selectedArticle.tags?.map((t: string, idx: number) => (
                    <span key={idx} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-indigo-600 text-white font-bold text-xs"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RSVP CONFIRMATION MODAL */}
        {rsvpResult && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-black text-slate-950 dark:text-white text-base">Seat Reserved!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  You are registered for <strong>{rsvpResult.title}</strong>.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-mono break-all text-indigo-700 dark:text-indigo-300">
                {rsvpResult.meetingUrl}
              </div>
              <button
                onClick={() => setRsvpResult(null)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
