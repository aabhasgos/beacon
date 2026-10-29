import db from "../db";

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StudentRichLedger {
  userId: string;
  fullName: string;
  college: string | null;
  degree: string | null;
  cgpa: number | null;
  graduationYear: number | null;
  location: string | null;
  headline: string | null;
  bio: string | null;
  interests: string[];
  skills: Array<{ name: string; level: string; provenance: string; evidence?: string }>;
  certificates: Array<{ title: string; issuer: string; skills: string }>;
  projects: Array<{ title: string; category: string; repoUrl?: string }>;
  primaryResume: { fileName: string; summary: string; skills: string } | null;
  applications: Array<{ role: string; company: string; status: string; appliedAt: string }>;
  recentMemories: Array<{ key: string; value: string }>;
}

export function getGroqApiKey(userId?: string): string {
  try {
    if (userId) {
      const profile = db.prepare("SELECT groq_api_key FROM student_profiles WHERE user_id = ?").get(userId) as any;
      if (profile?.groq_api_key) return profile.groq_api_key;
    }
    return process.env.GROQ_API_KEY || "";
  } catch (e) {
    return process.env.GROQ_API_KEY || "";
  }
}

export function getStudentRichLedger(userId: string): StudentRichLedger {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
  const profile = db.prepare("SELECT * FROM student_profiles WHERE user_id = ?").get(userId) as any;
  const skills = db.prepare("SELECT skill_name as name, level, provenance, evidence_notes as evidence FROM skill_claims WHERE user_id = ? ORDER BY verified_at DESC").all(userId) as any[];
  const certs = db.prepare("SELECT title, issuer, skills_covered as skills FROM certificates WHERE user_id = ? ORDER BY issue_date DESC").all(userId) as any[];
  const projects = db.prepare("SELECT title, category, repository_url as repoUrl FROM projects WHERE user_id = ?").all(userId) as any[];
  const resume = db.prepare("SELECT file_name, parsed_summary, parsed_skills FROM resumes WHERE user_id = ? AND is_primary = 1").get(userId) as any;
  const apps = db.prepare(`
    SELECT o.title as role, o.organization as company, a.status, a.applied_at as appliedAt
    FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.user_id = ?
    ORDER BY a.applied_at DESC LIMIT 5
  `).all(userId) as any[];
  const memories = db.prepare("SELECT memory_key as key, memory_value as value FROM memories WHERE user_id = ? ORDER BY created_at DESC LIMIT 6").all(userId) as any[];

  let interests: string[] = [];
  try {
    if (profile?.interests) interests = JSON.parse(profile.interests);
  } catch (e) {
    interests = [];
  }

  return {
    userId,
    fullName: user?.full_name || "Student",
    college: user?.college || null,
    degree: user?.degree || null,
    cgpa: user?.cgpa || null,
    graduationYear: user?.graduation_year || null,
    location: user?.location || null,
    headline: user?.headline || null,
    bio: user?.bio || null,
    interests,
    skills: skills || [],
    certificates: certs || [],
    projects: projects || [],
    primaryResume: resume ? { fileName: resume.file_name, summary: resume.parsed_summary, skills: resume.parsed_skills } : null,
    applications: apps || [],
    recentMemories: memories || [],
  };
}

// RAG: Retrieves matching opportunities and courses from database
export function retrieveKnowledgeChunks(query: string): string {
  const lower = query.toLowerCase();
  const chunks: string[] = [];

  // Search opportunities
  const opportunities = db.prepare("SELECT title, organization, type, stipend, location, deadline, skills_required, source_url FROM opportunities").all() as any[];
  const matchedOpps = opportunities.filter((o) => {
    const text = `${o.title} ${o.organization} ${o.type} ${o.skills_required}`.toLowerCase();
    return lower.split(/\s+/).some((word) => word.length > 2 && text.includes(word));
  }).slice(0, 4);

  if (matchedOpps.length > 0) {
    chunks.push("RETRIEVED VERIFIED OPPORTUNITIES (Live Radar):");
    matchedOpps.forEach((opp) => {
      chunks.push(`- ${opp.title} @ ${opp.organization} (${opp.type}). Stipend: ${opp.stipend}. Deadline: ${opp.deadline}. Required: ${opp.skills_required}. Portal: ${opp.source_url}`);
    });
  }

  // Search courses
  const courses = db.prepare("SELECT title, provider, category, rating, is_free, url, skills_covered, description FROM courses").all() as any[];
  const matchedCourses = courses.filter((c) => {
    const text = `${c.title} ${c.provider} ${c.category} ${c.skills_covered} ${c.description}`.toLowerCase();
    return lower.split(/\s+/).some((word) => word.length > 2 && text.includes(word));
  }).slice(0, 5);

  if (matchedCourses.length > 0) {
    chunks.push("\nRETRIEVED VERIFIED COURSES (Free & Certified):");
    matchedCourses.forEach((crs) => {
      chunks.push(`- ${crs.title} (${crs.provider}) [${crs.is_free ? "100% Free" : "Free Audit Available"}]. Rating: ${crs.rating}★. Skills: ${crs.skills_covered}. URL: ${crs.url}`);
    });
  }

  return chunks.join("\n");
}

export const BEACON_AI_SYSTEM_PROMPT = `
You are Beacon AI, the premier, insider-level career intelligence engine and student mentor inside Beacon Student OS.
You are strictly more rigorous, personalized, and grounded than generic chatbots or platforms like LinkedIn, Unstop, or Internshala.

CRITICAL RAG DIRECTIVES:
1. Always ground your advice in the student's live ledger (their actual college, verified skills in vault, primary resume summary, uploaded certificates, and applications).
2. When asked about courses, recommend exact verified courses from the curriculum, explain why each fits their verified vault skills, and provide the direct URL.
3. When asked about their vault or skills, list their actual verified capabilities from the skill matrix with their verified levels.
4. When asked about companies (Razorpay, Google, ISRO) or hackathons (Smart India Hackathon), reference real screening standards and official portals.
5. NEVER use raw hashtags (#, ##, ###) for headers. Use clean bold headers (e.g. **Actionable Next Steps:**).
6. NEVER output pipe markdown tables (|---|). Use clean bulleted lists.
`;

export async function askBeaconAI(
  messages: AgentMessage[],
  userId: string,
  customApiKey?: string
): Promise<{ text: string; source: "beacon_ai"; suggestedCourses?: any[] }> {
  const ledger = getStudentRichLedger(userId);
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const retrievedKnowledge = retrieveKnowledgeChunks(lastUserMsg);

  // Build RAG System Context
  const studentContextString = `
STUDENT LIVE PROFILE LEDGER (VERIFIED VAULT):
- Name: ${ledger.fullName}
- Institution: ${ledger.college || "University"}
- Program & Major: ${ledger.degree || "Computer Science"}
- Academic CGPA: ${ledger.cgpa ? `${ledger.cgpa}/10.0` : "Self-declared"}
- Graduation Year: ${ledger.graduationYear || 2027}
- Verified Skills in Vault: ${ledger.skills.length > 0 ? ledger.skills.map((s) => `${s.name} (${s.level})`).join(", ") : "CS Foundations"}
- Primary Resume: ${ledger.primaryResume ? `Active (${ledger.primaryResume.fileName}). Summary: "${ledger.primaryResume.summary}"` : "No resume uploaded"}
- Verified Certificates in Locker: ${ledger.certificates.length > 0 ? ledger.certificates.map((c) => `${c.title} (${c.issuer})`).join("; ") : "None uploaded yet"}
- Verified Projects in Vault: ${ledger.projects.length > 0 ? ledger.projects.map((p) => p.title).join("; ") : "None recorded yet"}
- Applications Submitted: ${ledger.applications.length > 0 ? ledger.applications.map((a) => `${a.role} @ ${a.company} [Status: ${a.status}]`).join("; ") : "None yet"}

${retrievedKnowledge ? `GROUND TRUTH KNOWLEDGE RETRIEVED VIA RAG:\n${retrievedKnowledge}` : ""}
`;

  // Check API Key: customApiKey > student_profiles > process.env
  let groqApiKey = customApiKey;
  if (!groqApiKey) {
    const profile = db.prepare("SELECT groq_api_key FROM student_profiles WHERE user_id = ?").get(userId) as any;
    groqApiKey = profile?.groq_api_key || process.env.GROQ_API_KEY;
  }

  // 1. If Groq API key is configured, execute via Groq LLM
  if (groqApiKey && groqApiKey.trim().length > 10) {
    try {
      const modelsToTry = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
      ];
      for (const model of modelsToTry) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqApiKey.trim()}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: `${BEACON_AI_SYSTEM_PROMPT}\n\n${studentContextString}`,
                },
                ...messages,
              ],
              temperature: 0.65,
              max_tokens: 1400,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || "";
            if (text && text.trim().length > 0) {
              return { text: text.trim(), source: "beacon_ai" };
            }
          }
        } catch (mErr) {
          // fallback to next model
        }
      }
    } catch (err) {
      console.warn("Groq profile analysis fallback:", err);
    }
  }

  // 2. High-Performance Deterministic Local RAG Assistant Engine
  const q = lastUserMsg.toLowerCase();
  const allDBCourses = db.prepare("SELECT * FROM courses").all() as any[];
  const userSkillNames = ledger.skills.map((s) => s.name);
  const collegeName = ledger.college || "University";
  const degreeName = ledger.degree || "Computer Science";

  // CASE A: Course Suggestions & Learning Pathway
  const isCourseQuery =
    q.includes("course") ||
    q.includes("learn") ||
    q.includes("study") ||
    q.includes("suggest") ||
    q.includes("recommend") ||
    q.includes("full-stack") ||
    q.includes("fullstack") ||
    q.includes("web dev") ||
    q.includes("generative ai") ||
    q.includes("llm") ||
    q.includes("ai") ||
    q.includes("ml") ||
    q.includes("python") ||
    q.includes("java") ||
    q.includes("algorithms") ||
    q.includes("dsa") ||
    q.includes("systems") ||
    q.includes("devops");

  if (isCourseQuery) {
    let matched: any[] = [];

    if (q.includes("full-stack") || q.includes("fullstack") || q.includes("web dev") || q.includes("web development")) {
      matched = allDBCourses.filter((c) =>
        c.category === "Full Stack Engineering" || c.title.toLowerCase().includes("web") || c.title.toLowerCase().includes("full stack")
      );
    } else if (q.includes("generative ai") || q.includes("llm") || q.includes("prompt")) {
      matched = allDBCourses.filter((c) =>
        c.category === "Artificial Intelligence" && (c.title.toLowerCase().includes("generative") || c.skills_covered.toLowerCase().includes("llm"))
      );
    } else if (q.includes("ai") || q.includes("machine learning") || q.includes("deep learning") || q.includes("robotics")) {
      matched = allDBCourses.filter((c) => c.category === "Artificial Intelligence");
    } else if (q.includes("dsa") || q.includes("algorithm") || q.includes("data structure") || q.includes("cs50")) {
      matched = allDBCourses.filter((c) => c.category === "Computer Science Foundations");
    } else if (q.includes("system") || q.includes("distributed") || q.includes("devops") || q.includes("docker")) {
      matched = allDBCourses.filter((c) => c.category === "Systems Engineering" || c.category === "Systems & DevOps");
    }

    if (matched.length === 0) {
      // General match
      matched = allDBCourses.slice(0, 3);
    }

    const courseListText = matched.slice(0, 3).map((c, i) => {
      const skillsArr = c.skills_covered.split(",").map((s: string) => s.trim());
      const overlaps = skillsArr.filter((s: string) => userSkillNames.some((us) => us.toLowerCase() === s.toLowerCase()));
      const gaps = skillsArr.filter((s: string) => !userSkillNames.some((us) => us.toLowerCase() === s.toLowerCase()));

      let rationale = `Bridges essential modern engineering practices.`;
      if (overlaps.length > 0 && gaps.length > 0) {
        rationale = `Builds on your verified **${overlaps.slice(0, 2).join(", ")}** from your Vault while adding **${gaps.slice(0, 3).join(", ")}**.`;
      } else if (gaps.length > 0) {
        rationale = `Teaches high-demand skills (**${gaps.slice(0, 3).join(", ")}**) required for top-stipend roles.`;
      }

      return `${i + 1}. **${c.title}** (${c.provider})
- **Accreditation:** ${c.is_free ? "100% Free / Verified Certificate" : "Free Audit Available"} • Rating: ${c.rating}★ (${c.review_count.toLocaleString()} students)
- **Why It Fits Your Vault:** ${rationale}
- **Core Syllabus:** ${c.skills_covered}
- **Direct Portal Link:** [Launch Courseware ↗](${c.url})`;
    }).join("\n\n");

    const vaultSkillsNote = userSkillNames.length > 0
      ? `Based on your **Student Vault** at ${collegeName}, you already have verified competency in **${userSkillNames.slice(0, 4).join(", ")}**.`
      : `Based on your student profile pursuing ${degreeName} at ${collegeName}:`;

    return {
      text: `Here are the top vetted, university-backed free courses curated for your technical goals:

${vaultSkillsNote}

${courseListText}

**Actionable Recommendation:**
Once you complete coursework or practical labs, save the completion certificate in your **Student Passport Locker**. Our AI Diagnostic will automatically verify it as an **Assessed / Course-backed** skill credential.`,
      source: "beacon_ai",
      suggestedCourses: matched,
    };
  }

  // CASE B: Vault, Skills, Passport, or Profile Inquiries
  const isVaultQuery =
    q.includes("vault") ||
    q.includes("passport") ||
    q.includes("skill") ||
    q.includes("profile") ||
    q.includes("what do you know") ||
    q.includes("who am i") ||
    q.includes("record") ||
    q.includes("locker");

  if (isVaultQuery) {
    const advancedSkills = ledger.skills.filter((s) => s.level === "Advanced").map((s) => s.name);
    const proficientSkills = ledger.skills.filter((s) => s.level === "Proficient").map((s) => s.name);
    const intermediateSkills = ledger.skills.filter((s) => s.level === "Intermediate").map((s) => s.name);

    return {
      text: `Here is a complete, real-time audit of your **Student Vault & Verified Passport**:

**Academic Standing:**
- **Student Name:** ${ledger.fullName}
- **Institution:** ${collegeName}
- **Program:** ${degreeName}
- **Graduation Class:** ${ledger.graduationYear || 2027}

**Verified Skills Matrix (${ledger.skills.length} competencies verified):**
${advancedSkills.length > 0 ? `- **Advanced Capabilities:** ${advancedSkills.join(", ")}` : ""}
${proficientSkills.length > 0 ? `- **Proficient Foundations:** ${proficientSkills.join(", ")}` : ""}
${intermediateSkills.length > 0 ? `- **Practical Competencies:** ${intermediateSkills.join(", ")}` : ""}

**Primary Application Resume:**
- **Attached Document:** ${ledger.primaryResume?.fileName || "None attached"}
- **Verified Status:** Active & Parsed
- **Executive Summary:** "${ledger.primaryResume?.summary || "Full profile record active."}"

**Credentials & Artifacts:**
- **Certificates in Locker:** ${ledger.certificates.length} verified credential(s)
- **Proof of Work Vault:** ${ledger.projects.length} repository artifact(s)
- **Active Applications:** ${ledger.applications.length} submitted application(s)

**Recommended Next Step:**
Attach a GitHub repository link in your **Proof Vault** (\`/app/projects\`) to earn the official **Artifact-backed** badge for recruiters.`,
      source: "beacon_ai",
    };
  }

  // CASE C: Company & Opportunity Inquiries
  if (q.includes("razorpay") || q.includes("payment")) {
    const hasPythonOrJava = userSkillNames.some((s) => ["python", "java"].includes(s.toLowerCase()));
    return {
      text: `**Razorpay Core Payments Platform Internship** (₹50,000/month stipend):

**Screening Calibration Against Your Vault:**
- **Current Standing:** As a ${degreeName} student at ${collegeName}, ${hasPythonOrJava ? `your verified proficiency in **${userSkillNames.filter((s) => ["Python", "Java"].includes(s)).join(" & ")}** satisfies their primary language criteria.` : "you should highlight solid object-oriented fundamentals."}
- **Key Screening Focus:** Concurrency, asynchronous queue handling (Redis / RabbitMQ), and relational database ACID transaction isolation (PostgreSQL).
- **Target Project to Add:** Build a double-entry ledger REST API with idempotency keys and benchmark latency under load.

**Application Procedure:** Submit your verified application directly on our **Opportunity Radar** using your attached primary resume (${ledger.primaryResume?.fileName || "Resume"}).`,
      source: "beacon_ai",
    };
  }

  if (q.includes("isro") || q.includes("space")) {
    const hasAIOrRobotics = userSkillNames.some((s) => ["robotics", "machine learning", "artificial intelligence", "c", "python"].includes(s.toLowerCase()));
    return {
      text: `**ISRO Space Applications Centre (SAC) Student Research Fellowship** (₹18,000/month):

**Screening Calibration Against Your Vault:**
- **Current Standing:** ${hasAIOrRobotics ? `Your verified skills in **${userSkillNames.filter((s) => ["Robotics", "Machine Learning", "Artificial Intelligence", "C", "Python"].includes(s)).join(", ")}** directly align with ISRO's automated data analytics and robotics telemetry teams!` : `ISRO evaluates strong fundamentals in C, Python, and mathematical algorithms.`}
- **Focus Areas:** Satellite telemetry parsing, geospatial image processing (OpenCV), and real-time distributed data logging.
- **Application Process:** Check the Opportunity Radar on Beacon, review the official eligibility criteria, and link your verified GitHub proof artifacts.`,
      source: "beacon_ai",
    };
  }

  if (q.includes("sih") || q.includes("smart india") || q.includes("hackathon")) {
    return {
      text: `**Smart India Hackathon (SIH 2026) & National Hackathons:**

**Official Portal & Process Notice:**
- National challenges like SIH are conducted directly by the Ministry of Education & AICTE and require formal registration on the government portal (\`sih.gov.in\`).
- One-click submissions are not permitted for national competitions. On Beacon's **Opportunity Radar**, click **"View Hackathon & Register on Official Portal ↗"** to access the verified portal directly.

**Preparation Strategy for ${ledger.fullName}:**
1. Assemble a 6-member cross-functional team (Frontend, Backend, AI/Hardware).
2. Leverage your verified skills in **${userSkillNames.slice(0, 3).join(", ") || "AI & Web"}** to build a working, deployed MVP rather than static slides.
3. Track your preparation milestone tasks in **My Roadmap** (\`/app/roadmap\`).`,
      source: "beacon_ai",
    };
  }

  // CASE D: Resume / CV Tailoring & Optimization
  if (q.includes("resume") || q.includes("cv") || q.includes("improve") || q.includes("tailor")) {
    return {
      text: `Here is an insider engineering review of your primary resume (**${ledger.primaryResume?.fileName || "Active Resume"}**):

**Vault Diagnostic Findings:**
- **Current Summary:** "${ledger.primaryResume?.summary || "Engineering profile record active."}"
- **Verified Skills Identified:** ${userSkillNames.join(", ")}

**Key Improvements for Enterprise Tech Recruiters:**
1. **Add Quantitative Throughput Figures:** Instead of "built an AI model", write *"Trained a PyTorch CNN model achieving 94.2% test accuracy, reducing inference latency by 35% using ONNX runtime."*
2. **Anchor Project Repositories:** Link verified GitHub repositories directly into your **Proof of Work Vault** (\`/app/projects\`) to showcase clean commit history and automated test suites.
3. **Highlight Core Tech Stack:** Prominently feature your verified proficiencies in **${userSkillNames.slice(0, 5).join(", ")}** in your resume header.

**Export CV Tool:** You can also use the **Build & Export CV** button in your Student Passport (\`/app/passport\`) to generate a clean, ATS-compliant single-page resume.`,
      source: "beacon_ai",
    };
  }

  // CASE E: Default Personalized Overview
  return {
    text: `Welcome ${ledger.fullName}. I'm Beacon AI, your personal career intelligence advisor.

Here is a verified snapshot from your **Student Vault**:
- **Academic Standing:** ${degreeName} @ ${collegeName}
- **Verified Competencies:** ${ledger.skills.length} technical skills verified (${userSkillNames.slice(0, 4).join(", ") || "Active"})
- **Master Resume:** ${ledger.primaryResume ? `Active (${ledger.primaryResume.fileName})` : "Attach in Passport"}
- **Locker Credentials:** ${ledger.certificates.length} certificate(s) on record

**How can I assist you right now? Ask me anything:**
- *"Suggest top free Full-Stack Web Dev courses"*
- *"What are the best free courses for Generative AI & LLMs?"*
- *"Audit my student vault and verified skills"*
- *"How should I tailor my resume for Razorpay or ISRO?"*
- *"What are the official registration details for Smart India Hackathon?"*`,
    source: "beacon_ai",
  };
}
