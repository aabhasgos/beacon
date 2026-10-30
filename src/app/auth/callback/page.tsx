"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating with Google...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processOAuth() {
      try {
        const supabase = getSupabase();
        let userEmail: string | null = null;
        let userName: string | null = null;
        let userAvatar: string | null = null;
        let userId: string | null = null;

        if (supabase) {
          // 1. Check current Supabase session
          const { data } = await supabase.auth.getSession();
          const sessionUser = data?.session?.user;
          if (sessionUser?.email) {
            userId = sessionUser.id;
            userEmail = sessionUser.email;
            userName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name;
            userAvatar = sessionUser.user_metadata?.avatar_url || sessionUser.user_metadata?.picture;
          }
        }

        // 2. If sessionUser wasn't returned, parse token from hash (#access_token=...)
        if (!userEmail && typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          const params = new URLSearchParams(window.location.hash.replace("#", "?"));
          const accessToken = params.get("access_token");
          if (accessToken && supabase) {
            try {
              const { data: { user } } = await supabase.auth.getUser(accessToken);
              if (user?.email) {
                userId = user.id;
                userEmail = user.email;
                userName = user.user_metadata?.full_name || user.user_metadata?.name;
                userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
              }
            } catch (e) {
              console.warn("Could not retrieve user by access token:", e);
            }
          }
        }

        // 3. Check query parameters (for authorization code exchange or direct parameters)
        if (!userEmail && typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const emailParam = searchParams.get("email");
          if (emailParam) {
            userEmail = emailParam;
          }
        }

        if (userEmail) {
          if (isMounted) setStatus("Synchronizing your Student Profile...");
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: userId,
              email: userEmail,
              name: userName || userEmail.split("@")[0].replace(/[._-]/g, " "),
              avatar: userAvatar,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              localStorage.setItem("beacon_user", JSON.stringify(data.user));
            }
            if (isMounted) setStatus("Authentication successful! Redirecting to Student OS...");
            window.history.replaceState(null, "", window.location.pathname);
            window.location.href = "/app";
            return;
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to synchronize profile");
          }
        }

        // Fallback timeout if no active token found
        setTimeout(() => {
          if (isMounted) {
            setError("Google OAuth session not detected. Please return to the gateway to sign in with your email.");
          }
        }, 2500);

      } catch (err: any) {
        console.error("Auth callback error:", err);
        if (isMounted) {
          setError(err.message || "An authentication error occurred.");
        }
      }
    }

    processOAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center">
          {error ? (
            <span className="text-2xl">⚠️</span>
          ) : (
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-white">
            {error ? "Google Authentication Notice" : "Verifying Google Authorization"}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || status}
          </p>
        </div>

        {error && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => { window.location.href = "/"; }}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors cursor-pointer shadow-lg"
            >
              Return to Gateway & Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
