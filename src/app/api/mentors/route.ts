import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const mentors = db.prepare("SELECT * FROM mentors").all() as any[];
    const parsedMentors = mentors.map((m) => {
      let domains: string[] = [];
      try {
        domains = JSON.parse(m.domains);
      } catch (e) {
        domains = [];
      }
      return {
        ...m,
        experience_years: m.experience_years || 10,
        career_start_year: m.career_start_year || 2014,
        linkedin_url: m.linkedin_url || "https://linkedin.com",
        domains,
      };
    });

    const requests = db.prepare(`
      SELECT mr.*, m.name as mentor_name, m.title as mentor_title, m.company
      FROM mentor_requests mr
      JOIN mentors m ON mr.mentor_id = m.id
      WHERE mr.user_id = ?
      ORDER BY mr.created_at DESC
    `).all(userId);

    // Phase 3: Fetch Masterclasses
    const masterclasses = db.prepare(`
      SELECT * FROM mentor_masterclasses
      ORDER BY scheduled_at ASC
    `).all() as any[];

    // Phase 3: Fetch Architecture Articles
    const articles = db.prepare(`
      SELECT * FROM mentor_articles
      ORDER BY published_at DESC
    `).all() as any[];

    const parsedArticles = articles.map((a) => {
      let tags: string[] = [];
      try {
        tags = JSON.parse(a.tags);
      } catch (e) {
        tags = [];
      }
      return { ...a, tags };
    });

    // Phase 3: Fetch Council Applications
    const councilApplications = db.prepare(`
      SELECT * FROM mentor_applications
      ORDER BY created_at DESC
    `).all() as any[];

    const parsedCouncil = councilApplications.map((c) => {
      let domains: string[] = [];
      try {
        domains = JSON.parse(c.domains);
      } catch (e) {
        domains = [];
      }
      return { ...c, domains };
    });

    // Phase 3: Fetch User Bookings
    const bookings = db.prepare(`
      SELECT mb.*, m.name as mentor_name, m.title as mentor_title, m.company as mentor_company, m.avatar_url as mentor_avatar
      FROM mentor_bookings mb
      JOIN mentors m ON mb.mentor_id = m.id
      WHERE mb.student_id = ?
      ORDER BY mb.created_at DESC
    `).all(userId);

    return NextResponse.json({
      mentors: parsedMentors,
      requests,
      masterclasses,
      articles: parsedArticles,
      councilApplications: parsedCouncil,
      bookings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const body = await request.json();
    const { mentorId, topic, studentBrief, artifactLink } = body;

    if (!mentorId || !topic || !studentBrief) {
      return NextResponse.json({ error: "Mentor, topic, and brief are required." }, { status: 400 });
    }

    const reqId = `mreq_${Date.now()}`;
    db.prepare(`
      INSERT INTO mentor_requests (id, user_id, mentor_id, topic, student_brief, artifact_link, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(reqId, userId, mentorId, topic, studentBrief, artifactLink || null);

    const mentor = db.prepare("SELECT name FROM mentors WHERE id = ?").get(mentorId) as any;

    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "mentor_brief_sent",
      `Mentor Brief Sent to ${mentor?.name || "Mentor"}`,
      `Topic: ${topic}. Only permissioned artifact evidence was included in the brief.`
    );

    return NextResponse.json({ success: true, reqId, message: "Mentor brief delivered." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
