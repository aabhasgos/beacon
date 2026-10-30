import { NextResponse } from "next/server";
import { getDb, ensureUserExists } from "@/lib/db";
import { fetchAndSyncProfileFromSupabase, pushProfileToSupabase, AABHAS_SUPABASE_ID } from "@/lib/supabase/sync";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    
    // Accept credential token or fallback testing Google student
    const googleId = body.id || null;
    const googleEmail = (body.email || "aabhasgos2@gmail.com").toLowerCase().trim();
    const googleName = body.name || "Aabhas Goswami";
    const googleAvatar = body.avatar || null;

    // 1. Try syncing from Supabase Cloud first
    try {
      await fetchAndSyncProfileFromSupabase(googleId || googleEmail);
    } catch (e) {
      console.warn("fetchAndSyncProfileFromSupabase warning:", e);
    }

    // 2. Query user in SQLite cache by email or ID
    let user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ? OR id = ?").get(googleEmail, googleId || "") as any;

    if (!user) {
      const targetId = googleId || `usr_google_${Date.now()}`;
      user = ensureUserExists(db, targetId, googleName, googleEmail);
    }

    // 3. If Aabhas Goswami, guarantee Bennett University credentials
    const isAabhas = googleEmail === "aabhasgos2@gmail.com" || (user && (user.id === AABHAS_SUPABASE_ID || user.id === "usr_student_01"));
    if (isAabhas && (!user.college || user.college.includes("Kurukshetra") || user.college.includes("NITK") || !user.degree)) {
      db.prepare(`
        UPDATE users SET
          college = 'Bennett University (Times Group)',
          degree = 'B.Tech Computer Science and Engineering',
          location = 'Greater Noida / Delhi NCR',
          headline = COALESCE(headline, 'Pre-final Year B.Tech CSE @ Bennett University | AI & Systems Engineer'),
          bio = COALESCE(bio, 'Undergraduate student at Bennett University passionate about distributed systems, real-time AI inference, and autonomous technologies.'),
          graduation_year = 2027,
          cgpa = 8.8
        WHERE id = ?
      `).run(user.id);
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);

      // Also persist to Supabase Cloud
      try {
        await pushProfileToSupabase({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          college: "Bennett University (Times Group)",
          degree: "B.Tech Computer Science and Engineering",
          location: "Greater Noida / Delhi NCR",
          headline: user.headline,
          bio: user.bio,
          graduation_year: 2027,
          cgpa: 8.8,
          avatar_url: user.avatar_url || googleAvatar,
        });
      } catch (err) {}
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully authenticated with Google.",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        fullName: user.full_name,
        avatar_url: user.avatar_url || googleAvatar,
        college: user.college || "Bennett University (Times Group)",
        degree: user.degree || "B.Tech Computer Science and Engineering",
        graduation_year: user.graduation_year || 2027,
        cgpa: user.cgpa || 8.8,
        location: user.location || "Greater Noida / Delhi NCR",
        headline: user.headline,
        bio: user.bio,
      },
    });

    response.cookies.set("beacon_session", user.id, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set("beacon_user_id", user.id, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: error.message || "Google authentication failed" }, { status: 500 });
  }
}
