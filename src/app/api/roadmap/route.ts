import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ goals: [], tasks: [], profileIntelligence: null });
    }

    const goals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(user.id) as any[];
    const tasks = db.prepare("SELECT * FROM learning_tasks WHERE user_id = ? ORDER BY order_index ASC").all(user.id) as any[];

    // Fetch student's extracted NLP intelligence from primary resume and skills
    const primaryResume = db.prepare(`
      SELECT * FROM resumes 
      WHERE user_id = ? 
      ORDER BY is_primary DESC, uploaded_at DESC 
      LIMIT 1
    `).get(user.id) as any;

    let parsedSkills: string[] = [];
    if (primaryResume?.parsed_skills) {
      try {
        parsedSkills = JSON.parse(primaryResume.parsed_skills);
      } catch {}
    }

    const verifiedSkills = db.prepare(`
      SELECT skill_name, category, provenance 
      FROM skills 
      WHERE user_id = ?
    `).all(user.id) as any[];

    // Extract all distinct skill names
    const allSkillsSet = new Set<string>(parsedSkills);
    verifiedSkills.forEach((s) => allSkillsSet.add(s.skill_name));
    const combinedSkills = Array.from(allSkillsSet);

    // Calculate dynamic diagnostic readiness audit score based on real data
    const projectCount = (db.prepare("SELECT COUNT(*) as cnt FROM projects WHERE user_id = ?").get(user.id) as any)?.cnt || 0;
    const certCount = (db.prepare("SELECT COUNT(*) as cnt FROM certificates WHERE user_id = ?").get(user.id) as any)?.cnt || 0;
    const expCount = (db.prepare("SELECT COUNT(*) as cnt FROM student_experiences WHERE user_id = ?").get(user.id) as any)?.cnt || 0;

    let calculatedAudit = 70;
    if (combinedSkills.length >= 10) calculatedAudit += 10;
    else if (combinedSkills.length >= 5) calculatedAudit += 6;
    if (projectCount >= 2) calculatedAudit += 8;
    else if (projectCount >= 1) calculatedAudit += 5;
    if (expCount >= 2) calculatedAudit += 8;
    else if (expCount >= 1) calculatedAudit += 4;
    if (certCount >= 1) calculatedAudit += 4;
    calculatedAudit = Math.min(96, calculatedAudit);

    const profileIntelligence = {
      auditScore: calculatedAudit,
      resumeFilename: primaryResume?.file_name || "Aabhas_Resume.docx",
      resumeUploadedAt: primaryResume?.uploaded_at || null,
      extractedSkillsCount: combinedSkills.length,
      extractedSkills: combinedSkills.slice(0, 16),
      recommendationReason: `Grounded in your ${combinedSkills.length} NLP-extracted skills (${combinedSkills.slice(0, 4).join(", ")}) and ${projectCount} verified projects. Tasks bridge low-latency algorithms, concurrency invariants, and production telemetry.`,
      targetGoal: goals[0]?.title || "Google / Razorpay Systems & SIH 2026",
    };

    return NextResponse.json({
      goals: goals || [],
      tasks: tasks || [],
      profileIntelligence,
    });
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
