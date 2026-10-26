import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);

    // 1. Live Activity Events (last 50)
    const events = db.prepare(`
      SELECT ae.*, u.full_name as user_name, u.email as user_email, u.college as user_college
      FROM activity_events ae
      LEFT JOIN users u ON ae.user_id = u.id
      ORDER BY ae.created_at DESC
      LIMIT 60
    `).all() as any[];

    // 2. Full Application Dossiers
    const applications = db.prepare(`
      SELECT a.*, o.title as role_title, o.organization as company, o.type as opp_type, o.stipend
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      ORDER BY a.applied_at DESC
      LIMIT 40
    `).all() as any[];

    // Parse screening answers
    const parsedApps = applications.map((app) => {
      let screening = {};
      try {
        if (app.screening_answers) screening = JSON.parse(app.screening_answers);
      } catch (e) {}
      return { ...app, screening };
    });

    // 3. AI Query / Chat Ledger
    const aiQueries = db.prepare(`
      SELECT c.*, u.full_name as user_name, u.email as user_email
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.role = 'user'
      ORDER BY c.created_at DESC
      LIMIT 30
    `).all() as any[];

    // 4. Summary stats
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    const totalApps = db.prepare("SELECT COUNT(*) as count FROM applications").get() as { count: number };
    const totalEvents = db.prepare("SELECT COUNT(*) as count FROM activity_events").get() as { count: number };
    const totalProjects = db.prepare("SELECT COUNT(*) as count FROM projects").get() as { count: number };

    return NextResponse.json({
      events,
      applications: parsedApps,
      aiQueries,
      stats: {
        students: totalStudents?.count || 0,
        applications: totalApps?.count || 0,
        events: totalEvents?.count || 0,
        projects: totalProjects?.count || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
