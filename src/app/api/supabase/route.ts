import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSupabaseConfig, getSupabase } from "@/lib/supabase/client";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = getSupabaseConfig();
    const db = getDb();

    // Get count of local users, certificates, resumes
    const userCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any)?.c || 0;
    const certCount = (db.prepare("SELECT COUNT(*) as c FROM certificates").get() as any)?.c || 0;
    const resumeCount = (db.prepare("SELECT COUNT(*) as c FROM resumes").get() as any)?.c || 0;

    let isConnected = false;
    let connectionError = null;

    if (config.isConfigured) {
      try {
        const client = getSupabase();
        if (client) {
          // Quick ping to check connection
          const { error } = await client.from("profiles").select("id").limit(1);
          if (!error || error.code === "PGRST116" || error.message.includes("relation")) {
            isConnected = true;
          } else {
            connectionError = error.message;
          }
        }
      } catch (e: any) {
        connectionError = e.message;
      }
    }

    return NextResponse.json({
      isConfigured: config.isConfigured,
      isConnected,
      connectionError,
      url: config.url ? `${config.url.slice(0, 18)}...` : "",
      stats: {
        localUsers: userCount,
        localCertificates: certCount,
        localResumes: resumeCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    const { action, url, anonKey } = body;

    if (action === "save_config") {
      if (!url || !anonKey) {
        return NextResponse.json({ error: "Both Supabase Project URL and Anon Key are required." }, { status: 400 });
      }

      // Test connection before saving
      let testSuccess = false;
      let errorMsg = "";
      try {
        const testClient = createClient(url, anonKey);
        const { error } = await testClient.auth.getSession();
        if (!error) {
          testSuccess = true;
        } else {
          errorMsg = error.message;
        }
      } catch (err: any) {
        errorMsg = err.message;
      }

      // Save to app_settings
      const configVal = JSON.stringify({ url, anonKey, savedAt: new Date().toISOString() });
      db.prepare(`
        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('supabase_config', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(configVal);

      return NextResponse.json({
        success: true,
        testSuccess,
        message: testSuccess
          ? "Supabase connected successfully!"
          : `Credentials saved, but test ping returned: ${errorMsg || "Pending table setup"}`,
      });
    }

    if (action === "sync_to_cloud") {
      const client = getSupabaseAdmin() || getSupabase();
      if (!client) {
        return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 400 });
      }

      // Fetch local users
      const users = db.prepare("SELECT * FROM users").all() as any[];
      let syncedCount = 0;
      let errorDetails = "";

      for (const u of users) {
        try {
          const { error } = await client.from("profiles").upsert({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            avatar_url: u.avatar_url,
            headline: u.headline,
            bio: u.bio,
            location: u.location,
            college: u.college,
            degree: u.degree,
            graduation_year: u.graduation_year,
            cgpa: u.cgpa,
          });
          if (error) {
            errorDetails = error.message;
          } else {
            syncedCount++;
          }
        } catch (e: any) {
          errorDetails = e.message;
        }
      }

      if (syncedCount === 0 && errorDetails) {
        return NextResponse.json({
          success: false,
          error: `Supabase table not found or error: ${errorDetails}. Please run the SQL schema in your Supabase SQL editor first!`,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Synced ${syncedCount} student profiles to Supabase cloud database.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Supabase API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update Supabase configuration" }, { status: 500 });
  }
}
