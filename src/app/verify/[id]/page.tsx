import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyCredentialByHash } from "@/lib/crypto/credentials";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublicVerifyCredentialPage({ params }: Props) {
  const { id } = await params;
  const credential = verifyCredentialByHash(id);

  if (!credential) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 text-center font-sans">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-lg space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✕
          </div>
          <h1 className="text-xl font-black text-slate-950 dark:text-white">Invalid or Unrecognized Credential</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The cryptographic hash <code className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-rose-600 dark:text-rose-400 font-bold">{id}</code> could not be validated against the Beacon Proof-of-Work ledger.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-indigo-600 text-white text-xs font-bold"
            >
              Back to Beacon Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <img
              src="/logo-icon.jpg"
              alt="Beacon"
              className="w-10 h-10 rounded-xl object-cover border border-slate-800 group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-xl tracking-tight text-white">Beacon AI</span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cryptographically Verified Proof-of-Work</span>
            </span>
          </div>
        </div>

        {/* Executive Certificate Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-indigo-500/30 p-7 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Seal & Hash */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider block">
                Verification Ledger ID
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-white tracking-wider">
                {credential.credentialHash}
              </span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-bold self-start sm:self-auto">
              <span>✓</span>
              <span>Authentic & Non-Tampered</span>
            </div>
          </div>

          {/* Student Identity */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Issued To Verified Candidate
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {credential.userName}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-indigo-300">
              {credential.degree} • {credential.college}
            </p>
          </div>

          {/* Audited Artifact Details */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {credential.artifactType}
              </span>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Audited Rubric Score</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {credential.rubricScore.toFixed(1)} / 100
                </span>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white">
              {credential.artifactTitle}
            </h3>

            {credential.artifactUrl && (
              <a
                href={credential.artifactUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                <span>Inspect Source Repository Artifact</span>
                <span>↗</span>
              </a>
            )}
          </div>

          {/* Cryptographic Signature Block */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Protocol Issuer: <strong>{credential.issuer}</strong></span>
              <span>Timestamp: {credential.issuedAt?.slice(0, 19).replace("T", " ")} UTC</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block mb-0.5">
                Digital HMAC Signature
              </span>
              <p className="font-mono text-[11px] text-slate-400 break-all bg-black/40 p-3 rounded-xl border border-white/5">
                {credential.signature}
              </p>
            </div>
          </div>

          {/* Recruiter / Public Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <Link
              href="/"
              className="text-slate-400 hover:text-white font-medium"
            >
              ← Verify Another Credential on Beacon
            </Link>
            <Link
              href="/app/radar"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-xs"
            >
              Open Recruiter Talent Radar ↗
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
