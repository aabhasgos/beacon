import { NextResponse } from "next/server";
import db, { ensureUserExists } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);

    const projects = db.prepare(`
      SELECT * FROM projects 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId) as any[];

    return NextResponse.json({ projects: projects || [] });
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
    const { title, category, description, repositoryUrl, liveUrl } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const projectId = `proj_${Date.now()}`;
    const rubricScore = 85; // Initial pending baseline rubric
    const status = "In Review";

    db.prepare(`
      INSERT INTO projects (
        id, user_id, title, category, description, repository_url, live_url, rubric_score, evidence_notes, status, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      projectId,
      userId,
      title.trim(),
      category || "General Software",
      description.trim(),
      repositoryUrl?.trim() || null,
      liveUrl?.trim() || null,
      rubricScore,
      "Submitted artifact brief. Ready for Beacon AI architectural review.",
      status
    );

    // Activity event
    try {
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `act_${Date.now()}`,
        userId,
        "project_added",
        `Project Brief Added: ${title}`,
        `Category: ${category || "General Software"}. Attached to student evidence vault.`,
        JSON.stringify({ projectId, repositoryUrl, category })
      );
    } catch (e) {}

    return NextResponse.json({
      success: true,
      projectId,
      message: "Project successfully registered in evidence vault.",
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
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    db.prepare("DELETE FROM projects WHERE id = ? AND user_id = ?").run(projectId, userId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
