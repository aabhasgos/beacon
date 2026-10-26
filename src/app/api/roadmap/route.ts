import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ goals: [], tasks: [] });
    }

    const goals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(user.id);
    const tasks = db.prepare("SELECT * FROM learning_tasks WHERE user_id = ? ORDER BY order_index ASC").all(user.id);

    return NextResponse.json({ goals: goals || [], tasks: tasks || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, estimatedMinutes, deadline, prerequisite, goalId } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const taskId = `tsk_${Date.now()}`;
    const maxOrder = db.prepare("SELECT MAX(order_index) as max_ord FROM learning_tasks WHERE user_id = ?").get(user.id) as any;
    const nextOrder = (maxOrder?.max_ord ?? 0) + 1;

    db.prepare(`
      INSERT INTO learning_tasks (id, user_id, goal_id, title, description, estimated_minutes, deadline, prerequisite, status, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?)
    `).run(
      taskId,
      user.id,
      goalId || null,
      title,
      description || "Custom execution checklist task.",
      estimatedMinutes || 45,
      deadline || null,
      prerequisite || null,
      nextOrder
    );

    // Activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user.id,
      "task_created",
      `Task Added: ${title}`,
      `Estimated ${estimatedMinutes || 45} minutes. Added to execution roadmap.`
    );

    return NextResponse.json({ success: true, taskId, message: "Task added to roadmap." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, status, deadline } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    if (status) {
      const completedAt = status === "completed" ? new Date().toISOString() : null;
      db.prepare(`
        UPDATE learning_tasks SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?
      `).run(status, completedAt, taskId, user.id);

      if (status === "completed") {
        const task = db.prepare("SELECT title FROM learning_tasks WHERE id = ?").get(taskId) as any;
        db.prepare(`
          INSERT INTO activity_events (id, user_id, event_type, title, description)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          `act_${Date.now()}`,
          user.id,
          "task_completed",
          `Completed: ${task?.title || "Task"}`,
          "Meaningful progress recorded in Beacon student ledger."
        );
      }
    }

    if (deadline !== undefined) {
      db.prepare("UPDATE learning_tasks SET deadline = ? WHERE id = ? AND user_id = ?").run(deadline, taskId, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
