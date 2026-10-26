import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const profile = db.prepare("SELECT is_public FROM student_profiles WHERE user_id = ?").get(userId) as any;
    const memories = db.prepare("SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    const userRecord = db.prepare("SELECT id, email, full_name, created_at FROM users WHERE id = ?").get(userId) as any;

    return NextResponse.json({
      user: userRecord,
      isPublic: Boolean(profile?.is_public !== 0),
      memories,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const { action, memoryId, currentPassword, newPassword, isPublic } = body;

    // 1. Password update
    if (action === "update_password") {
      if (!newPassword || newPassword.trim().length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
      }

      const existingUser = db.prepare("SELECT password FROM users WHERE id = ?").get(userId) as any;
      if (existingUser?.password && existingUser.password !== "password123") {
        if (existingUser.password !== currentPassword?.trim()) {
          return NextResponse.json({ error: "Current password does not match." }, { status: 400 });
        }
      }

      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword.trim(), userId);
      return NextResponse.json({ success: true, message: "Password updated successfully." });
    }

    // 2. Toggle public passport privacy
    if (action === "update_privacy") {
      const publicValue = isPublic ? 1 : 0;
      db.prepare("UPDATE student_profiles SET is_public = ? WHERE user_id = ?").run(publicValue, userId);
      return NextResponse.json({ success: true, message: "Profile privacy settings updated." });
    }

    // 3. Delete memory from Context Ledger
    if (action === "delete_memory" && memoryId) {
      db.prepare("DELETE FROM memories WHERE id = ? AND user_id = ?").run(memoryId, userId);
      return NextResponse.json({ success: true, message: "Memory removed from AI context ledger." });
    }

    // 4. Export complete student data bundle (DPDP Act)
    if (action === "export_data") {
      const userRecord = db.prepare("SELECT id, email, full_name, role, college, degree, graduation_year, cgpa, location, headline, bio, created_at FROM users WHERE id = ?").get(userId);
      const profileRecord = db.prepare("SELECT interests, constraints, is_public, github_url, linkedin_url, portfolio_url FROM student_profiles WHERE user_id = ?").get(userId);
      const skills = db.prepare("SELECT skill_name, level, provenance, evidence_notes, verified_at FROM skill_claims WHERE user_id = ?").all(userId);
      const certs = db.prepare("SELECT title, issuer, issue_date, credential_id, provenance, verified_status, skills_covered FROM certificates WHERE user_id = ?").all(userId);
      const tasks = db.prepare("SELECT title, description, status, deadline, completed_at FROM learning_tasks WHERE user_id = ?").all(userId);
      const applications = db.prepare("SELECT opportunity_id, status, applicant_name, college, degree, applied_at FROM applications WHERE user_id = ?").all(userId);
      const memoriesRecord = db.prepare("SELECT memory_key, memory_value, source, created_at FROM memories WHERE user_id = ?").all(userId);

      const exportBundle = {
        exportDate: new Date().toISOString(),
        product: "Beacon Student OS",
        compliance: "Digital Personal Data Protection (DPDP) Act 2025",
        student: userRecord,
        profile: profileRecord,
        skills,
        certificates: certs,
        tasks,
        applications,
        memories: memoriesRecord,
      };

      return NextResponse.json({ success: true, data: exportBundle });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
