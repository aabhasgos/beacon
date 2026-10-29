import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const body = await request.json();
    const { applicationId, status = "verified" } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    db.prepare(`
      UPDATE mentor_applications SET
        verification_status = ?,
        council_votes_for = council_votes_for + 1
      WHERE id = ?
    `).run(status, applicationId);

    // If verified, ensure mentor row exists and user role is mentor
    const app = db.prepare("SELECT * FROM mentor_applications WHERE id = ?").get(applicationId) as any;
    if (app && status === "verified") {
      if (app.user_id) {
        db.prepare("UPDATE users SET role = 'mentor' WHERE id = ?").run(app.user_id);
      }
      const mentorId = `men_${app.user_id ? app.user_id.replace("usr_", "") : Date.now()}`;
      const existing = db.prepare("SELECT id FROM mentors WHERE name = ? OR id = ?").get(app.name, mentorId);
      if (!existing) {
        db.prepare(`
          INSERT INTO mentors (
            id, name, title, company, bio, verified_level, domains, availability, hourly_rate, experience_years, linkedin_url, career_start_year
          ) VALUES (?, ?, ?, ?, ?, '10+ Yr Verified Council Fellow', ?, '3 slots this week', 'Free for Students', ?, ?, ?)
        `).run(
          mentorId,
          app.name,
          app.title,
          app.company,
          app.bio || "Senior technology practitioner.",
          app.domains || JSON.stringify(["Systems", "Architecture"]),
          app.experience_years || 10,
          app.linkedin_url || "https://linkedin.com",
          app.career_start_year || 2014
        );
      }
    }

    // Record activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user?.id || "usr_admin",
      "mentor_verified",
      `Mentor Credential ${status === "verified" ? "Approved" : "Updated"}`,
      `Application ${applicationId} (${app?.name || "Practitioner"}) updated to ${status}.`
    );

    return NextResponse.json({ success: true, message: `Mentor application ${status} successfully.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
