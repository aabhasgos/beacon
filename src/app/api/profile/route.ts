import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { extractResumeText } from "@/lib/parser/resumeExtractor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;
    let profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId) as any;
    
    // Auto-create student_profiles row if missing for a new user
    if (!profile) {
      db.prepare(`
        INSERT INTO student_profiles (user_id, interests, is_public)
        VALUES (?, ?, 1)
      `).run(userId, JSON.stringify(["Software Engineering", "AI", "Full Stack"]));
      profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId) as any;
    }

    const skills = db.prepare("SELECT * FROM skill_claims WHERE user_id = ? ORDER BY verified_at DESC").all(userId) as any[];
    const certificates = db.prepare("SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC").all(userId) as any[];
    let primaryResume = db.prepare("SELECT * FROM resumes WHERE user_id = ? AND is_primary = 1").get(userId) as any;

    if (primaryResume && !primaryResume.raw_text && primaryResume.file_path) {
      const text = extractResumeText(primaryResume.file_path);
      if (text) {
        try {
          db.prepare("UPDATE resumes SET raw_text = ? WHERE id = ?").run(text, primaryResume.id);
          primaryResume.raw_text = text;
        } catch (e) {}
      }
    }

    let parsedInterests: string[] = [];
    let parsedConstraints: string[] = [];
    try {
      if (profile?.interests) parsedInterests = JSON.parse(profile.interests);
      if (profile?.constraints) parsedConstraints = JSON.parse(profile.constraints);
    } catch (e) {
      // safe fallback
    }

    return NextResponse.json({
      user,
      profile: {
        ...profile,
        interests: parsedInterests,
        constraints: parsedConstraints,
      },
      skills,
      certificates,
      primaryResume,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const { fullName, headline, bio, location, college, degree, graduationYear, cgpa, avatarUrl, interests, constraints, githubUrl, linkedinUrl, portfolioUrl, isPublic } = body;

    db.prepare(`
      UPDATE users SET
        full_name = COALESCE(?, full_name),
        headline = COALESCE(?, headline),
        bio = COALESCE(?, bio),
        location = COALESCE(?, location),
        college = COALESCE(?, college),
        degree = COALESCE(?, degree),
        graduation_year = COALESCE(?, graduation_year),
        cgpa = COALESCE(?, cgpa),
        avatar_url = COALESCE(?, avatar_url)
      WHERE id = ?
    `).run(fullName, headline, bio, location, college, degree, graduationYear, cgpa, avatarUrl, userId);

    db.prepare(`
      UPDATE student_profiles SET
        interests = COALESCE(?, interests),
        constraints = COALESCE(?, constraints),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url),
        portfolio_url = COALESCE(?, portfolio_url),
        is_public = COALESCE(?, is_public)
      WHERE user_id = ?
    `).run(
      interests ? JSON.stringify(interests) : null,
      constraints ? JSON.stringify(constraints) : null,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      isPublic !== undefined ? (isPublic ? 1 : 0) : null,
      userId
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
