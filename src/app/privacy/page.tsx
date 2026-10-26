import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PrivacyPublicPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Beacon Privacy Policy & Data Protection Notice
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Version 1.0 • Effective Date: October 25, 2026 • Governed by India Digital Personal Data Protection Act, 2023 & Rules 2025
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Overview and Purpose</h2>
              <p>
                Beacon (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;) is a student operating system committed to student privacy, data minimization, and evidence transparency. This policy outlines how we collect, process, store, and protect your personal information when you use the Beacon web application, student Passport, AI assistant, and opportunity radar.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. Categories of Data Collected</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Account Identity:</strong> Email address, full name, education stage, college/institution name, graduation year, and academic CGPA.</li>
                <li><strong>Student Profile & Artifacts:</strong> Stated career interests, personal constraints (e.g., exam periods), GitHub and LinkedIn links.</li>
                <li><strong>Evidence & Credentials:</strong> Certificate titles, issuers, credential verification IDs, and securely uploaded certificate documents (PDF/images).</li>
                <li><strong>Resumes:</strong> Uploaded resume files, parsed skill summaries, and application cover notes.</li>
                <li><strong>AI Assistant Conversations & Memories:</strong> Prompts sent to Beacon AI Coach, generated roadmap tasks, and explicit student context memories stored in the Context Ledger.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. AI Processing & Third-Party Providers</h2>
              <p>
                When using Beacon AI Coach with an enabled Groq API key, your query and bounded student context are processed via Groq Inc.&apos;s enterprise API endpoints running open-weight foundation models (such as Llama 3.3 70B). We do not permit model providers to train foundation models on private student conversations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. Safeguards for Minor Users (Under 18)</h2>
              <p>
                Beacon takes heightened precautions regarding users aged 16 to 17:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Profiles are private by default and cannot be indexed publicly without explicit student opt-in.</li>
                <li>No unrestricted adult-to-minor direct messaging exists on the platform. Mentoring is conducted strictly through structured, bounded Mentor Briefs.</li>
                <li>Zero behavioral profiling or commercial advertising targeting minors.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. Your Data Rights & Context Ledger</h2>
              <p>
                Under the DPDP Act 2023, you have complete control over your data. Inside Beacon OS Settings:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Inspect & Delete Memories:</strong> View every specific memory the AI stores about you and delete individual entries with one click.</li>
                <li><strong>Data Portability:</strong> Export a full machine-readable JSON archive of your profile, evidence, and activity.</li>
                <li><strong>Account Erasure:</strong> Request permanent deletion of your account and uploaded files.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">6. Privacy Officer Contact</h2>
              <p>
                For questions, privacy grievances, or parental inquiries, contact our Data Protection Officer at:
                <br />
                <code className="text-xs bg-slate-100 text-indigo-700 px-2 py-1 rounded-md font-mono mt-1 inline-block">privacy@beacon-student.org</code>
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
