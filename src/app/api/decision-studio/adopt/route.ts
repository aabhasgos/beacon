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
    const { targetGoalTitle, tasks } = body;

    if (!targetGoalTitle) {
      return NextResponse.json({ error: "Goal title is required." }, { status: 400 });
    }

    const goalId = `goal_${Date.now()}`;
    const targetDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 90 days out

    db.prepare(`
      INSERT INTO goals (id, user_id, title, category, target_date, status, progress, reasoning)
      VALUES (?, ?, ?, 'Engineering Milestone', ?, 'active', 0, 'Adopted directly from Beacon AI Decision Studio trade-off analysis.')
    `).run(goalId, user.id, targetGoalTitle, targetDate);

    if (Array.isArray(tasks) && tasks.length > 0) {
      const insertTask = db.prepare(`
        INSERT INTO learning_tasks (id, user_id, goal_id, title, description, estimated_minutes, status, order_index)
        VALUES (?, ?, ?, ?, 'Bite-sized milestone from Decision Studio.', ?, 'todo', ?)
      `);

      let ord = 0;
      for (const t of tasks) {
        insertTask.run(
          `tsk_${Date.now()}_${ord}`,
          user.id,
          goalId,
          t.title || "Milestone Task",
          t.minutes || 45,
          ord++
        );
      }
    }

    // Telemetry
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user.id,
      "roadmap_adopted",
      `Adopted Decision Pathway: ${targetGoalTitle}`,
      `Created target goal and ${tasks?.length || 0} milestone tasks in student Roadmap.`,
      JSON.stringify({ goalId, targetGoalTitle })
    );

    return NextResponse.json({
      success: true,
      goalId,
      message: "Target pathway and execution checklist adopted into your Roadmap.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
