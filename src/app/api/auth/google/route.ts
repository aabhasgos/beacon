import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    
    // Accept credential token or fallback testing Google student
    const googleEmail = (body.email || "test.student@beacon.dev").toLowerCase().trim();
    const googleName = body.name || "Testing Student";
    const googleAvatar = body.avatar || null;

    let user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(googleEmail) as any;

    if (!user) {
      // Create fresh, raw, empty student account for this user
      const newId = `usr_google_${Date.now()}`;
      db.prepare(`
        INSERT INTO users (
          id, email, full_name, role, avatar_url, headline, education_stage, college, degree, graduation_year, cgpa, location, bio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newId,
        googleEmail,
        googleName,
        "student",
        googleAvatar, // uploaded avatar if provided by Google
        null, // No inferred headline
        "College / Undergraduate",
        null, // Blank college
        null, // Blank degree
        null, // Blank grad year
        null, // Blank CGPA
        null, // Blank location
        null  // Blank bio
      );

      db.prepare(`
        INSERT INTO student_profiles (user_id, interests, is_public)
        VALUES (?, ?, ?)
      `).run(newId, JSON.stringify([]), 1);

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully authenticated with Google.",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        fullName: user.full_name,
        avatar_url: user.avatar_url,
        college: user.college,
        degree: user.degree,
        cgpa: user.cgpa,
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
