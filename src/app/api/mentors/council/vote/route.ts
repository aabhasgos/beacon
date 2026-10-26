import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const body = await request.json();
    const { applicationId, vote } = body; // vote: 'for' | 'against'

    if (!applicationId || !vote) {
      return NextResponse.json({ error: "Application ID and vote are required." }, { status: 400 });
    }

    const app = db.prepare("SELECT * FROM mentor_applications WHERE id = ?").get(applicationId) as any;
    if (!app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (vote === "for") {
      db.prepare(`
        UPDATE mentor_applications SET council_votes_for = council_votes_for + 1 WHERE id = ?
      `).run(applicationId);
    } else {
      db.prepare(`
        UPDATE mentor_applications SET council_votes_against = council_votes_against + 1 WHERE id = ?
      `).run(applicationId);
    }

    const updated = db.prepare("SELECT * FROM mentor_applications WHERE id = ?").get(applicationId) as any;

    // If 3+ approvals and >= 10 yrs exp, auto-verify into the active mentor council
    if (updated.council_votes_for >= 3 && updated.experience_years >= 10) {
      db.prepare(`
        UPDATE mentor_applications SET verification_status = 'verified' WHERE id = ?
      `).run(applicationId);
    }

    return NextResponse.json({
      success: true,
      message: `Peer vote recorded for ${app.name}. Current status: ${updated.verification_status} (${updated.council_votes_for} approvals).`,
      votesFor: updated.council_votes_for,
      votesAgainst: updated.council_votes_against,
      verificationStatus: updated.verification_status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
