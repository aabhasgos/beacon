import { NextResponse } from "next/server";
import db, { ensureUserExists } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);

    const rows = db.prepare(`
      SELECT * FROM student_experiences 
      WHERE user_id = ? 
      ORDER BY is_current DESC, created_at DESC
    `).all(userId) as any[];

    const experiences = rows.map((r) => ({
      ...r,
      is_current: Boolean(r.is_current),
      is_remote: Boolean(r.is_remote),
      skills_used: r.skills_used ? JSON.parse(r.skills_used) : [],
    }));

    return NextResponse.json({ experiences });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);
    const body = await request.json();

    const {
      title,
      company,
      employment_type = "Internship",
      location = "Hybrid",
      is_remote = false,
      is_current = false,
      start_date,
      end_date,
      description = "",
      skills_used = [],
      proof_url = "",
    } = body;

    if (!title || !company || !start_date) {
      return NextResponse.json(
        { error: "Title, Company name, and Start Date are required fields." },
        { status: 400 }
      );
    }

    const expId = `exp_${Date.now()}`;
    const skillsJson = Array.isArray(skills_used) ? JSON.stringify(skills_used) : JSON.stringify([]);

    db.prepare(`
      INSERT INTO student_experiences (
        id, user_id, title, company, employment_type, location, is_remote, is_current, start_date, end_date, description, skills_used, proof_url, verified_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      expId,
      userId,
      title.trim(),
      company.trim(),
      employment_type,
      location.trim(),
      is_remote ? 1 : 0,
      is_current ? 1 : 0,
      start_date.trim(),
      is_current ? "Present" : (end_date || "").trim(),
      description.trim(),
      skillsJson,
      proof_url.trim(),
      proof_url ? "Source-Backed Proof" : "Self-Declared"
    );

    // Record activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "experience_added",
      `New Experience Added: ${title}`,
      `Added ${employment_type} at ${company} (${start_date} – ${is_current ? "Present" : end_date || ""}).`
    );

    const created = db.prepare("SELECT * FROM student_experiences WHERE id = ?").get(expId) as any;
    return NextResponse.json({
      success: true,
      experience: {
        ...created,
        is_current: Boolean(created.is_current),
        is_remote: Boolean(created.is_remote),
        skills_used: created.skills_used ? JSON.parse(created.skills_used) : [],
      },
      message: "Experience logged to Student Passport successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);
    const body = await request.json();

    const {
      id,
      title,
      company,
      employment_type = "Internship",
      location = "Hybrid",
      is_remote = false,
      is_current = false,
      start_date,
      end_date,
      description = "",
      skills_used = [],
      proof_url = "",
    } = body;

    if (!id || !title || !company || !start_date) {
      return NextResponse.json(
        { error: "Experience ID, Title, Company name, and Start Date are required fields." },
        { status: 400 }
      );
    }

    const existing = db.prepare("SELECT * FROM student_experiences WHERE id = ? AND user_id = ?").get(id, userId) as any;
    if (!existing) {
      return NextResponse.json({ error: "Experience record not found or unauthorized." }, { status: 404 });
    }

    const skillsJson = Array.isArray(skills_used) ? JSON.stringify(skills_used) : JSON.stringify([]);
    const verifiedStatus = proof_url ? "Source-Backed Proof" : "Self-Declared";

    db.prepare(`
      UPDATE student_experiences SET
        title = ?,
        company = ?,
        employment_type = ?,
        location = ?,
        is_remote = ?,
        is_current = ?,
        start_date = ?,
        end_date = ?,
        description = ?,
        skills_used = ?,
        proof_url = ?,
        verified_status = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title.trim(),
      company.trim(),
      employment_type,
      location.trim(),
      is_remote ? 1 : 0,
      is_current ? 1 : 0,
      start_date.trim(),
      is_current ? "Present" : (end_date || "").trim(),
      description.trim(),
      skillsJson,
      proof_url.trim(),
      verifiedStatus,
      id,
      userId
    );

    // Record activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "experience_updated",
      `Experience Updated: ${title}`,
      `Updated ${employment_type} at ${company} (${start_date} – ${is_current ? "Present" : end_date || ""}).`
    );

    const updated = db.prepare("SELECT * FROM student_experiences WHERE id = ?").get(id) as any;
    return NextResponse.json({
      success: true,
      experience: {
        ...updated,
        is_current: Boolean(updated.is_current),
        is_remote: Boolean(updated.is_remote),
        skills_used: updated.skills_used ? JSON.parse(updated.skills_used) : [],
      },
      message: "Experience updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Experience ID is required" }, { status: 400 });
    }

    db.prepare("DELETE FROM student_experiences WHERE id = ? AND user_id = ?").run(id, userId);
    return NextResponse.json({ success: true, message: "Experience removed" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
