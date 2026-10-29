import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, portal, role } = body;
    const isMentorPortal = portal === "mentor" || role === "mentor";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check user in database
    const cleanEmail = email.toLowerCase().trim();
    let user = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(cleanEmail) as any;

    if (user) {
      // If logging in through Mentor Portal, enforce that the user has mentor role
      if (isMentorPortal && user.role !== "mentor") {
        return NextResponse.json(
          {
            error:
              "This account is registered as a Student. Please switch to the Student Sign In tab or apply as a Senior Mentor with ≥10 years of verified experience.",
          },
          { status: 403 }
        );
      }

      // Verify password if one was set during registration
      if (user.password && password && user.password !== "password123") {
        if (user.password !== password.trim()) {
          return NextResponse.json(
            { error: `Incorrect password for this ${isMentorPortal ? "mentor" : "student"} account. Please check your credentials.` },
            { status: 401 }
          );
        }
      }
    } else {
      // If mentor portal and unknown email, reject or check known mentor list
      if (isMentorPortal) {
        const knownMentors: Record<string, { name: string; headline: string; years: number }> = {
          "priya@uber.com": { name: "Priya Sen", headline: "Staff SRE @ Razorpay (Ex-Uber)", years: 11 },
          "priya@razorpay.com": { name: "Priya Sen", headline: "Staff SRE @ Razorpay (Ex-Uber)", years: 11 },
          "karan@microsoft.com": { name: "Karan Verma", headline: "Senior ML Engineer @ Microsoft", years: 12 },
          "sneha@cred.club": { name: "Sneha Mukherjee", headline: "Principal Product Designer @ Cred", years: 10 },
        };

        const known = knownMentors[cleanEmail];
        if (known) {
          const newId = `usr_mentor_${Date.now()}`;
          db.prepare(`
            INSERT INTO users (
              id, email, password, full_name, role, headline, experience_years, career_start_year, linkedin_url
            ) VALUES (?, ?, ?, ?, 'mentor', ?, ?, 2015, 'https://linkedin.com')
          `).run(newId, cleanEmail, password || "password123", known.name, known.headline, known.years);
          user = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
        } else {
          return NextResponse.json(
            {
              error:
                "Mentor credentials not found. Only verified practitioners with ≥10 years of verified industry tenure can access the Mentor Portal. Please apply for Council Review.",
            },
            { status: 404 }
          );
        }
      } else {
        // Auto-provision fresh student account for this specific email
        const newId = `usr_${Date.now()}`;
        const emailPrefix = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
        const derivedName =
          emailPrefix
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
    }

    const redirectUrl = user.role === "mentor" ? "/app/mentors" : "/app";

    const res = NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        fullName: user.full_name,
        role: user.role,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduation_year,
        cgpa: user.cgpa,
        avatar_url: user.avatar_url,
        experience_years: user.experience_years,
        headline: user.headline,
      },
      message: `Logged in successfully as ${user.role === "mentor" ? "Verified Senior Mentor" : "Student"}.`,
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
