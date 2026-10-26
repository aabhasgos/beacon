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
    const { score, totalQuestions, topic } = body;

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const skillName = topic || "Generative AI & React Architecture";
    const skillId = `sk_acad_${Date.now()}`;

    // Update or insert skill claim
    const existing = db.prepare("SELECT id FROM skill_claims WHERE user_id = ? AND skill_name = ?").get(user.id, skillName) as any;
    if (existing) {
      db.prepare(`
        UPDATE skill_claims 
        SET level = ?, provenance = 'Assessed', evidence_notes = ?, verified_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        percentage >= 80 ? "Advanced" : "Intermediate",
        `Scored ${score}/${totalQuestions} (${percentage}%) on Beacon Academy Diagnostic.`,
        existing.id
      );
    } else {
      db.prepare(`
        INSERT INTO skill_claims (id, user_id, skill_id, skill_name, level, provenance, evidence_notes, verified_at)
        VALUES (?, ?, ?, ?, ?, 'Assessed', ?, CURRENT_TIMESTAMP)
      `).run(
        skillId,
        user.id,
        skillId,
        skillName,
        percentage >= 80 ? "Advanced" : "Intermediate",
        `Scored ${score}/${totalQuestions} (${percentage}%) on Beacon Academy Diagnostic.`
      );
    }

    // Telemetry event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user.id,
      "diagnostic_completed",
      `Completed Skill Diagnostic: ${skillName}`,
      `Score: ${score}/${totalQuestions} (${percentage}%). Assessed badge added to Student Passport.`,
      JSON.stringify({ score, totalQuestions, percentage, topic })
    );

    // Memory for RAG
    db.prepare(`
      INSERT INTO memories (id, user_id, memory_key, memory_value, source, confidence)
      VALUES (?, ?, ?, ?, 'Academy Diagnostic', 0.95)
    `).run(
      `mem_diag_${Date.now()}`,
      user.id,
      `diagnostic_${Date.now()}`,
      `Student tested on ${skillName} and scored ${score}/${totalQuestions} (${percentage}%).`
    );

    return NextResponse.json({
      success: true,
      percentage,
      message: "Skill badge successfully awarded to your Student Passport.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
