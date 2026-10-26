import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { getGroqApiKey, getStudentRichLedger, retrieveKnowledgeChunks } from "@/lib/agent/groq";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { targetMilestone, timeframeWeeks } = body;

    if (!targetMilestone) {
      return NextResponse.json({ error: "Target milestone is required." }, { status: 400 });
    }

    const ledger = getStudentRichLedger(user.id);
    const ragKnowledge = retrieveKnowledgeChunks(targetMilestone);

    let generatedGoal = {
      title: `Secure ${targetMilestone}`,
      targetDate: new Date(Date.now() + (timeframeWeeks || 12) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      tasks: [
        {
          title: `Set up local benchmark test harness for ${targetMilestone}`,
          desc: "Initialize repository, configure linting, CI workflow, and create modular test scaffolding.",
          minutes: 45,
          prereq: "Git & Local Development Setup",
        },
        {
          title: "Build core architectural milestone & data models",
          desc: "Implement database schema, transaction isolation, or primary API endpoint logic with tests.",
          minutes: 60,
          prereq: "Architecture Spec Drafted",
        },
        {
          title: "Optimize throughput and write stress-test harness",
          desc: "Simulate concurrent load, identify lock contention or latency bottlenecks, and fix them.",
          minutes: 45,
          prereq: "Core API Operational",
        },
        {
          title: "Submit verifiable artifact brief to Beacon Passport",
          desc: "Document architecture in README, deploy live demo, and trigger Beacon AI verification audit.",
          minutes: 30,
          prereq: "Code Cleaned and Documented",
        },
      ],
    };

    const apiKey = getGroqApiKey(user.id);
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are Beacon AI's Semester Roadmap Generator.
Student:
- Name: ${ledger.fullName}
- College: ${ledger.college || "Undergraduate"}
- Degree: ${ledger.degree || "Computer Science"}
- Verified Skills: ${ledger.skills.map((s) => s.name).join(", ") || "Foundations"}
- Master Resume: ${ledger.primaryResume?.summary || "Active Student"}

Target Career Goal / Opportunity: "${targetMilestone}"
Timeframe: ${timeframeWeeks || 12} weeks

RELEVANT OPPORTUNITY & COURSE RADAR:
${ragKnowledge}

Create a personalized, 4-stage execution roadmap of bite-sized, high-leverage engineering milestones (30 to 60 mins each).
Respond ONLY with a valid JSON object matching this schema:
{
  "goalTitle": "Concise professional goal title (e.g. 'Crack Razorpay Payments Platform Internship' or 'Smart India Hackathon Finalist')",
  "targetDate": "YYYY-MM-DD (approx ${timeframeWeeks || 12} weeks from today)",
  "tasks": [
    {
      "title": "Actionable task 1 title",
      "desc": "1-2 sentences with concrete tools, commands, or concepts to master",
      "minutes": 45,
      "prereq": "None or specific prerequisite"
    },
    {
      "title": "Actionable task 2 title",
      "desc": "1-2 sentences with concrete tools, commands, or concepts to master",
      "minutes": 60,
      "prereq": "Prerequisite from task 1"
    },
    {
      "title": "Actionable task 3 title",
      "desc": "1-2 sentences with concrete tools, commands, or concepts to master",
      "minutes": 45,
      "prereq": "Prerequisite from task 2"
    },
    {
      "title": "Actionable task 4 title",
      "desc": "1-2 sentences on packaging evidence into their Beacon Passport",
      "minutes": 30,
      "prereq": "Prerequisite from task 3"
    }
  ]
}`;

        const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"];
        for (const model of models) {
          try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey.trim()}`,
              },
              body: JSON.stringify({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.35,
              }),
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              const rawContent = data.choices?.[0]?.message?.content || "{}";
              const cleaned = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.goalTitle && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
                generatedGoal = {
                  title: parsed.goalTitle,
                  targetDate: parsed.targetDate || generatedGoal.targetDate,
                  tasks: parsed.tasks,
                };
                break;
              }
            }
          } catch {}
        }
      } catch (err) {
        console.error("Roadmap Groq generator fallback:", err);
      }
    }

    // Insert into database
    const goalId = `goal_${Date.now()}`;
    db.prepare(`
      INSERT INTO goals (id, user_id, title, category, target_date, status, progress, reasoning)
      VALUES (?, ?, ?, 'Career Milestone', ?, 'active', 0, ?)
    `).run(
      goalId,
      user.id,
      generatedGoal.title,
      generatedGoal.targetDate,
      `Personalized semester roadmap generated by Beacon AI for ${ledger.fullName}.`
    );

    const insertTask = db.prepare(`
      INSERT INTO learning_tasks (id, user_id, goal_id, title, description, estimated_minutes, prerequisite, status, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'todo', ?)
    `);

    let order = 0;
    for (const t of generatedGoal.tasks) {
      insertTask.run(
        `tsk_${Date.now()}_${order}`,
        user.id,
        goalId,
        t.title,
        t.desc,
        t.minutes || 45,
        t.prereq || null,
        order++
      );
    }

    // Telemetry
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      user.id,
      "roadmap_generated",
      `AI Semester Roadmap Created: ${generatedGoal.title}`,
      `Generated 4 structured milestone tasks tailored to verified student record.`,
      JSON.stringify({ goalId, title: generatedGoal.title, count: generatedGoal.tasks.length })
    );

    return NextResponse.json({
      success: true,
      goalId,
      goal: generatedGoal,
      message: "AI Semester Roadmap generated and saved to your ledger.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
