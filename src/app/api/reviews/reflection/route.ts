import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { reflection } = body;

    if (!reflection || !reflection.trim()) {
      return NextResponse.json({ error: "Reflection text cannot be empty." }, { status: 400 });
    }

    // Save to memories for RAG
    db.prepare(`
      INSERT INTO memories (id, user_id, memory_key, memory_value, source, confidence)
      VALUES (?, ?, ?, ?, 'Weekly Reflection', 0.95)
    `).run(
      `mem_ref_${Date.now()}`,
      user.id,
      `weekly_reflection_${new Date().toISOString().split("T")[0]}`,
      reflection.trim()
    );

    // Save to activity events
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user.id,
      "weekly_reflection",
      "Weekly Reflection Logged",
      reflection.trim(),
      JSON.stringify({ recordedAt: new Date().toISOString() })
    );

    return NextResponse.json({
      success: true,
      message: "Weekly reflection stored in your private student ledger.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
