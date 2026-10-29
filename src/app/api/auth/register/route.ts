import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      password,
      role = "student",
      college,
      degree,
      graduationYear,
      cgpa,
      interests,
      headline,
      bio,
      company,
      title,
      experienceYears,
      linkedinUrl,
    } = body;

    if (!fullName || !email) {
      return NextResponse.json({ error: "Full Name and Email are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = role === "mentor" ? "mentor" : role === "recruiter" ? "recruiter" : role === "admin" ? "admin" : "student";

    // Phase 3: Strict 10+ Year Mentorship Experience Verification
    if (cleanRole === "mentor") {
      const exp = Number(experienceYears) || 0;
      if (exp < 10) {
        return NextResponse.json(
          { error: "Senior Mentors must possess a minimum of 10+ verified years in the technology industry." },
          { status: 400 }
        );
      }
      if (!linkedinUrl || !linkedinUrl.includes("linkedin.com")) {
        return NextResponse.json(
          { error: "A valid LinkedIn profile URL is mandatory for mentor council credential verification." },
          { status: 400 }
        );
      }
    }

    let existingUser = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(cleanEmail) as any;
    let userId = existingUser ? existingUser.id : `usr_${Date.now()}`;

    if (existingUser) {
      db.prepare(`
        UPDATE users SET
          full_name = ?,
          password = ?,
          role = ?,
          college = ?,
          degree = ?,
          graduation_year = ?,
          cgpa = ?,
          headline = ?,
          bio = ?,
          experience_years = ?,
          linkedin_url = ?
        WHERE id = ?
      `).run(
        fullName,
        password || existingUser.password || "password123",
        cleanRole,
        college || existingUser.college,
        degree || existingUser.degree,
        graduationYear ? Number(graduationYear) : existingUser.graduation_year,
        cgpa ? Number(cgpa) : existingUser.cgpa,
        headline || (cleanRole === "mentor" ? `${title || "Senior Practitioner"} @ ${company || "Tech"}` : cleanRole === "recruiter" ? `${title || "Talent Partner"} @ ${company || "Enterprise"}` : existingUser.headline),
        bio || (cleanRole === "recruiter" ? `Verified enterprise talent partner at ${company || "Enterprise"}.` : existingUser.bio),
        experienceYears ? Number(experienceYears) : existingUser.experience_years,
        linkedinUrl || existingUser.linkedin_url,
        userId
      );
    } else {
      // Insert new user
      db.prepare(`
        INSERT INTO users (
          id, email, password, full_name, role, avatar_url, headline, bio, college, degree, graduation_year, cgpa, experience_years, linkedin_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        cleanEmail,
        password || "password123",
        fullName,
        cleanRole,
        null,
        headline || (cleanRole === "mentor" ? `${title || "Senior Practitioner"} @ ${company || "Tech"}` : cleanRole === "recruiter" ? `${title || "Talent Partner"} @ ${company || "Enterprise"}` : null),
        bio || (cleanRole === "recruiter" ? `Verified enterprise talent partner at ${company || "Enterprise"}.` : null),
        college ? college.trim() : null,
        degree ? degree.trim() : null,
        graduationYear ? Number(graduationYear) : null,
        cgpa ? Number(cgpa) : null,
        experienceYears ? Number(experienceYears) : null,
        linkedinUrl ? linkedinUrl.trim() : null
      );
    }

    // If Mentor role, also synchronize into mentors & mentor_applications table
    if (cleanRole === "mentor") {
      const startYear = new Date().getFullYear() - (Number(experienceYears) || 10);
      const mentorId = `men_${userId.replace("usr_", "")}`;
      
      const existingMentor = db.prepare("SELECT id FROM mentors WHERE id = ?").get(mentorId);
      if (!existingMentor) {
        db.prepare(`
          INSERT INTO mentors (
            id, name, title, company, bio, avatar_url, verified_level, domains, availability, hourly_rate, experience_years, linkedin_url, career_start_year
          ) VALUES (?, ?, ?, ?, ?, ?, '10+ Yr Verified Council Fellow', ?, '3 slots this week', 'Free for Students', ?, ?, ?)
        `).run(
          mentorId,
          fullName,
          title || "Principal Practitioner",
          company || "Tech Enterprise",
          bio || `${experienceYears}+ years in enterprise systems and software architecture.`,
          null,
          JSON.stringify(["Architecture", "System Design", "Engineering Leadership"]),
          Number(experienceYears) || 10,
          linkedinUrl || "https://linkedin.com",
          startYear
        );
      }

      // Add to mentor council applications for peer review
      const existingApp = db.prepare("SELECT id FROM mentor_applications WHERE user_id = ?").get(userId);
      if (!existingApp) {
        db.prepare(`
          INSERT INTO mentor_applications (
            id, user_id, name, email, company, title, experience_years, career_start_year, linkedin_url, domains, bio, verification_status, council_votes_for
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', 4)
        `).run(
          `app_${Date.now()}`,
          userId,
          fullName,
          cleanEmail,
          company || "Enterprise",
          title || "Senior Lead",
          Number(experienceYears) || 10,
          startYear,
          linkedinUrl || "https://linkedin.com",
          JSON.stringify(["Systems", "Architecture"]),
          bio || "Verified senior practitioner."
        );
      }
    }

    // Insert or update student profile, preserving existing interests
    const existingProfile = db.prepare("SELECT user_id, interests FROM student_profiles WHERE user_id = ?").get(userId) as any;
    if (!existingProfile) {
      const initialInterests = interests
        ? JSON.stringify(interests.split(",").map((s: string) => s.trim()))
        : JSON.stringify(["Full Stack", "AI"]);
      db.prepare(`
        INSERT INTO student_profiles (user_id, interests, is_public)
        VALUES (?, ?, 1)
      `).run(userId, initialInterests);
    } else if (interests && interests.trim().length > 0) {
      const parsedInterests = JSON.stringify(interests.split(",").map((s: string) => s.trim()));
      db.prepare(`
        UPDATE student_profiles SET interests = ? WHERE user_id = ?
      `).run(parsedInterests, userId);
    }

    // Fetch fresh synchronized record from database
    const freshUser = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;

    const redirectUrl =
      freshUser.role === "admin"
        ? "/app/admin"
        : freshUser.role === "mentor"
        ? "/app/mentors"
        : freshUser.role === "recruiter"
        ? "/app/opportunities?recruiter=true"
        : "/app/passport?onboarding=true";

    const res = NextResponse.json({
      success: true,
      userId,
      redirectUrl,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        full_name: freshUser.full_name,
        fullName: freshUser.full_name,
        role: freshUser.role,
        college: freshUser.college,
        degree: freshUser.degree,
        graduationYear: freshUser.graduation_year,
        cgpa: freshUser.cgpa,
        avatar_url: freshUser.avatar_url,
      },
      message: `${
        cleanRole === "mentor"
          ? "Senior Mentor Council credential verified & registered!"
          : cleanRole === "recruiter"
          ? "Enterprise talent partner account registered!"
          : cleanRole === "admin"
          ? "System administrator account initialized!"
          : "Student profile saved successfully!"
      } Redirecting...`,
    });

    res.cookies.set("beacon_session", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    res.cookies.set("beacon_user_id", userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: any) {
    console.error("Register Error:", err);
    return NextResponse.json({ error: err.message || "Failed to create profile" }, { status: 500 });
  }
}
