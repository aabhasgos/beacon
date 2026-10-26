import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { IconShield, IconAlertCircle, IconCheckCircle } from "@/components/icons/Icons";

export default function HelpPublicPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-4">
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Help & Safety Center
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Student Safety, Reporting, and Account Assistance.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Beacon is built with strict privacy and student safety guardrails in accordance with the Digital Personal Data Protection Act, 2023. Here is how to get help, report an inaccurate opportunity, or exercise your data rights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <h3 className="font-bold text-base text-slate-900">Report an Expired or Suspicious Opportunity</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If you encounter an opportunity link with altered eligibility, an unexpected application fee, or an expired deadline, let our review team know immediately.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:safety@beacon-student.org?subject=Opportunity%20Report"
                  className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
                >
                  Email safety@beacon-student.org
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <h3 className="font-bold text-base text-slate-900">Minor Safeguards & Guardian Contact</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For students under 18: Beacon prohibits unrestricted adult-minor private messaging. All mentor interactions occur through structured, permissioned Mentor Briefs.
              </p>
              <div className="pt-2">
                <Link
                  href="/privacy"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
                >
                  Review Minor Data Protection Terms
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <h3 className="font-bold text-base text-slate-900">AI Companion Limitations & Crisis Support</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Beacon AI is an educational companion. It does not provide psychological diagnosis, clinical counselling, or legal advice.
              </p>
              <div className="text-xs text-amber-900 bg-amber-50 p-3 rounded-2xl border border-amber-200 font-medium">
                In India: Kiran Mental Health Helpline: 1800-599-0019 (24/7 Free)
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-xs">
              <h3 className="font-bold text-base text-slate-900">Data Portability & Account Deletion</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You can export all your data in JSON format or trigger complete account deletion directly from the Settings & Privacy tab inside the app.
              </p>
              <div className="pt-2">
                <Link
                  href="/app/settings"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
                >
                  Open Context Ledger & Deletion Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
