import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full inline-block">
              Platform Features
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              An all-in-one student workspace designed for real outcomes.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Beacon replaces the scattered student experience with an integrated operating system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <span className="text-2xl block">📜</span>
              <h3 className="font-bold text-lg text-slate-900">Student Passport & Locker</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Upload your certificates and resumes. Showcase verified credentials from NPTEL, Meta, Coursera, and national challenges.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <span className="text-2xl block">💼</span>
              <h3 className="font-bold text-lg text-slate-900">Opportunity Radar</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Internshala and Unstop-grade discovery. Curated official listings from ISRO, Razorpay, Google, and Flipkart with 1-click application attachment.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <span className="text-2xl block">✨</span>
              <h3 className="font-bold text-lg text-slate-900">Beacon AI Career Coach</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Smart, friendly guidance. Get course suggestions, project recommendations, and roadmap milestones tailored to your exact year and goals.
              </p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all inline-block"
            >
              Get Started with Beacon
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
