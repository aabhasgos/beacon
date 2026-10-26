import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const body = await request.json();
    const { masterclassId } = body;

    if (!masterclassId) {
      return NextResponse.json({ error: "Masterclass ID is required." }, { status: 400 });
    }

    const mc = db.prepare("SELECT * FROM mentor_masterclasses WHERE id = ?").get(masterclassId) as any;
    if (!mc) {
      return NextResponse.json({ error: "Masterclass not found." }, { status: 404 });
    }

    if (mc.attendees_count >= mc.max_capacity) {
      return NextResponse.json({ error: "This masterclass is at maximum capacity." }, { status: 400 });
    }

    // Increment attendees count
    db.prepare(`
      UPDATE mentor_masterclasses SET attendees_count = attendees_count + 1 WHERE id = ?
    `).run(masterclassId);

    // Record activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "masterclass_rsvp",
      `RSVP Confirmed: ${mc.title}`,
      `Led by ${mc.mentor_name} (${mc.mentor_company}). Calendar invite reserved.`
    );

    return NextResponse.json({
      success: true,
      message: `Reserved seat for ${mc.title}! Meeting access link: ${mc.meeting_url}`,
      meetingUrl: mc.meeting_url,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
