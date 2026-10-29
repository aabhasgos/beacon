"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconBookOpen,
  IconCheckCircle,
  IconSparkles,
  IconChevronRight,
  IconExternalLink,
  IconSearch,
  IconAward,
} from "@/components/icons/Icons";

interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  misconceptionExplanation: string;
}

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    topic: "Full-Stack & React Architecture",
    question: "When should you prefer React Server Components (RSC) over Client Components in modern Next.js?",
    options: [
      "Whenever you need browser event listeners like onClick or onChange.",
      "For secure direct database queries, backend secrets, and rendering heavy Markdown/HTML to keep JavaScript bundle size near zero.",
      "Only when using client-side React useState and useEffect hooks.",
      "Server components cannot be used with modern Next.js App Router.",
    ],
    correctIndex: 1,
    hints: [
      "Think about where data fetching happens without sending large npm packages to the browser.",
      "Client components are needed for interactivity, while Server Components run solely on the server.",
    ],
    misconceptionExplanation:
      "Client components are required for browser state and interactivity (onClick, useState), whereas Server Components excel at database queries and reducing JavaScript shipped to the user.",
  },
  {
    id: "q2",
    topic: "Generative AI & LLMs",
    question: "What is Retrieval-Augmented Generation (RAG) primarily used for in production applications?",
    options: [
      "To retrain foundation model weights from scratch every single week.",
      "To ground an LLM with external, private, or real-time documents at query time without expensive fine-tuning.",
      "To replace the tokenizer with a convolutional neural network.",
      "To compress images before sending them to an inference API.",
    ],
    correctIndex: 1,
    hints: [
      "Think about giving the model 'open book' access to private databases or student profile ledgers.",
      "RAG retrieves relevant chunks and injects them directly into the context window.",
    ],
    misconceptionExplanation:
      "RAG does not update the model's neural network weights; instead, it retrieves relevant context from a database and inserts it into the prompt so the LLM answers factually with zero hallucination.",
  },
  {
    id: "q3",
    topic: "Database Systems & ACID",
    question: "What does the 'I' (Isolation) in ACID transaction semantics guarantee during concurrent database operations?",
    options: [
      "That transactions are immediately written to flash storage without caching.",
      "That intermediate states of concurrent transactions are invisible to one another until committed.",
      "That foreign keys are automatically indexed by the query planner.",
      "That queries run strictly in alphabetical order of table names.",
    ],
    correctIndex: 1,
    hints: [
      "Think about two users modifying the same bank account balance at the exact same millisecond.",
      "Isolation prevents dirty reads, non-repeatable reads, and phantom reads.",
    ],
    misconceptionExplanation:
      "Isolation guarantees that concurrent execution of transactions leaves the database in the same state as if transactions had executed serially.",
  },
  {
    id: "q4",
    topic: "Distributed Systems & Raft",
    question: "In the Raft consensus algorithm, how does a candidate node become a recognized Leader?",
    options: [
      "By having the highest IP address in the cluster subnet.",
      "By receiving votes from a strict majority (quorum) of cluster nodes within an election timeout.",
      "By paying a gas fee on an Ethereum smart contract.",
      "By sending an HTTP 200 ping to the client router.",
    ],
    correctIndex: 1,
    hints: [
      "Think about how a 5-node cluster prevents split-brain situations with an odd quorum.",
      "A candidate must win votes from at least 3 out of 5 nodes.",
    ],
    misconceptionExplanation:
      "Raft relies on majority quorums (N/2 + 1) to guarantee that only one leader can be elected per term, avoiding split-brain partitions.",
  },
];

export default function AcademyAppPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"courses" | "diagnostic">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Quiz state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [badgeAwarded, setBadgeAwarded] = useState(false);

  useEffect(() => {
    async function loadCourses() {
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
    loadCourses();
  }, []);

  const currentQ = SAMPLE_QUIZ[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedOpt(idx);
  };

  const handleShowNextHint = () => {
    if (revealedHints < currentQ.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOpt === null) return;
    setSubmitted(true);
    if (selectedOpt === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx + 1 < SAMPLE_QUIZ.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setRevealedHints(0);
      setSubmitted(false);
    } else {
      setCompleted(true);
      const finalScore = score + (selectedOpt === currentQ.correctIndex ? 1 : 0);
      try {
        const res = await fetch("/api/academy/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: finalScore,
            totalQuestions: SAMPLE_QUIZ.length,
            topic: "Engineering Foundations & Systems",
          }),
        });
        if (res.ok) {
          setBadgeAwarded(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLaunchCourse = async (course: any) => {
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "course_explored",
          title: `Explored Course: ${course.title}`,
          description: `Provider: ${course.provider}. URL: ${course.url}`,
          metadata: { courseId: course.id, provider: course.provider },
        }),
      });
    } catch (e) {}
    window.open(course.url, "_blank", "noopener,noreferrer");
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills_covered?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      c.category?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Beacon Academy
              </span>
              <span className="text-[11px] font-bold text-slate-400">
                100% Free & Verified Certifications
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Curated Courses & Skill Diagnostics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              World-class coursework from Harvard, DeepLearning.AI, and Helsinki, paired with live diagnostic challenges that award verified <strong className="text-indigo-300">Assessed</strong> claims in your Student Passport.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl shrink-0 border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "courses"
                  ? "bg-white text-slate-950 dark:bg-slate-900 dark:text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Course Catalog ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab("diagnostic")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "diagnostic"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Skill Diagnostic
            </button>
          </div>
        </div>

        {/* Tab 1: Course Catalog */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col sm:flex-row gap-3 shadow-xs">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconSearch size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search courses by topic (e.g. Python, Raft, Full Stack, edX)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                {["all", "Computer Science", "Artificial Intelligence", "Full Stack", "Systems"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between gap-4 shadow-xs hover:border-indigo-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-full uppercase tracking-wider">
                        {c.category}
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        ★ {c.rating}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-950">{c.title}</h3>
                      <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                        Offered by {c.provider}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {c.description}
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700">
                      <strong className="text-slate-900 block font-bold mb-0.5">Skills Covered:</strong>
                      <span>{c.skills_covered}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {c.is_free ? "100% Free Courseware" : "Free Audit Available"}
                    </span>

                    <button
                      onClick={() => handleLaunchCourse(c)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Start Learning</span>
                      <IconExternalLink size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Skill Diagnostic */}
        {activeTab === "diagnostic" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {!completed ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase">
                      Question {currentIdx + 1} of {SAMPLE_QUIZ.length}
                    </span>
                    <span className="text-xs font-bold text-slate-600">{currentQ.topic}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Live Score: {score} Correct
                  </span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg sm:text-xl font-black text-slate-950 leading-snug">
                    {currentQ.question}
                  </h2>

                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, i) => {
                      const isSelected = selectedOpt === i;
                      const isCorrect = i === currentQ.correctIndex;

                      let btnStyle = "bg-white border-slate-200 text-slate-800 hover:border-indigo-300";
                      if (submitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-red-50 border-red-500 text-red-950";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-50 border-indigo-600 text-indigo-950 font-bold";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectOption(i)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-start gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="pt-0.5 leading-relaxed">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Graduated Hints */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Graduated Hints ({revealedHints}/{currentQ.hints.length})</span>
                    </span>
                    {!submitted && revealedHints < currentQ.hints.length && (
                      <button
                        onClick={handleShowNextHint}
                        className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                      >
                        Unlock Hint {revealedHints + 1}
                      </button>
                    )}
                  </div>
                  {revealedHints > 0 && (
                    <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200">
                      {currentQ.hints[revealedHints - 1]}
                    </p>
                  )}
                </div>

                {/* Explanation */}
                {submitted && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                    <span className="font-black block text-sm">
                      {selectedOpt === currentQ.correctIndex ? "✓ Correct Analysis!" : "Engineering Context:"}
                    </span>
                    <p className="leading-relaxed">{currentQ.misconceptionExplanation}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Results feed verified skill claims to your Student Passport.
                  </span>

                  {!submitted ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedOpt === null}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs sm:text-sm cursor-pointer shadow-xs"
                    >
                      {currentIdx + 1 < SAMPLE_QUIZ.length ? "Next Challenge →" : "Finish & View Passport"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-10 space-y-5 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <IconAward size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950">Diagnostic Completed!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    You scored <strong className="text-slate-950">{score} / {SAMPLE_QUIZ.length}</strong> ({Math.round((score / SAMPLE_QUIZ.length) * 100)}%).
                  </p>
                </div>

                {badgeAwarded && (
                  <div className="max-w-md mx-auto p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
                    <IconCheckCircle size={16} className="text-emerald-600" />
                    <span>Official <strong className="font-black">Assessed</strong> badge has been awarded to your Student Passport!</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setCurrentIdx(0);
                      setSelectedOpt(null);
                      setRevealedHints(0);
                      setSubmitted(false);
                      setScore(0);
                      setCompleted(false);
                      setBadgeAwarded(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                  >
                    Retake Diagnostic
                  </button>

                  <Link
                    href="/app/passport"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <span>View In Student Passport</span>
                    <IconChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
