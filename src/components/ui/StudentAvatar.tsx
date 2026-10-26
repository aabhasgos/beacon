"use client";

import React, { useState, useEffect } from "react";

interface StudentAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showRing?: boolean;
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "ST";
  const cleaned = name.replace(/[^a-zA-Z\s]/g, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StudentAvatar({
  name,
  avatarUrl,
  size = "md",
  className = "",
  showRing = false,
}: StudentAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Reset imgError if avatarUrl changes
  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const initials = getInitials(name);

  // Size mappings
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px] rounded-md",
    sm: "w-8 h-8 text-xs rounded-lg",
    md: "w-10 h-10 text-sm rounded-xl",
    lg: "w-16 h-16 text-xl rounded-2xl",
    xl: "w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl rounded-2xl",
  }[size];

  const ringClass = showRing
    ? "ring-4 ring-white dark:ring-slate-900 shadow-md"
    : "shadow-2xs";

  if (avatarUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden shrink-0 ${sizeClasses} ${ringClass} ${className} bg-slate-100 dark:bg-slate-800`}>
        <img
          src={avatarUrl}
          alt={name || "Student"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Graceful fallback to premium initials monogram
  return (
    <div
      className={`relative overflow-hidden shrink-0 ${sizeClasses} ${ringClass} ${className} bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white font-black flex items-center justify-center select-none tracking-tight border border-indigo-400/30`}
      title={name || "Verified Student"}
    >
      <span>{initials}</span>
      {/* Subtle glass reflection highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
    </div>
  );
}
