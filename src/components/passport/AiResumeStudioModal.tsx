"use client";

import React, { useState, useEffect } from "react";
import { IconSparkles, IconCheckCircle } from "@/components/icons/Icons";

interface AiResumeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: any;
  skills: any[];
  projects: any[];
  certificates: any[];
  experiences: any[];
}

export function AiResumeStudioModal({
  isOpen,
  onClose,
  user,
  profile,
  skills,
  projects,
  certificates,
  experiences,
}: AiResumeStudioModalProps) {
  const [targetRole, setTargetRole] = useState("Full-Stack Software Engineer & AI Systems Researcher");
  const [customPrompt, setCustomPrompt] = useState("");
  const [resumeStyle, setResumeStyle] = useState<"executive" | "tech">("executive");
  const [synthesizing, setSynthesizing] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Resume Model State
  const [resumeData, setResumeData] = useState<any>(null);

  // Section visibility toggles
  const [showSummary, setShowSummary] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showExperiences, setShowExperiences] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showCertificates, setShowCertificates] = useState(true);

  // Initial synthesis when modal opens
  useEffect(() => {
    if (isOpen && !resumeData) {
      handleSynthesizeResume();
    }
  }, [isOpen]);

  const handleSynthesizeResume = async (promptOverride?: string) => {
    setSynthesizing(true);
    try {
      const res = await fetch("/api/resumes/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          customPrompt: promptOverride !== undefined ? promptOverride : customPrompt,
          style: resumeStyle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.resumeData) {
          setResumeData(data.resumeData);
        }
      }
    } catch (err) {
      console.error("Synthesis failed:", err);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleCopyPlainText = () => {
    if (!resumeData) return;
    const lines = [
      `# ${resumeData.fullName.toUpperCase()}`,
      `${resumeData.headline}`,
      `${resumeData.contact.email} | ${resumeData.contact.location} | ${resumeData.contact.linkedinUrl} | ${resumeData.contact.githubUrl}`,
      "",
      "## PROFESSIONAL SUMMARY",
      resumeData.summary,
      "",
      "## EDUCATION",
      ...resumeData.education.map(
        (e: any) =>
          `* ${e.degree} — ${e.college} (Graduation: ${e.graduationYear}, CGPA: ${e.cgpa}/10)\n  ${e.honors || ""}`
      ),
      "",
      "## WORK EXPERIENCE & INTERNSHIPS",
      ...resumeData.experiences.map(
        (exp: any) =>
          `* ${exp.title} — ${exp.company} (${exp.period})\n` +
          exp.bullets.map((b: string) => `  - ${b}`).join("\n")
      ),
      "",
      "## VERIFIABLE PROOF OF WORK & PROJECTS",
      ...resumeData.projects.map(
        (p: any) =>
          `* ${p.title} (${p.category}) [Rubric: ${p.rubricScore}/100]\n` +
          p.bullets.map((b: string) => `  - ${b}`).join("\n")
      ),
      "",
      "## TECHNICAL SKILLS",
      ...Object.entries(resumeData.skillsCategorized || {}).map(
        ([cat, sks]: any) => `* ${cat}: ${Array.isArray(sks) ? sks.join(", ") : ""}`
      ),
      "",
      "## VERIFIED CERTIFICATIONS",
      ...resumeData.certifications.map(
        (c: any) => `* ${c.title} — ${c.issuer} (${c.issueDate || "Verified"}) [ID: ${c.credentialId}]`
      ),
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Dedicated Print Stylesheet: Isolates ONLY the A4 resume sheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #beacon-printable-cv,
          #beacon-printable-cv * {
            visibility: visible !important;
          }
          #beacon-printable-cv {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 16mm 20mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: #0f172a !important;
            z-index: 999999 !important;
            page-break-after: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-7xl w-full h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in duration-150">
        {/* Studio Top Navigation Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <IconSparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Beacon AI Executive Resume Studio
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  ATS Verified • A4 PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounds your verified projects, internships, and NLP skills into an executive-grade resume.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyPlainText}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copiedText ? (
                <>
                  <IconCheckCircle size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy ATS Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Export / Print Clean PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Studio Body: Dual-Pane Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Controls & AI Customizer Pane */}
          <div className="w-full lg:w-[400px] bg-slate-950/70 border-r border-slate-800 p-5 space-y-5 overflow-y-auto shrink-0">
            {/* Target Role & Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Target Role / Milestone Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full-Stack Engineer, AI Systems Researcher"
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-medium focus:outline-none"
              />
            </div>

            {/* Custom AI Prompt (ChatGPT-Grade Vast Resume Prompting) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <IconSparkles size={13} className="text-indigo-400" />
                  <span>AI Prompt & Instructions</span>
                </label>
                <span className="text-[10px] text-slate-500">ChatGPT-Grade Synthesizer</span>
              </div>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Tell AI what to highlight, emphasize, or add (e.g. 'Build a vast, detailed resume emphasizing Bennett AI Lab and CampusOne project with quantifiable impact metrics')..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed"
              />

              {/* Quick Prompt Pill Shortcuts */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleSynthesizeResume(
                      "Elevate all bullet points with strict STAR method, adding quantifiable metrics like latency reduction and throughput scale."
                    )
                  }
                  className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  ⚡ Elevate STAR Metrics
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSynthesizeResume(
                      "Make this a vast, comprehensive executive CV tailored for top tier technology firms (Google, Razorpay, Amazon)."
                    )
                  }
                  className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  🏢 Vast Tier-1 Tech CV
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSynthesizeResume(
                      "Synthesize full computer vision research and full-stack systems engineering depth even if baseline record is concise."
                    )
                  }
                  className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md transition-colors cursor-pointer"
                >
                  🧠 Deep AI / ML Focus
                </button>
              </div>

              {/* Synthesize Action Button */}
              <button
                type="button"
                onClick={() => handleSynthesizeResume()}
                disabled={synthesizing}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <IconSparkles size={15} />
                <span>{synthesizing ? "AI Synthesizing Vast Resume..." : "✨ AI Synthesize & Build Vast Resume"}</span>
              </button>
            </div>

            {/* Typography & Template Style */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">Resume Typography Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResumeStyle("executive")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    resumeStyle === "executive"
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  Ivy League Classic
                </button>
                <button
                  type="button"
                  onClick={() => setResumeStyle("tech")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    resumeStyle === "tech"
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  Tech Specialist Modern
                </button>
              </div>
            </div>

            {/* Section Visibility Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 block">Sections Included in PDF</label>
              <div className="space-y-1.5 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showSummary}
                    onChange={(e) => setShowSummary(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Professional Executive Summary</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showEducation}
                    onChange={(e) => setShowEducation(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Education & Academic Honors</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showExperiences}
                    onChange={(e) => setShowExperiences(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Work Experience & Internships ({resumeData?.experiences?.length || experiences?.length || 0})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showProjects}
                    onChange={(e) => setShowProjects(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Verifiable Proof of Work & Projects ({resumeData?.projects?.length || projects?.length || 0})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showSkills}
                    onChange={(e) => setShowSkills(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Categorized Technical Competencies Matrix</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showCertificates}
                    onChange={(e) => setShowCertificates(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Verified Certifications & Credentials</span>
                </label>
              </div>
            </div>

            {/* ATS Optimization Diagnostic Banner */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/50 rounded-2xl space-y-1 text-xs text-indigo-200">
              <strong className="block text-indigo-300 font-bold">✓ 100% ATS-Parsable Layout</strong>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Standard single-column flow with UTF-8 character encoding, semantic header tags, and quantified STAR action verbs.
              </p>
            </div>
          </div>

          {/* Right Preview Pane: Authentic A4 Paper Sheet Preview */}
          <div className="flex-1 bg-slate-900/90 p-4 sm:p-8 overflow-y-auto flex justify-center">
            {synthesizing && !resumeData ? (
              <div className="my-auto text-center space-y-3">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-300">
                  Synthesizing vast executive resume from verified student record...
                </p>
              </div>
            ) : resumeData ? (
              /* THE A4 PRINTABLE RESUME CANVAS */
              <div
                id="beacon-printable-cv"
                className={`bg-white text-slate-900 shadow-2xl rounded-sm w-full max-w-[850px] p-8 sm:p-12 space-y-6 my-auto transition-all ${
                  resumeStyle === "executive" ? "font-serif" : "font-sans"
                }`}
                style={{ minHeight: "1050px" }}
              >
                {/* 1. Header & Contact */}
                <div className="border-b-2 border-slate-900 pb-4 space-y-1.5 text-center">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                    {resumeData.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-indigo-900 tracking-wide font-sans">
                    {resumeData.headline}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1 font-sans font-medium">
                    {resumeData.contact?.email && <span>📧 {resumeData.contact.email}</span>}
                    {resumeData.contact?.location && <span>• 📍 {resumeData.contact.location}</span>}
                    {resumeData.contact?.linkedinUrl && (
                      <span>
                        •{" "}
                        <a
                          href={resumeData.contact.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-800 font-bold hover:underline"
                        >
                          LinkedIn
                        </a>
                      </span>
                    )}
                    {resumeData.contact?.githubUrl && (
                      <span>
                        •{" "}
                        <a
                          href={resumeData.contact.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-800 font-bold hover:underline"
                        >
                          GitHub
                        </a>
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Beacon Verified Student
                    </span>
                  </div>
                </div>

                {/* 2. Professional Summary */}
                {showSummary && resumeData.summary && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-sans">
                      Professional Summary
                    </h2>
                    <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed text-justify">
                      {resumeData.summary}
                    </p>
                  </div>
                )}

                {/* 3. Education & Honors */}
                {showEducation && resumeData.education && (
                  <div className="space-y-2">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-sans">
                      Education & Academic Verification
                    </h2>
                    {resumeData.education.map((edu: any, i: number) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between font-sans">
                          <strong className="text-slate-950 font-bold text-sm">
                            {edu.college}
                          </strong>
                          <span className="text-slate-600 font-medium">
                            Graduation: {edu.graduationYear}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold">{edu.degree}</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[11px] font-sans">
                            Verified CGPA: {edu.cgpa} / 10.0
                          </span>
                        </div>
                        {edu.honors && (
                          <p className="text-[11px] text-slate-500 italic pt-0.5">
                            {edu.honors}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Work Experience & Internships */}
                {showExperiences && resumeData.experiences && resumeData.experiences.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-sans">
                      Professional Experience & Internships
                    </h2>
                    <div className="space-y-3">
                      {resumeData.experiences.map((exp: any, i: number) => (
                        <div key={i} className="text-xs space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-sans">
                            <div>
                              <strong className="text-slate-950 font-bold text-sm">
                                {exp.title}
                              </strong>
                              <span className="text-indigo-900 font-semibold ml-1.5">
                                • {exp.company}
                              </span>
                            </div>
                            <span className="text-slate-600 font-medium text-[11px]">
                              {exp.period} | {exp.location}
                            </span>
                          </div>

                          <ul className="list-disc list-inside space-y-1 text-slate-800 text-[12px] leading-relaxed pl-1">
                            {exp.bullets.map((bullet: string, bi: number) => (
                              <li key={bi} className="leading-snug">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Verifiable Proof of Work (Projects) */}
                {showProjects && resumeData.projects && resumeData.projects.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-sans">
                      Verifiable Proof of Work & Technical Projects
                    </h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj: any, i: number) => (
                        <div key={i} className="text-xs space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-sans">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-950 font-bold text-sm">
                                {proj.title}
                              </strong>
                              <span className="text-[10px] font-black text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                                Rubric: {proj.rubricScore} / 100
                              </span>
                            </div>
                            <span className="text-slate-500 text-[11px]">{proj.category}</span>
                          </div>

                          <ul className="list-disc list-inside space-y-0.5 text-slate-800 text-[12px] leading-relaxed pl-1">
                            {proj.bullets.map((bullet: string, bi: number) => (
                              <li key={bi} className="leading-snug">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Categorized Technical Competencies Matrix */}
                {showSkills && resumeData.skillsCategorized && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-sans">
                      Technical Competencies & Tools
                    </h2>
                    <div className="space-y-1 text-xs">
                      {Object.entries(resumeData.skillsCategorized).map(([cat, skList]: any, i: number) => {
                        if (!Array.isArray(skList) || skList.length === 0) return null;
                        return (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-[12px]">
                            <strong className="text-slate-950 font-bold shrink-0 min-w-[200px] font-sans">
                              {cat}:
                            </strong>
                            <span className="text-slate-700 leading-snug">
                              {skList.join(", ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. Verified Certifications */}
                {showCertificates && resumeData.certifications && resumeData.certifications.length > 0 && (
                  <div className="space-y-1.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 font-sans">
                      Verified Certifications & Credentials
                    </h2>
                    <div className="space-y-1 text-xs">
                      {resumeData.certifications.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-[11px] font-sans">
                          <div>
                            <strong className="text-slate-950 font-bold">{c.title}</strong>
                            <span className="text-slate-500 ml-1.5">({c.issuer})</span>
                          </div>
                          <span className="text-slate-500">
                            {c.issueDate || "Verified"} • ID: {c.credentialId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
