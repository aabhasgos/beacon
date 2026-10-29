import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    // Allow admin or student testing mode
    const studentCount = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'student'").get() as any)?.count || 0;
    const mentorCount = (db.prepare("SELECT count(*) as count FROM mentors").get() as any)?.count || 0;
    const recruiterCount = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'recruiter'").get() as any)?.count || 0;
    const opportunityCount = (db.prepare("SELECT count(*) as count FROM opportunities").get() as any)?.count || 0;
    const projectCount = (db.prepare("SELECT count(*) as count FROM projects").get() as any)?.count || 0;
    const certCount = (db.prepare("SELECT count(*) as count FROM certificates").get() as any)?.count || 0;
    const eventCount = (db.prepare("SELECT count(*) as count FROM activity_events").get() as any)?.count || 0;

    const mentorApps = db.prepare("SELECT * FROM mentor_applications ORDER BY created_at DESC LIMIT 15").all() as any[];
    const students = db.prepare("SELECT id, email, full_name, college, degree, graduation_year, cgpa, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC LIMIT 15").all() as any[];
    const opportunities = db.prepare("SELECT id, title, company, role_type, location, stipend, status, created_at FROM opportunities ORDER BY created_at DESC LIMIT 15").all() as any[];
    const recentEvents = db.prepare("SELECT * FROM activity_events ORDER BY created_at DESC LIMIT 25").all() as any[];

    return NextResponse.json({
      metrics: {
        studentCount,
        mentorCount,
        recruiterCount,
        opportunityCount,
        projectCount,
        certCount,
        eventCount,
      },
      mentorApps,
      students,
      opportunities,
      recentEvents,
      adminUser: (user as any)?.role === "admin" ? user : { full_name: "Master Administrator", email: "admin@beacon.network", role: "admin" },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
