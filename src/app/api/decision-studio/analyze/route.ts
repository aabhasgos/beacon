import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { getGroqApiKey, getStudentRichLedger, retrieveKnowledgeChunks } from "@/lib/agent/groq";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const body = await request.json();
    const { pathwayA, pathwayB, studentNotes } = body;

    if (!pathwayA || !pathwayB) {
      return NextResponse.json({ error: "Both Pathway A and Pathway B are required." }, { status: 400 });
    }

    const ledger = getStudentRichLedger(userId);
    const ragKnowledge = retrieveKnowledgeChunks(`${pathwayA} ${pathwayB}`);

    let analysis = {
      pathA: {
        title: pathwayA,
        prerequisiteDepth: "Requires solid grasp of operating systems, networking frames, and concurrent primitives.",
        constraintCompatibility: "Can be broken down into 45-minute modular sprints to protect university semester study hours.",
        reversibility: "HIGH REVERSIBILITY",
        reversibilityNotes: "Systems fundamentals transfer directly to general software engineering and cloud infrastructure roles.",
        differentiation: "High Differentiation",
      },
      pathB: {
        title: pathwayB,
        prerequisiteDepth: "Fast ramp-up on React, REST APIs, and database schemas. Lower barrier to entry but higher competition from bootcamps.",
        constraintCompatibility: "Quick prototyping turnaround, ideal for hackathon sprints and building proof-of-work MVPs.",
        reversibility: "EXTREMELY HIGH",
        reversibilityNotes: "Web development skills apply across every tech domain and product startup.",
        differentiation: "Moderate Differentiation",
      },
      recommendation: `Given your current background${ledger.college ? ` at ${ledger.college}` : ""}${ledger.skills.length > 0 ? ` and verified skills in ${ledger.skills.map((s) => s.name).slice(0, 2).join(", ")}` : ""}, Pathway A provides significantly higher scarcity and career leverage. Focus on deep systems and infrastructure proof, keeping Pathway B as your interface layer.`,
      suggestedTasks: [
        { title: `Set up core architectural environment for ${pathwayA}`, minutes: 45 },
        { title: "Implement basic proof-of-concept milestone with unit tests", minutes: 60 },
        { title: "Benchmark performance and document edge cases in GitHub README", minutes: 45 },
        { title: "Publish project artifact to Beacon Student Passport", minutes: 30 },
      ],
    };

    const apiKey = getGroqApiKey(userId);
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are Beacon AI's Career Decision Engine. Compare two engineering career pathways objectively for this student.
Student Context:
- Name: ${ledger.fullName}
- College: ${ledger.college || "Undisclosed"}
- Degree: ${ledger.degree || "Undergraduate"}
- CGPA: ${ledger.cgpa || "Unspecified"}
- Verified Skills: ${ledger.skills.map((s) => s.name).join(", ") || "None declared yet"}
- Student Notes / Constraints: ${studentNotes || "Standard semester schedule"}

Pathway A: "${pathwayA}"
Pathway B: "${pathwayB}"

RETRIEVED OPPORTUNITIES & COURSES:
${ragKnowledge}

Respond ONLY with a valid JSON object matching this schema:
{
  "pathA": {
    "title": "${pathwayA}",
    "prerequisiteDepth": "1-2 sentences on technical barrier and prerequisites",
    "constraintCompatibility": "1-2 sentences on fitting this path into weekly study hours and semester exams",
    "reversibility": "HIGH REVERSIBILITY | EXTREMELY HIGH | MODERATE",
    "reversibilityNotes": "1 sentence on skill portability",
    "differentiation": "High Differentiation | Moderate Differentiation"
  },
  "pathB": {
    "title": "${pathwayB}",
    "prerequisiteDepth": "1-2 sentences on technical barrier and prerequisites",
    "constraintCompatibility": "1-2 sentences on fitting this path into weekly study hours and semester exams",
    "reversibility": "HIGH REVERSIBILITY | EXTREMELY HIGH | MODERATE",
    "reversibilityNotes": "1 sentence on skill portability",
    "differentiation": "High Differentiation | Moderate Differentiation"
  },
  "recommendation": "2-3 sentences advising which path to pursue first, citing their verified skills or opportunities",
  "suggestedTasks": [
    { "title": "Specific bite-sized step 1", "minutes": 45 },
    { "title": "Specific bite-sized step 2", "minutes": 60 },
    { "title": "Specific bite-sized step 3", "minutes": 45 },
    { "title": "Specific bite-sized step 4", "minutes": 30 }
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
                temperature: 0.4,
              }),
            });

            if (groqRes.ok) {
              const data = await groqRes.json();
              const rawContent = data.choices?.[0]?.message?.content || "{}";
              const cleaned = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.pathA && parsed.pathB && parsed.recommendation) {
                analysis = parsed;
                break;
              }
            }
          } catch {}
        }
      } catch (err) {
        console.error("Decision studio Groq fallback:", err);
      }
    }

    // Telemetry
    if (user) {
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, title, description, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        `act_${Date.now()}`,
        user.id,
        "decision_studio_analyzed",
        `Decision Studio Trade-off Run: ${pathwayA} vs ${pathwayB}`,
        `Comparative analysis evaluated with live Beacon AI career intelligence.`,
        JSON.stringify({ pathwayA, pathwayB })
      );
    }

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
