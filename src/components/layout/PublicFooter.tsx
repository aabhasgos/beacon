import React from "react";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-300 pt-14 pb-10 mt-16 text-slate-700 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo-icon.jpg"
                alt="Beacon Logo"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <span className="font-extrabold text-xl text-slate-900 block leading-tight">
                  Beacon
                </span>
                <span className="text-[11px] font-semibold text-indigo-700">
                  Your journey. Your direction.
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Your all-in-one student operating system. Find verified internships, discover courses, manage your certificate locker, and get tailored guidance from Beacon AI.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">
              Explore Opportunities
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li><Link href="/opportunities" className="hover:text-indigo-600">Software Internships</Link></li>
              <li><Link href="/opportunities" className="hover:text-indigo-600">Research Fellowships</Link></li>
              <li><Link href="/opportunities" className="hover:text-indigo-600">Engineering Challenges</Link></li>
              <li><Link href="/academy" className="hover:text-indigo-600">Curated Courses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">
              Student Features
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li><Link href="/app/passport" className="hover:text-indigo-600">Student Passport & Bio</Link></li>
              <li><Link href="/app/passport" className="hover:text-indigo-600">Certificate Locker</Link></li>
              <li><Link href="/app/guide" className="hover:text-indigo-600">Beacon AI Career Coach</Link></li>
              <li><Link href="/app/roadmap" className="hover:text-indigo-600">Personal Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-950 text-xs uppercase tracking-wider mb-3">
              About & Trust
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li><Link href="/about" className="hover:text-indigo-600">About Beacon</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-600">Privacy Policy (DPDP 2025)</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link></li>
              <li><Link href="/help" className="hover:text-indigo-600">Help & Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3 font-medium">
          <p>© 2026 Beacon Platform. Made for ambitious students everywhere.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/help" className="hover:text-slate-900">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
