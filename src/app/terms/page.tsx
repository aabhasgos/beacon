import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function TermsPublicPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3 border-b border-slate-200 pb-6">
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Terms of Service
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Beacon Terms & Conditions
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Version 1.0 • Last Revised: October 25, 2026
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By accessing or creating an account on Beacon, you agree to comply with and be bound by these Terms and Conditions. If you are under 18 years of age, you represent that you have reviewed these terms with your parent or lawful guardian.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">2. No Guarantee of Admissions, Grades, or Placement</h2>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 font-medium text-amber-900 text-xs sm:text-sm">
                <strong>IMPORTANT NOTICE:</strong> Beacon is an educational planning and evidence portfolio platform. Beacon DOES NOT and CANNOT guarantee college admissions, scholarship awards, examination marks, interview selection, or job employment. AI-generated feedback and opportunity match percentages are advisory estimates and do not constitute professional career warranties.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">3. Acceptable Use & Integrity Rules</h2>
              <p>Users must not:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Upload forged, fraudulent, or altered certificates or degrees.</li>
                <li>Impersonate another student, college official, or verified mentor.</li>
                <li>Attempt to scrape, reverse engineer, or degrade platform availability.</li>
                <li>Circumvent child safety controls or initiate unmoderated contact with minors.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">4. Ownership of User Content</h2>
              <p>
                You retain 100% intellectual property ownership of your submitted code, project artifacts, essays, and uploaded resumes. You grant Beacon only the limited, revocable license necessary to operate the service, generate rubric feedback, and transmit your approved applications.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">5. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
