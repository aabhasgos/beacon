import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { IconBriefcase, IconCheckCircle, IconChevronRight, IconFileText } from "@/components/icons/Icons";

export default function CareerAndProjectsPublicPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              Career Sandbox & Evidence
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Test the reality of a role before committing semesters of preparation.
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Don&apos;t pick a career path based on 30-second social media reels or course salary hype. Beacon Career Sandbox gives you realistic, bite-sized mini-tasks from actual engineering and product roles, complete with rubrics, realistic trade-offs, and structured reflection.
            </p>
          </div>

          {/* Realistic Sandbox Experiments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full inline-block mb-3">
                  SYSTEMS & SRE EXPERIMENT
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Debug a Cascading Redis Failover</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Analyze synthetic server latency metrics, trace connection pool exhaustion, and configure client exponential backoff.
                </p>
                <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="font-medium"><span className="text-slate-400 font-normal">Effort:</span> 45 mins</div>
                  <div className="font-medium"><span className="text-slate-400 font-normal">Prerequisites:</span> TCP, Basic Key-Value</div>
                  <div className="font-medium"><span className="text-slate-400 font-normal">Deliverable:</span> Incident Root Cause Analysis</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/app/career-lab"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Launch Task in App</span>
                  <IconChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full inline-block mb-3">
                  FRONTEND ARCHITECTURE
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Build an Accessible Combobox in React</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Implement ARIA 1.2 compliant keyboard navigation, screen-reader focus traps, and virtualized list rendering.
                </p>
                <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="font-medium"><span className="text-slate-400 font-normal">Effort:</span> 60 mins</div>
                  <div className="font-medium"><span className="text-slate-400 font-normal">Prerequisites:</span> TypeScript, DOM events</div>
                  <div className="font-medium"><span className="text-slate-400 font-normal">Deliverable:</span> Tested Component on Sandbox</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/app/career-lab"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Launch Task in App</span>
                  <IconChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full inline-block mb-3">
                  APPLIED AI ENGINEERING
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Evaluate Retrieval Faithfulness for RAG</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Construct an automated eval set of 20 edge-case queries, measure chunk recall, and benchmark latency on production LLM endpoints.
                </p>
                <div className="text-xs text-slate-700 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="font-medium"><span className="text-slate-400 font-normal">Effort:</span> 50 mins</div>
                  <div className="font-medium"><span className="text-slate-400 font-normal">Prerequisites:</span> Python, Embeddings</div>
                  <div className="font-medium"><span className="text-slate-400 font-normal">Deliverable:</span> Eval Benchmark Report</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/app/career-lab"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Launch Task in App</span>
                  <IconChevronRight size={14} />
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
