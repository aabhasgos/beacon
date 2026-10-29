import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, portal, role } = body;
    const isMentorPortal = portal === "mentor" || role === "mentor";
    const isRecruiterPortal = portal === "recruiter" || role === "recruiter";
    const isAdminPortal = portal === "admin" || role === "admin" || (body.email && body.email.toLowerCase().includes("admin@"));

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

      // If logging in through Recruiter Portal
      if (isRecruiterPortal && user.role !== "recruiter") {
        // Upgrade or switch to recruiter role if logging in through recruiter portal
        db.prepare("UPDATE users SET role = 'recruiter' WHERE id = ?").run(user.id);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      // If logging in through Admin Portal
      if (isAdminPortal && user.role !== "admin") {
        db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      // Verify password if one was set during registration
      if (user.password && password && user.password !== "password123") {
        if (user.password !== password.trim()) {
          return NextResponse.json(
            { error: `Incorrect password for this account. Please check your credentials.` },
            { status: 401 }
          );
        }
      }
    } else {
      // If recruiter portal and unknown email
      if (isRecruiterPortal) {
        const freeDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "rediffmail.com"];
        const domain = cleanEmail.split("@")[1] || "";
        const isFreeEmail = freeDomains.includes(domain);

        const knownRecruiters: Record<string, { name: string; headline: string; company: string }> = {
          "recruiter@razorpay.com": { name: "Aditya Sharma", headline: "Lead Technical Recruiter @ Razorpay", company: "Razorpay" },
          "talent@microsoft.com": { name: "Ananya Iyer", headline: "University Talent Lead @ Microsoft", company: "Microsoft" },
          "careers@isro.gov.in": { name: "Dr. K. S. Raman", headline: "Senior Scientific Officer & Recruitment Chair @ ISRO SAC", company: "ISRO SAC" },
          "recruiter@google.com": { name: "Rohit Malhotra", headline: "Staff Tech Recruiter @ Google India", company: "Google India" },
          "talent@cred.club": { name: "Pooja Hegde", headline: "Head of Campus Engineering Talent @ CRED", company: "CRED" },
          "recruiter@flipkart.com": { name: "Vikram Nambiar", headline: "Campus Engineering Hiring Lead @ Flipkart", company: "Flipkart" },
        };

        const known = knownRecruiters[cleanEmail];
        const newId = `usr_recruiter_${Date.now()}`;
        const companyName = known?.company || domain.split(".")[0].toUpperCase();
        const fullName = known?.name || `${cleanEmail.split("@")[0].replace(/[._-]/g, " ")} (Recruiter)`;
        const headline = known?.headline || `Enterprise Talent Partner @ ${companyName}`;

        db.prepare(`
          INSERT INTO users (
            id, email, password, full_name, role, headline, college, degree
          ) VALUES (?, ?, ?, ?, 'recruiter', ?, ?, 'Enterprise Talent Partner')
        `).run(
          newId,
          cleanEmail,
          password || "password123",
          fullName,
          headline,
          companyName
        );

        user = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
      } else if (isMentorPortal) {
        // If mentor portal and unknown email, reject or check known mentor list
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
      } else if (isAdminPortal) {
        // Auto-provision master administrator account
        const newId = `usr_admin_${Date.now()}`;
        db.prepare(`
          INSERT INTO users (
            id, email, password, full_name, role, headline, college, degree
          ) VALUES (?, ?, ?, 'Master Administrator', 'admin', 'Institutional Governance & Audit Officer', 'Beacon Network', 'System Administration')
        `).run(
          newId,
          cleanEmail,
          password || "beacon-admin-2026"
        );
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(newId);
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

    const redirectUrl =
      user.role === "admin"
        ? "/app/admin"
        : user.role === "mentor"
        ? "/app/mentors"
        : user.role === "recruiter"
        ? "/app/opportunities?recruiter=true"
        : "/app";

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
