"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/opportunities", label: "Opportunities" },
    { href: "/academy", label: "Courses & Academy" },
    { href: "/app/guide", label: "Beacon AI Coach", badge: "AI" },
    { href: "/career-and-projects", label: "Career Sandbox" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand with official Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo-icon.jpg"
            alt="Beacon"
            className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                Beacon
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Official
              </span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium tracking-tight">
              Your journey. Your direction.
            </span>
          </div>
        </Link>

        {/* Desktop Nav with high contrast */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "text-indigo-600 font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons with high contrast */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-800 hover:text-indigo-600 px-4 py-2 rounded-xl transition-colors hover:bg-slate-100"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-xs transition-all hover:shadow-md cursor-pointer"
          >
            Register Student
          </Link>
          
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-slate-800 hover:text-indigo-600 border-b border-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-bold text-slate-800 bg-slate-100 rounded-xl"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl"
            >
              Register Student
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
