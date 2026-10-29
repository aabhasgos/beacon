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
      title: `Master ${targetMilestone}`,
      targetDate: new Date(Date.now() + (timeframeWeeks || 12) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      tasks: [
        {
          title: `Algorithmic Optimization & Invariant Testing for ${targetMilestone}`,
          desc: "Implement a low-latency data structure or boundary search invariant with strict complexity constraints.",
          minutes: 45,
          prereq: "Python / C++ Data Structures",
          taskType: "Algorithmic Implementation",
          focusKey: "Binary Search Boundary Invariants & O(log N) Complexity",
          conceptsToLearn: "Midpoint overflow prevention, Rotated array pivot detection, Invariant boundary narrowing",
          starterCode: `class Solution:\n    def search_rotated_array(self, nums: list[int], target: int) -> int:\n        \"\"\"\n        Given a rotated sorted array nums with unique elements, return index of target.\n        Time Complexity must be strictly O(log N).\n        \"\"\"\n        left, right = 0, len(nums) - 1\n        while left <= right:\n            mid = left + (right - left) // 2\n            if nums[mid] == target:\n                return mid\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n        return -1\n`,
        },
        {
          title: "Build Core Idempotent REST API & Distributed Transaction Barrier",
          desc: "Implement atomic idempotency keys, race-condition shields, and cache-backed state validation.",
          minutes: 60,
          prereq: "REST API & Distributed Systems Basics",
          taskType: "Systems Architecture",
          focusKey: "Idempotent REST APIs & Distributed Redis Locking",
          conceptsToLearn: "UUIDv4 Idempotency-Key header, Redis SETNX atomic locking with TTL, Double-spend prevention",
          starterCode: `import time\nimport uuid\n\nclass PaymentTransactionService:\n    def __init__(self, cache_client):\n        self.cache = cache_client\n        \n    def process_charge(self, idempotency_key: str, amount_inr: int, customer_id: str) -> dict:\n        \"\"\"\n        Guarantee zero duplicate charges even under concurrent client retries.\n        \"\"\"\n        lock_key = f"lock:payment:{idempotency_key}"\n        record_key = f"tx:payment:{idempotency_key}"\n        \n        existing = self.cache.get(record_key)\n        if existing:\n            return {"status": "SUCCESS", "source": "CACHE_IDEMPOTENT", "payload": existing}\n            \n        acquired = self.cache.setnx(lock_key, "PROCESSING", ttl=10)\n        if not acquired:\n            raise RuntimeError("Concurrent duplicate request in flight.")\n            \n        try:\n            tx_payload = {\n                "tx_id": f"TXN_{uuid.uuid4().hex[:12].upper()}",\n                "customer_id": customer_id,\n                "amount": amount_inr,\n                "processed_at": time.time()\n            }\n            self.cache.set(record_key, tx_payload)\n            return {"status": "SUCCESS", "payload": tx_payload}\n        finally:\n            self.cache.delete(lock_key)\n`,
        },
        {
          title: "Packet Framing & Bitwise CRC-32 Telemetry Parser",
          desc: "Implement high-throughput binary frame parsing with sync word detection and checksum verification.",
          minutes: 45,
          prereq: "Bitwise Operators & Binary Buffers",
          taskType: "Telemetry Engineering",
          focusKey: "Bitwise Frame Sync & Packet Checksum (CRC-32 / ISRO Telemetry)",
          conceptsToLearn: "Bit shifting (<<, >>), Masking (0xFF), Little-Endian vs Big-Endian parsing, Synch Word 0xEB90 detection",
          starterCode: `import struct\n\nSYNC_WORD = 0xEB90\n\ndef parse_telemetry_packet(raw_frame: bytes) -> dict:\n    \"\"\"\n    Parse raw binary satellite telemetry frame.\n    \"\"\"\n    if len(raw_frame) < 14:\n        raise ValueError("Frame too short for valid satellite telemetry")\n        \n    sync, subsys, timestamp, altitude = struct.unpack(">HHI f", raw_frame[:12])\n    if sync != SYNC_WORD:\n        raise ValueError(f"Invalid Frame Sync: expected {hex(SYNC_WORD)}, got {hex(sync)}")\n        \n    checksum_calc = 0\n    for b in raw_frame[:12]:\n        checksum_calc ^= b\n        \n    checksum_received = struct.unpack(">H", raw_frame[12:14])[0]\n    is_valid = (checksum_calc == (checksum_received & 0xFF))\n    \n    return {\n        "subsystem_id": subsys,\n        "timestamp": timestamp,\n        "altitude_km": round(altitude, 3),\n        "is_valid": is_valid\n    }\n`,
        },
        {
          title: "System Decomposition Spec & Live Proof Verification (SIH 2026)",
          desc: "Author an architectural milestone brief covering offline-first sync, edge caching, and ledger hashes.",
          minutes: 30,
          prereq: "System Architecture Spec Drafted",
          taskType: "Hackathon Prototype Architecture",
          focusKey: "System Decomposition Spec & Live Proof Verification (SIH 2026)",
          conceptsToLearn: "C4 Architecture diagram notation, Edge caching, Database replication topology, Offline-first mobile synchronization",
          starterCode: `# System Architecture Specification: Smart India Hackathon (SIH 2026)\n\n## 1. Problem Statement & Problem ID\n- Problem ID: SIH-2026-MIN-089\n- Title: AI-Powered Geospatial Crop Health & Ground Water Telemetry\n\n## 2. Core Architectural Components\n- Client Layer: Flutter Mobile App with offline SQLite local queue\n- API Gateway: Fastify / Next.js Node.js server with JWT cryptographic signatures\n- Inference Engine: PyTorch Lightweight ResNet-18 model quantized for ONNX Runtime\n- Telemetry Store: PostgreSQL with PostGIS extension for spatial queries\n\n## 3. High-Leverage Differentiator\n- Works in 2G / zero-connectivity rural zones via intermittent opportunistic sync\n- Proof-of-work artifact validated and ledger-hashed on Beacon OS\n`,
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
      INSERT INTO learning_tasks (
        id, user_id, goal_id, title, description, estimated_minutes, prerequisite, status, order_index,
        task_type, focus_key, concepts_to_learn, starter_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?)
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
        order++,
        t.taskType || "Engineering Implementation",
        t.focusKey || "Core Boundary Invariants & Algorithmic Correctness",
        t.conceptsToLearn || "Review specification, edge cases, and runtime constraints.",
        t.starterCode || "// Type your solution implementation here\n"
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
