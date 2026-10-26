import { NextResponse } from "next/server";
import db from "@/lib/db";
import { askBeaconAI, AgentMessage } from "@/lib/agent/groq";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const firstUser = (db.prepare("SELECT id FROM users LIMIT 1").get() as any)?.id;
    const userId = user?.id || firstUser || "usr_student_01";

    const history = db.prepare(`
      SELECT role, content, created_at, metadata_json
      FROM conversations
      WHERE user_id = ?
      ORDER BY created_at ASC
      LIMIT 50
    `).all(userId);

    return NextResponse.json({ messages: history });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const body = await request.json();
    const { message, groqApiKey } = body;

    const firstUser = (db.prepare("SELECT id FROM users LIMIT 1").get() as any)?.id;
    const userId = user?.id || body.userId || firstUser || "usr_student_01";

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    db.prepare(`
      INSERT INTO conversations (id, user_id, role, content)
      VALUES (?, ?, 'user', ?)
    `).run(`msg_${Date.now()}_u`, userId, message);

    const recentDbMsgs = db.prepare(`
      SELECT role, content FROM conversations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId) as any[];

    const agentMsgs: AgentMessage[] = recentDbMsgs.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const result = await askBeaconAI(agentMsgs, userId, groqApiKey);

    db.prepare(`
      INSERT INTO conversations (id, user_id, role, content, metadata_json)
      VALUES (?, ?, 'assistant', ?, ?)
    `).run(`msg_${Date.now()}_a`, userId, result.text, JSON.stringify({ source: result.source }));

    return NextResponse.json({
      text: result.text,
      source: result.source,
      suggestedCourses: result.suggestedCourses || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
