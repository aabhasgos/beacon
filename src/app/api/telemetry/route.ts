import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    const body = await request.json().catch(() => ({}));
    const { eventType, title, description, metadata } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    const eventId = `act_${Date.now()}`;
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      userId,
      eventType,
      title || "Student Action",
      description || "",
      metadata ? JSON.stringify(metadata) : null
    );

    // If it's a hackathon registration or important interaction, update memories for RAG
    if (eventType === "hackathon_redirect" && metadata?.hackathonTitle) {
      try {
        db.prepare(`
          INSERT INTO memories (id, user_id, memory_key, memory_value, source, confidence)
          VALUES (?, ?, ?, ?, 'HackathonInteraction', 1.0)
        `).run(
          `mem_${Date.now()}`,
          userId,
          `hackathon_interest_${metadata.hackathonId || Date.now()}`,
          `Student expressed strong interest in '${metadata.hackathonTitle}' organized by ${metadata.organization || "host"} and clicked through to the official portal.`
        );
      } catch (e) {}
    }

    return NextResponse.json({ success: true, eventId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
