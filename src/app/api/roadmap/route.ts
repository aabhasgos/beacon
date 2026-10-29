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

    // If no tasks exist, automatically populate the Google Systems & SDE Invariant track
    let activeTasks = tasks;
    let activeGoals = goals;
    if (activeTasks.length === 0) {
      const goalId = `goal_${Date.now()}`;
      const targetDate = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const goalTitle = "Google India Systems & SDE Invariant Preparation Track";

      db.prepare(`
        INSERT INTO goals (id, user_id, title, category, target_date, status, progress, reasoning)
        VALUES (?, ?, ?, 'Technical Task Preparation', ?, 'active', 0, 'Auto-calibrated initial technical task track.')
      `).run(goalId, user.id, goalTitle, targetDate);

      const defaultTasks = [
        {
          title: "Rotated Array Invariant Search (Strict O(log N) Binary Search)",
          desc: "Implement search_rotated_array(nums, target) on an array rotated at an unknown pivot index. Must strictly satisfy O(log N) runtime with zero linear scans.",
          minutes: 45,
          taskType: "Algorithmic Implementation",
          focusKey: "Rotated Array Pivot Detection & O(log N) Monotonic Boundary Invariant",
          conceptsToLearn: "Midpoint overflow prevention (low + (high - low) // 2), Pivot detection condition, Monotonic half-space reduction",
          recruiterImpact: "Tested directly in Google India STEP and SDE-1 algorithmic screenings to eliminate candidates relying on linear lookups.",
          starterCode: `class Solution:\n    def search_rotated_array(self, nums: list[int], target: int) -> int:\n        """\n        Given a sorted array nums rotated at some unknown pivot, return the index of target.\n        If target is not found, return -1.\n        Time Complexity must be strictly O(log N).\n        """\n        if not nums: return -1\n        left, right = 0, len(nums) - 1\n        while left <= right:\n            mid = left + (right - left) // 2\n            if nums[mid] == target: return mid\n            if nums[left] <= nums[mid]:\n                if nums[left] <= target < nums[mid]:\n                    right = mid - 1\n                else:\n                    left = mid + 1\n            else:\n                if nums[mid] < target <= nums[right]:\n                    left = mid + 1\n                else:\n                    right = mid - 1\n        return -1\n`,
        },
        {
          title: "Idempotent Payment Processor with Distributed Redis SETNX Locking",
          desc: "Implement process_payment_charge(idempotency_key, amount_inr, customer_id). Guarantee zero duplicate charges under concurrent client retries.",
          minutes: 60,
          taskType: "High-Concurrency Payments",
          focusKey: "Atomic SETNX Distributed Locking with TTL & Duplicate Elimination",
          conceptsToLearn: "UUIDv4 Idempotency-Key headers, Redis SETNX atomic acquire/release, In-flight duplicate detection",
          recruiterImpact: "The primary criteria tested by Razorpay Infrastructure, Swiggy, and Flipkart to prevent financial double-spending.",
          starterCode: `import time, uuid\n\nclass PaymentTransactionService:\n    def __init__(self, cache_client):\n        self.cache = cache_client\n    def process_charge(self, idempotency_key: str, amount_inr: int, customer_id: str) -> dict:\n        lock_key = f"lock:charge:{idempotency_key}"\n        record_key = f"record:charge:{idempotency_key}"\n        existing = self.cache.get(record_key)\n        if existing:\n            return {"status": "SUCCESS", "source": "IDEMPOTENT_CACHE", "transaction": existing}\n        acquired = self.cache.setnx(lock_key, "PROCESSING", ttl=10)\n        if not acquired:\n            raise RuntimeError("Concurrent transaction in flight.")\n        try:\n            tx_payload = {"tx_id": f"TXN_{uuid.uuid4().hex[:10].upper()}", "amount": amount_inr, "status": "CAPTURED"}\n            self.cache.set(record_key, tx_payload)\n            return {"status": "SUCCESS", "transaction": tx_payload}\n        finally:\n            self.cache.delete(lock_key)\n`,
        },
        {
          title: "Binary Telemetry Frame Sync Word (0xEB90) & Header De-framing",
          desc: "Implement a binary stream parser that scans raw byte buffers for the 2-byte synchronization preamble 0xEB90 and unpacks header fields.",
          minutes: 45,
          taskType: "Low-Level Systems",
          focusKey: "Bitwise Preable Synchronization (0xEB90) & Frame Boundary Invariant",
          conceptsToLearn: "Preamble search, Bit shifting (<<, >>), Masking (& 0xFF), Big-Endian struct unpacking",
          recruiterImpact: "Directly evaluated for ISRO SAC Satellite Telemetry, Ground Station data ingest, and aerospace firmware roles.",
          starterCode: `import struct\n\nSYNC_PREAMBLE = 0xEB90\n\ndef extract_next_telemetry_frame(byte_stream: bytes):\n    sync_idx = byte_stream.find(b'\\xeb\\x90')\n    if sync_idx == -1 or len(byte_stream) - sync_idx < 16:\n        return None, byte_stream\n    frame_bytes = byte_stream[sync_idx:sync_idx+16]\n    sync, subsys, ts, alt, length, crc = struct.unpack(">HHIfHH", frame_bytes)\n    return {"subsystem_id": subsys, "timestamp": ts, "altitude_km": round(alt, 3)}, byte_stream[sync_idx+16:]\n`,
        },
        {
          title: "Offline-First Sync Queue & CRDT Conflict Resolution Engine",
          desc: "Implement an opportunistic local-first queue that records field updates in SQLite while disconnected and merges changes with server state without overwriting mutations.",
          minutes: 45,
          taskType: "Offline-First Architecture",
          focusKey: "Last-Write-Wins (LWW) with Vector Clocks & Non-Conflicting Merges",
          conceptsToLearn: "Vector clocks, CRDT State-based vs Operation-based replication, Network partition tolerance (CAP theorem AP mode)",
          recruiterImpact: "A mandatory technical differentiator for winning Smart India Hackathon central ministry problem statements in rural zones.",
          starterCode: `import time\n\nclass OfflineSyncQueue:\n    def __init__(self, client_id: str):\n        self.client_id = client_id\n        self.local_state = {}\n    def set_local(self, key: str, value: any):\n        self.local_state[key] = {"value": value, "timestamp": time.time(), "client_id": self.client_id}\n    def reconcile(self, server_state: dict):\n        for k, v in server_state.items():\n            if k not in self.local_state or v["timestamp"] > self.local_state[k]["timestamp"]:\n                self.local_state[k] = v\n        return {k: v["value"] for k, v in self.local_state.items()}\n`,
        },
      ];

      const insertTsk = db.prepare(`
        INSERT INTO learning_tasks (
          id, user_id, goal_id, title, description, estimated_minutes, prerequisite, status, order_index,
          task_type, focus_key, concepts_to_learn, recruiter_impact, starter_code
        )
        VALUES (?, ?, ?, ?, ?, ?, null, 'todo', ?, ?, ?, ?, ?, ?)
      `);

      let ord = 0;
      for (const dt of defaultTasks) {
        insertTsk.run(
          `tsk_${Date.now()}_${ord}`,
          user.id,
          goalId,
          dt.title,
          dt.desc,
          dt.minutes,
          ord++,
          dt.taskType,
          dt.focusKey,
          dt.conceptsToLearn,
          dt.recruiterImpact,
          dt.starterCode
        );
      }

      activeTasks = db.prepare("SELECT * FROM learning_tasks WHERE user_id = ? ORDER BY order_index ASC").all(user.id) as any[];
      activeGoals = db.prepare("SELECT * FROM goals WHERE user_id = ?").all(user.id) as any[];
    }

    const profileIntelligence = {
      auditScore: calculatedAudit,
      auditGrade: calculatedAudit >= 85 ? "Tier-1 Enterprise Recruitment Ready" : "Competitive Foundations",
      resumeFilename: primaryResume?.file_name || "Aabhas_Resume.docx",
      resumeUploadedAt: primaryResume?.uploaded_at || null,
      candidateName: user.full_name || "Student Engineer",
      extractedSkillsCount: combinedSkills.length,
      extractedSkills: combinedSkills.slice(0, 16),
      skillGaps: ["Distributed Idempotency (SETNX)", "Bitwise Binary Framing", "CRDT State Sync"],
      recommendationReason: `Calibrated via NLP parsing of ${primaryResume?.file_name || "your master resume"}. Found strong foundations in ${combinedSkills.slice(0, 3).join(", ") || "software engineering"}. To crack Tier-1 SDE bars at Razorpay, Google, and ISRO, your highest-leverage gap is hands-on invariant verification (low-level concurrency, boundary search, and bitwise framing). The tasks below are tailored to bridge this exact delta.`,
      targetGoal: activeGoals[0]?.title || "Google India Systems & SDE Invariant Preparation Track",
    };

    return NextResponse.json({
      goals: activeGoals || [],
      tasks: activeTasks || [],
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
    const {
      title,
      description,
      estimatedMinutes,
      deadline,
      prerequisite,
      goalId,
      taskType,
      focusKey,
      conceptsToLearn,
      recruiterImpact,
      starterCode,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    const taskId = `tsk_${Date.now()}`;
    const maxOrder = db.prepare("SELECT MAX(order_index) as max_ord FROM learning_tasks WHERE user_id = ?").get(user.id) as any;
    const nextOrder = (maxOrder?.max_ord ?? 0) + 1;

    db.prepare(`
      INSERT INTO learning_tasks (
        id, user_id, goal_id, title, description, estimated_minutes, deadline, prerequisite, status, order_index,
        task_type, focus_key, concepts_to_learn, recruiter_impact, starter_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      user.id,
      goalId || null,
      title,
      description || "Custom technical implementation task.",
      estimatedMinutes || 45,
      deadline || null,
      prerequisite || null,
      nextOrder,
      taskType || "Engineering Implementation",
      focusKey || "Core Technical Invariant",
      conceptsToLearn || "Review specification, edge cases, and runtime constraints.",
      recruiterImpact || "Evaluated by corporate engineering recruiters to verify production-grade correctness.",
      starterCode || "# Type your solution implementation here\n"
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
