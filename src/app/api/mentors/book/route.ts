import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    const userName = user?.full_name || "Verified Student";
    const userEmail = user?.email || "student@beacon.dev";

    const body = await request.json();
    const { mentorId, slotTime, topic, notes } = body;

    if (!mentorId || !slotTime || !topic) {
      return NextResponse.json({ error: "Mentor, slot time, and topic are required." }, { status: 400 });
    }

    const mentor = db.prepare("SELECT name, company FROM mentors WHERE id = ?").get(mentorId) as any;
    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found." }, { status: 404 });
    }

    const bookingId = `book_${Date.now()}`;
    const meetingLink = `https://meet.google.com/bcn-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;

    db.prepare(`
      INSERT INTO mentor_bookings (
        id, mentor_id, student_id, slot_time, topic, student_name, student_email, status, meeting_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `).run(
      bookingId,
      mentorId,
      userId,
      slotTime,
      topic,
      userName,
      userEmail,
      meetingLink
    );

    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "mentor_office_hours_booked",
      `1-on-1 Office Hours Confirmed with ${mentor.name}`,
      `Confirmed slot: ${slotTime}. Topic: ${topic}. Pro-bono calendar invite dispatched.`
    );

    return NextResponse.json({
      success: true,
      bookingId,
      meetingLink,
      message: `Office hours confirmed with ${mentor.name}! Calendar invite dispatched.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
