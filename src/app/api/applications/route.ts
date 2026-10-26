import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const apps = db.prepare(`
      SELECT a.*, o.title as opp_title, o.organization, o.type, o.deadline, o.stipend, o.source_url
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.user_id = ?
      ORDER BY a.applied_at DESC
    `).all(userId);

    return NextResponse.json({ applications: apps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    const body = await request.json();
    const {
      opportunityId,
      coverNote,
      resumeId,
      applicantName,
      applicantEmail,
      applicantPhone,
      college,
      degree,
      cgpa,
      resumeUrl,
      projectLink,
      skillsDeclared,
      screeningAnswers,
      availability,
    } = body;

    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    // Check if already applied
    const existing = db.prepare("SELECT id FROM applications WHERE user_id = ? AND opportunity_id = ?").get(userId, opportunityId) as any;
    if (existing) {
      return NextResponse.json({ error: "You have already submitted an application for this opportunity." }, { status: 400 });
    }

    const opp = db.prepare("SELECT title, organization FROM opportunities WHERE id = ?").get(opportunityId) as any;
    if (!opp) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    const appId = `app_${Date.now()}`;
    const studentUser = user || (db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any);

    db.prepare(`
      INSERT INTO applications (
        id, user_id, opportunity_id, status, resume_id, cover_note,
        applicant_name, applicant_email, applicant_phone, college, degree, cgpa,
        resume_url, project_link, skills_declared, screening_answers, availability, checklist_completed
      ) VALUES (?, ?, ?, 'Applied', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      appId,
      userId,
      opportunityId,
      resumeId || null,
      coverNote || "Submitted application via Beacon Opportunity Radar.",
      applicantName || studentUser?.full_name || "Applicant",
      applicantEmail || studentUser?.email || "applicant@beacon.internal",
      applicantPhone || null,
      college || studentUser?.college || null,
      degree || studentUser?.degree || null,
      cgpa ? Number(cgpa) : studentUser?.cgpa || null,
      resumeUrl || null,
      projectLink || null,
      skillsDeclared ? (typeof skillsDeclared === "string" ? skillsDeclared : JSON.stringify(skillsDeclared)) : null,
      screeningAnswers ? (typeof screeningAnswers === "string" ? screeningAnswers : JSON.stringify(screeningAnswers)) : null,
      availability || "Full duration as required"
    );

    // Telemetry: Log activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "job_application",
      `Application Submitted: ${opp.organization}`,
      `Applied for '${opp.title}' with screening answers, resume, and credentials.`,
      JSON.stringify({
        appId,
        opportunityId,
        role: opp.title,
        company: opp.organization,
        timestamp: new Date().toISOString(),
      })
    );

    // Save a memory ledger entry for RAG
    try {
      db.prepare(`
        INSERT INTO memories (id, user_id, memory_key, memory_value, source, confidence)
        VALUES (?, ?, ?, ?, 'JobApplication', 1.0)
      `).run(
        `mem_${Date.now()}`,
        userId,
        `applied_${opportunityId}`,
        `Student submitted application for '${opp.title}' at '${opp.organization}'. Project: ${projectLink || "None"}. Availability: ${availability || "Full"}.`
      );
    } catch (e) {}

    return NextResponse.json({ success: true, appId, message: "Application submitted successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
