"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconTarget,
  IconCompass,
  IconBookOpen,
  IconBriefcase,
  IconCalendar,
  IconSearch,
  IconAward,
  IconSettings,
  IconFileText,
  IconGraph,
  IconUsers,
  IconCheckCircle,
  IconShield,
} from "../icons/Icons";
import { getSupabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Dynamic User & OAuth Resolution
  useEffect(() => {
    async function resolveUser() {
      // 1. Check if returning from Supabase Google OAuth with #access_token=...
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        try {
          const supabase = getSupabase();
          if (supabase) {
            const { data } = await supabase.auth.getSession();
            const sessionUser = data?.session?.user;
            if (sessionUser?.email) {
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: sessionUser.email,
                  name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email.split("@")[0],
                  avatar: sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture,
                }),
              });
              if (res.ok) {
                const googleData = await res.json();
                if (googleData.user) {
                  localStorage.setItem("beacon_user", JSON.stringify(googleData.user));
                  setCurrentUser(googleData.user);
                  // Clean up hash from browser address bar
                  window.history.replaceState(null, "", window.location.pathname + window.location.search);
                  window.location.reload();
                  return;
                }
              }
            }
          }
        } catch (e) {
          console.error("OAuth resolution notice:", e);
        }
      }

      // 2. Load user profile from API
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem("beacon_user", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        // Fallback to localStorage
        const stored = localStorage.getItem("beacon_user");
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch (e) {}
        }
      }
    }

    resolveUser();
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("beacon_user");
      document.cookie = "beacon_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "beacon_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      const supabase = getSupabase();
      if (supabase) supabase.auth.signOut();
    } finally {
      window.location.href = "/";
    }
  };

  const navItems = [
    { href: "/app", label: "Opportunity Feed", icon: IconSearch, badge: "Live" },
    { href: "/app/guide", label: "Beacon AI Coach", icon: IconCompass, badge: "AI" },
    { href: "/app/passport", label: "Student Passport", icon: IconAward, badge: "Vault" },
    { href: "/app/opportunities", label: "Internships & Jobs", icon: IconBriefcase, badge: "Verified" },
    { href: "/app/academy", label: "Courses & Academy", icon: IconBookOpen },
    { href: "/app/roadmap", label: "My Roadmap", icon: IconCalendar },
    { href: "/app/decision-studio", label: "Decision Studio", icon: IconGraph },
    { href: "/app/projects", label: "Projects & Proof", icon: IconFileText },
    { href: "/app/career-lab", label: "Career Sandbox", icon: IconTarget },
    { href: "/app/mentors", label: "Senior Mentor Council", icon: IconUsers, badge: "10+ Yr" },
    { href: "/app/radar", label: "Talent Radar", icon: IconTarget, badge: "Recruiters" },
    { href: "/app/reviews", label: "Weekly Review", icon: IconCheckCircle },
    ...(currentUser?.role === "admin"
      ? [{ href: "/app/telemetry", label: "Candidate Intelligence", icon: IconShield, badge: "Admin" }]
      : []),
    { href: "/app/settings", label: "Account & Privacy", icon: IconSettings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <img
              src="/logo-icon.jpg"
              alt="Beacon Logo"
              width={36}
              height={36}
              style={{ width: 36, height: 36, objectFit: "cover" }}
              className="w-9 h-9 rounded-xl object-cover shadow-xs border border-slate-200 group-hover:scale-105 transition-transform beacon-logo"
            />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-slate-900 leading-none">
                Beacon
              </span>
              <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase mt-0.5">
                Student OS
              </span>
            </div>
          </Link>
          {currentUser?.role === "mentor" ? (
            <span className="hidden sm:inline-block text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-full px-2.5 py-0.5">
              🏛️ Verified 10+ Yr Senior Mentor Council
            </span>
          ) : (
            <span className="hidden sm:inline-block text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-0.5">
              Verified Student Portal
            </span>
          )}
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <ThemeToggle />

          {/* Beacon AI Engine status */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Beacon AI Engine • Active</span>
          </div>

          {/* Real Dynamic User Profile Quick Pill with resilient Avatar */}
          <Link
            href="/app/passport"
            className="flex items-center gap-2.5 hover:bg-slate-100 p-1.5 pr-3 rounded-xl transition-all border border-slate-200"
            title="View Student Passport"
          >
            <StudentAvatar
              name={currentUser?.full_name}
              avatarUrl={currentUser?.avatar_url}
              size="sm"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 leading-tight">
                {currentUser?.full_name || "Student"}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px]">
                {currentUser?.college || (currentUser?.email ? currentUser.email.split("@")[0] : "Verified Member")}
              </span>
            </div>
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="text-xs font-bold text-slate-600 hover:text-rose-600 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
            title="Sign out of Beacon"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modern Spacious Sidebar Navigation */}
        <aside className="w-68 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 overflow-y-auto hidden md:flex">
          <div className="py-4 px-3 space-y-1">
            <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Platform Modules
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 font-extrabold border-l-4 border-indigo-600 dark:border-indigo-400 shadow-2xs"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                    }`}
                  >
                    <IconComponent
                      size={17}
                      className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}
                    />
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Support & Privacy info in sidebar */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/60 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                DPDP 2025 Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Certificates & resumes are encrypted with 256-bit isolation.
            </p>
            <Link
              href="/app/passport"
              className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 block"
            >
              Manage Credentials Vault →
            </Link>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
