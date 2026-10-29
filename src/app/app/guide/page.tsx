"use client";

import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconCompass,
  IconSparkles,
} from "@/components/icons/Icons";

interface Message {
  role: "user" | "assistant";
  content: string;
  source?: string;
  time?: string;
}

// Parses inline bolding **text**, markdown links [title](url), and inline code `code`
function renderFormattedInline(str: string): React.ReactNode {
  const regex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*|`.*?`)/g;
  const parts = str.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        // Link: [title](url)
        const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
        if (linkMatch) {
          return (
            <a
              key={i}
              href={linkMatch[2]}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline inline-flex items-center gap-1 cursor-pointer bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <span>{linkMatch[1]}</span>
              <span className="text-[10px]">↗</span>
            </a>
          );
        }

        // Bold: **text**
        if (part.startsWith("**") && part.endsWith("**")) {
          const inner = part.slice(2, -2);
          return (
            <strong key={i} className="font-black text-slate-950 dark:text-white">
              {inner}
            </strong>
          );
        }

        // Code: `code`
        if (part.startsWith("`") && part.endsWith("`")) {
          const inner = part.slice(1, -1);
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] border border-slate-200 dark:border-slate-700"
            >
              {inner}
            </code>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Clean, Friendly Formatter that eliminates raw hashtags, pipes, and renders gorgeous typography
function FormattedMessage({ text }: { text: string }) {
  const sanitized = text
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/?[^>]+(>|$)/g, "");

  const lines = sanitized.split("\n");

  return (
    <div className="space-y-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Filter out raw markdown table borders like |---|---|
        if (/^\|[-|\s]+\|$/.test(trimmed) || trimmed === "|---|") {
          return null;
        }

        // Clean pipe table row
        if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
          const cells = trimmed
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean);
          return (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 my-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {cells.map((cell, cIdx) => (
                <div key={cIdx} className="truncate">
                  {renderFormattedInline(cell)}
                </div>
              ))}
            </div>
          );
        }

        // Heading with hashtags: ### Heading or ## Heading or # Heading
        if (/^#{1,4}\s+/.test(trimmed)) {
          const cleanHeading = trimmed.replace(/^#{1,4}\s+/, "");
          return (
            <div key={idx} className="pt-2 pb-1">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white flex items-center gap-1.5">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">●</span>
                <span>{renderFormattedInline(cleanHeading)}</span>
              </h4>
            </div>
          );
        }

        // Numbered list item: 1. **Title**
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const rest = numMatch[2];
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-3.5 my-1.5 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-2xs"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {num}
              </span>
              <div className="flex-1 font-medium text-slate-900 dark:text-slate-100 leading-snug">
                {renderFormattedInline(rest)}
              </div>
            </div>
          );
        }

        // Bullet point: - item or * item
        if (/^[-*•]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 shrink-0" />
              <div className="flex-1 text-slate-800 dark:text-slate-200 font-medium">
                {renderFormattedInline(bulletText)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function GuidePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Beacon AI, your personal career intelligence advisor.\n\nI have your verified Student Vault loaded with your university record and skills matrix. Ask me to suggest top courses, audit your vault, review your resume, or guide your internship applications!",
      source: "beacon_ai",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Personalized Greeting
  useEffect(() => {
    async function initUserGreeting() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const d = await res.json();
          const u = d.user;
          const skills = d.skills || [];
          if (u?.full_name) {
            const firstName = u.full_name.split(" ")[0];
            const college = u.college ? ` at ${u.college}` : "";
            const skillsSummary = skills.length > 0 ? ` (${skills.length} verified technical skills loaded in your Vault)` : "";

            setMessages([
              {
                role: "assistant",
                content: `Welcome, ${firstName}. I'm Beacon AI, your personal career intelligence advisor.

Here is a verified snapshot of your active record:
- **Academic Standing:** ${u.degree || "B.Tech Computer Science"}${college}
- **Student Vault:** ${skillsSummary || "Profile loaded"} • Primary Resume Attached
- **Platform Radar:** Live connections to Razorpay, ISRO, Google, and Smart India Hackathon

**How can I assist you right now? Ask me anything:**
- *"Suggest top free Full-Stack Web Dev courses"*
- *"What are the best free courses for Generative AI & LLMs?"*
- *"Audit my student vault and verified skills"*
- *"How should I tailor my resume for Razorpay or ISRO?"*`,
                source: "beacon_ai",
                time: "Just now",
              },
            ]);
          }
        }
      } catch (e) {
        // keep fallback
      }
    }
    initUserGreeting();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text, time: "Now" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            source: data.source,
            time: "Now",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I apologize, but I had trouble reaching the AI engine. Please ask your question again, and I'll gladly help!",
            time: "Now",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-xs">
        {/* Companion Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base leading-none">Beacon AI Career Coach</h2>
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Tailored Course Recommendations • Verified Opportunities • Personalized Roadmaps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Beacon AI Engine • Active</span>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg, idx) => {
            const isMe = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-2xl ${isMe ? "ml-auto justify-end" : "mr-auto"}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-1">
                    ✨
                  </div>
                )}

                <div
                  className={`p-4 sm:p-5 rounded-2xl shadow-xs ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none font-medium text-xs sm:text-sm"
                      : "bg-white dark:bg-slate-900 rounded-bl-none border border-slate-200 dark:border-slate-800 shadow-2xs"
                  }`}
                >
                  {isMe ? (
                    <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
                  ) : (
                    <FormattedMessage text={msg.content} />
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                ✨
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-700 dark:text-slate-200 font-bold flex items-center gap-2 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" />
                <span>Beacon AI is analyzing your Vault and retrieving recommendations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Pills */}
        <div className="bg-white dark:bg-slate-900 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0">Quick Questions:</span>
          {[
            "Suggest top free Full-Stack Web Dev courses",
            "What are the best free courses for Generative AI & LLMs?",
            "Audit my student vault and verified skills",
            "How do I prepare my resume for ISRO SAC internship?",
            "How do I tailor my profile for Razorpay internship?",
            "What are the requirements for Smart India Hackathon?",
          ].map((pill, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(pill)}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap transition-colors shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Beacon AI: 'Suggest courses for Python', 'Audit my vault', 'Review my internship plan'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
