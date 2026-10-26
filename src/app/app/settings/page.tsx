"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  IconSettings,
  IconTrash,
  IconDownload,
  IconCheckCircle,
  IconShield,
  IconLock,
} from "@/components/icons/Icons";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Password update form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Privacy update state
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [privacySuccessMsg, setPrivacySuccessMsg] = useState("");

  // Notification preferences (Local state)
  const [notifyInternships, setNotifyInternships] = useState(true);
  const [notifyCourses, setNotifyCourses] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);

  // Data export
  const [exporting, setExporting] = useState(false);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const d = await res.json();
        setUserData(d.user || null);
        setIsPublic(d.isPublic ?? true);
        setMemories(d.memories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMsg(null), 4000);
      } else {
        setPasswordMsg({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: "Network error updating password." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleTogglePrivacy = async (newVal: boolean) => {
    setIsPublic(newVal);
    setUpdatingPrivacy(true);
    setPrivacySuccessMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_privacy",
          isPublic: newVal,
        }),
      });
      if (res.ok) {
        setPrivacySuccessMsg(newVal ? "Passport is now publicly discoverable by verified employers." : "Passport is now private.");
        setTimeout(() => setPrivacySuccessMsg(""), 3500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm("Are you sure you want to remove this memory from your AI context ledger?")) return;
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_memory", memoryId }),
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_data" }),
      });
      if (res.ok) {
        const d = await res.json();
        const blob = new Blob([JSON.stringify(d.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `beacon_student_archive_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Student Preferences
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>DPDP 2025 Protected</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Account & Privacy Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1">
            Manage your student credentials, passport visibility to verified employers, AI memory preferences, and personal data portability.
          </p>
        </div>

        {/* Section 1: Account Identity & Password Security */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <h2 className="font-extrabold text-base text-slate-950">Student Login & Security</h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Your registered student email and password for accessing Beacon Student OS.
              </p>
            </div>
          </div>

          {/* Email Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Primary Student Email</span>
              <span className="font-black text-slate-950 text-sm">{userData?.email || "student@beacon.dev"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold text-[11px] self-start sm:self-auto">
              <span>✓</span>
              <span>Authenticated & Active</span>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-1">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">Change Password</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-rose-50 border-rose-300 text-rose-900"
                }`}
              >
                <span>{passwordMsg.type === "success" ? "✓" : "⚠️"}</span>
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updatingPassword || !newPassword}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              {updatingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Section 2: Passport Privacy & Hiring Manager Discovery */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <h2 className="font-extrabold text-base text-slate-950">Passport Privacy & Recruiter Visibility</h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Control whether top engineering teams can discover your verified skills, projects, and certificates.
            </p>
          </div>

          <div className="space-y-4">
            {/* Public Passport Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-4">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-950 text-xs sm:text-sm block">
                  Public Student Passport Discovery
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  When enabled, verified recruiters at ISRO, Razorpay, and top startups can discover your profile via the Opportunity Radar.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTogglePrivacy(!isPublic)}
                disabled={updatingPrivacy}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                  isPublic ? "bg-indigo-600" : "bg-slate-300"
                }`}
                title="Toggle Passport Visibility"
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {privacySuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <IconCheckCircle size={15} className="text-emerald-600" />
                <span>{privacySuccessMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Notification & Career Opportunity Radar Preferences */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h2 className="font-extrabold text-base text-slate-950">Career Intelligence Alerts</h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Configure notifications for high-match opportunities and course recommendations.
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
              <div>
                <span className="font-bold text-slate-950 block">High-Match Internship & Hackathon Alerts</span>
                <span className="text-xs text-slate-600">Notify me when openings match &ge; 70% of my verified skills</span>
              </div>
              <input
                type="checkbox"
                checked={notifyInternships}
                onChange={(e) => setNotifyInternships(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
              <div>
                <span className="font-bold text-slate-950 block">Skill-Gap Courseware Recommendations</span>
                <span className="text-xs text-slate-600">Suggest free Coursera and Stanford courses to bridge prerequisites</span>
              </div>
              <input
                type="checkbox"
                checked={notifyCourses}
                onChange={(e) => setNotifyCourses(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
              <div>
                <span className="font-bold text-slate-950 block">Weekly Roadmap & Execution Review</span>
                <span className="text-xs text-slate-600">Weekly prompt to review milestones and add newly achieved certificates</span>
              </div>
              <input
                type="checkbox"
                checked={notifyWeekly}
                onChange={(e) => setNotifyWeekly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Context Ledger (AI Career Memories) */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <h2 className="font-extrabold text-base text-slate-950">Context Ledger: My AI Career Memories</h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Beacon AI notes your stated career goals and constraints to tailor guidance. You can delete any memory below.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              {memories.length} Memories
            </span>
          </div>

          {memories.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 font-medium">
              No custom memories stored yet. Beacon AI automatically notes your career goals and preferences as you chat with your AI Career Coach.
            </div>
          ) : (
            <div className="space-y-2.5">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs sm:text-sm hover:border-indigo-200 transition-colors"
                >
                  <div>
                    <span className="font-extrabold text-indigo-700 block text-xs">{mem.memory_key}</span>
                    <p className="text-slate-900 font-medium text-xs sm:text-sm mt-0.5">{mem.memory_value}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="Remove this memory"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Data Portability & Rights (DPDP 2025 Compliant) */}
        <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📥</span>
              <h2 className="font-extrabold text-base text-slate-950">Data Portability (DPDP 2025 Compliance)</h2>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              You own your student data. Download your complete academic profile, verified certificates metadata, and applications archive in open JSON format.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs text-slate-600 font-medium max-w-lg">
              In accordance with Digital Personal Data Protection standards, you have the right to full data export and complete account deletion at any time.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
            >
              <IconDownload size={15} />
              <span>{exporting ? "Generating Archive..." : "Download Student Archive (.json)"}</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
