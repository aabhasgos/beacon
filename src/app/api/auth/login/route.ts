import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check user in database
    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(cleanEmail) as any;

    if (user) {
      // Verify password if one was set during registration
      if (user.password && password && user.password !== "password123") {
        if (user.password !== password.trim()) {
          return NextResponse.json(
            { error: "Incorrect password for this student account. Please check your password or register." },
            { status: 401 }
          );
        }
      }
    } else {
      // Auto-provision fresh student account for this specific email
      const newId = `usr_${Date.now()}`;
      const emailPrefix = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
      const derivedName = emailPrefix
        .split(" ")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") || "Student";

      db.prepare(`
        INSERT INTO users (
          id, email, password, full_name, role, avatar_url, headline, bio, college, degree, graduation_year, cgpa
        ) VALUES (?, ?, ?, ?, 'student', null, null, null, null, null, null, null)
      `).run(
        newId,
        cleanEmail,
        password || "password123",
        derivedName
      );

      db.prepare(`
        INSERT INTO student_profiles (user_id, interests, is_public)
        VALUES (?, ?, 1)
      `).run(newId, JSON.stringify([]));

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
    }

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        fullName: user.full_name,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduation_year,
        cgpa: user.cgpa,
        avatar_url: user.avatar_url,
      },
      message: "Logged in successfully",
    });

    res.cookies.set("beacon_session", user.id, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    res.cookies.set("beacon_user_id", user.id, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
