import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const recruiterId = user?.id || "usr_recruiter_01";
    const recruiterName = user?.full_name || "Enterprise Talent Partner";

    const body = await request.json();
    const { studentId, recruiterCompany, roleTitle, stipend, message } = body;

    if (!studentId || !roleTitle || !message) {
      return NextResponse.json({ error: "Candidate ID, role title, and message are required." }, { status: 400 });
    }

    const inviteId = `inv_${Date.now()}`;
    const company = recruiterCompany || "Verified Hiring Partner";

    db.prepare(`
      INSERT INTO recruiter_invites (
        id, recruiter_id, recruiter_name, recruiter_company, student_id, role_title, stipend, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent')
    `).run(
      inviteId,
      recruiterId,
      recruiterName,
      company,
      studentId,
      roleTitle,
      stipend || "Competitive Stipend + PPO",
      message
    );

    // Notify student via activity stream
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      studentId,
      "fast_track_interview_invite",
      `Fast-Track Interview Invitation from ${company}!`,
      `Role: ${roleTitle}. Recruiter message: "${message.slice(0, 80)}..."`
    );

    return NextResponse.json({
      success: true,
      inviteId,
      message: `Direct interview invitation delivered to candidate via Beacon Protocol.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
