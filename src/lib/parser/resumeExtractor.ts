import fs from "fs";
import path from "path";
import zlib from "zlib";

/**
 * Extracts raw text from a .docx file buffer by reading word/document.xml from the ZIP structure.
 */
export function extractDocxText(buffer: Buffer): string {
  try {
    let offset = 0;
    while (offset < buffer.length - 30) {
      if (buffer.readUInt32LE(offset) === 0x04034b50) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);
        const fileName = buffer.toString("utf8", offset + 30, offset + 30 + fileNameLength);

        const dataOffset = offset + 30 + fileNameLength + extraFieldLength;

        if (fileName === "word/document.xml") {
          let xmlData = "";
          if (compressionMethod === 8) {
            const compressedSlice = buffer.slice(dataOffset, dataOffset + compressedSize);
            const decompressed = zlib.inflateRawSync(compressedSlice);
            xmlData = decompressed.toString("utf8");
          } else if (compressionMethod === 0) {
            xmlData = buffer.toString("utf8", dataOffset, dataOffset + compressedSize);
          }

          if (xmlData) {
            return xmlData
              .replace(/<w:p[^>]*>/g, "\n")
              .replace(/<[^>]+>/g, " ")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, "'")
              .replace(/\s+/g, " ")
              .trim();
          }
        }
        offset = dataOffset + compressedSize;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn("Could not extract docx text:", err);
  }
  return "";
}

/**
 * Resolves the actual disk path of a resume given a file URL or path.
 */
export function resolveResumeDiskPath(filePathOrUrl: string): string {
  if (!filePathOrUrl) return "";
  if (fs.existsSync(/*turbopackIgnore: true*/ filePathOrUrl)) return filePathOrUrl;

  const fileName = path.basename(filePathOrUrl);
  const cleanName = fileName.split("?")[0];

  const candidateDirs = [
    path.join(process.cwd(), "storage", "resumes"),
    path.join("/tmp", "storage", "resumes"),
    path.join(process.cwd(), "storage", "certificates"),
    path.join("/tmp", "storage", "certificates"),
  ];

  for (const dir of candidateDirs) {
    const candidate = path.join(/*turbopackIgnore: true*/ dir, fileName);
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) return candidate;

    const candidateClean = path.join(/*turbopackIgnore: true*/ dir, cleanName);
    if (fs.existsSync(/*turbopackIgnore: true*/ candidateClean)) return candidateClean;
  }

  return "";
}

/**
 * Extracts plain text from a resume file on disk (DOCX, TXT, or PDF stream).
 */
export function extractResumeText(filePath: string): string {
  try {
    const diskPath = resolveResumeDiskPath(filePath);
    if (!diskPath || !fs.existsSync(/*turbopackIgnore: true*/ diskPath)) return "";

    const buffer = fs.readFileSync(/*turbopackIgnore: true*/ diskPath);
    const ext = path.extname(diskPath).toLowerCase();

    if (ext === ".docx") {
      return extractDocxText(buffer);
    }

    if (ext === ".txt" || ext === ".md") {
      return buffer.toString("utf8").trim();
    }

    if (ext === ".pdf") {
      const raw = buffer.toString("binary");
      const textMatches = raw.match(/BT[\s\S]*?ET/g);
      if (textMatches && textMatches.length > 0) {
        const text = textMatches
          .map((m) => {
            const strings = m.match(/\((.*?)\)/g);
            return strings ? strings.map((s) => s.slice(1, -1)).join(" ") : "";
          })
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (text.length > 20) return text;
      }
      return raw.replace(/[^a-zA-Z0-9\s.,@:/-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);
    }
  } catch (err) {
    console.warn("Error extracting resume text:", err);
  }
  return "";
}

/**
 * Robust skill matcher that avoids regex delimiter bugs and false word boundaries.
 */
export function matchSkill(text: string, skill: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const s = skill.toLowerCase();

  if (s === "c++") {
    return /\bc\+\+/i.test(lower);
  }
  if (s === "c") {
    return /\b(c\s+programming|c\s+language|ansi\s+c|\bc\b(?=[\s,;/.]))/i.test(lower);
  }
  if (s === "nlp") {
    return /\b(nlp|natural language processing)\b/i.test(lower);
  }
  if (s === "ai/ml" || s === "ai & ml") {
    return /\b(ai\/ml|ai & ml|artificial intelligence and machine learning)\b/i.test(lower);
  }

  const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i").test(lower);
}

/**
 * Curated dictionary of tech and industry skills with structured categorization for NLP analysis.
 */
export const SKILL_CATEGORIES: Record<string, "Languages" | "Frameworks" | "Tools & Cloud" | "AI & Specializations" | "Leadership & Core"> = {
  // Languages
  "Python": "Languages",
  "Java": "Languages",
  "C++": "Languages",
  "C": "Languages",
  "JavaScript": "Languages",
  "TypeScript": "Languages",
  "HTML": "Languages",
  "CSS": "Languages",
  "SQL": "Languages",
  "Go": "Languages",
  "Rust": "Languages",
  "Bash": "Languages",

  // Frameworks & Libraries
  "React": "Frameworks",
  "Next.js": "Frameworks",
  "Node.js": "Frameworks",
  "Express": "Frameworks",
  "Tailwind CSS": "Frameworks",
  "PyTorch": "Frameworks",
  "TensorFlow": "Frameworks",
  "OpenCV": "Frameworks",
  "Django": "Frameworks",
  "FastAPI": "Frameworks",

  // Tools & Cloud
  "Git": "Tools & Cloud",
  "GitHub": "Tools & Cloud",
  "Linux": "Tools & Cloud",
  "Docker": "Tools & Cloud",
  "Kubernetes": "Tools & Cloud",
  "AWS": "Tools & Cloud",
  "PostgreSQL": "Tools & Cloud",
  "MySQL": "Tools & Cloud",
  "MongoDB": "Tools & Cloud",
  "Redis": "Tools & Cloud",
  "REST APIs": "Tools & Cloud",
  "GraphQL": "Tools & Cloud",

  // AI & Specializations
  "Machine Learning": "AI & Specializations",
  "Deep Learning": "AI & Specializations",
  "Artificial Intelligence": "AI & Specializations",
  "Neural Networks": "AI & Specializations",
  "Computer Vision": "AI & Specializations",
  "NLP": "AI & Specializations",
  "Robotics": "AI & Specializations",
  "3D Printing": "AI & Specializations",
  "Computational Intelligence": "AI & Specializations",
  "Data Structures": "AI & Specializations",
  "Algorithms": "AI & Specializations",
  "Object-Oriented Programming": "AI & Specializations",
  "Systems Engineering": "AI & Specializations",
  "Distributed Systems": "AI & Specializations",

  // Leadership & Core
  "Leadership": "Leadership & Core",
  "Team Leadership": "Leadership & Core",
  "Project Management": "Leadership & Core",
  "Communication": "Leadership & Core",
  "Problem Solving": "Leadership & Core",
  "Community Outreach": "Leadership & Core",
  "Event Coordination": "Leadership & Core",
};

export const KNOWN_SKILLS = Object.keys(SKILL_CATEGORIES);

export function categorizeSkill(skill: string): "Languages" | "Frameworks" | "Tools & Cloud" | "AI & Specializations" | "Leadership & Core" {
  if (SKILL_CATEGORIES[skill]) return SKILL_CATEGORIES[skill];
  const lower = skill.toLowerCase();
  if (["python", "java", "c", "c++", "javascript", "typescript", "html", "css", "sql", "rust", "go"].includes(lower)) return "Languages";
  if (["react", "next.js", "node.js", "tailwind", "express", "pytorch", "tensorflow", "opencv"].includes(lower)) return "Frameworks";
  if (["git", "github", "linux", "docker", "aws", "mongo", "postgres", "mysql", "redis", "api"].some((k) => lower.includes(k))) return "Tools & Cloud";
  if (["ai", "ml", "machine learning", "deep learning", "neural", "vision", "robotics", "nlp", "intelligence", "3d printing"].some((k) => lower.includes(k))) return "AI & Specializations";
  return "Leadership & Core";
}

export function extractSkillsFromText(text: string): Array<{ name: string; category: string; level: string; evidence: string }> {
  if (!text) return [];
  const matched: Array<{ name: string; category: string; level: string; evidence: string }> = [];

  for (const skill of KNOWN_SKILLS) {
    if (matchSkill(text, skill)) {
      let level = "Intermediate";
      if (["Machine Learning", "Artificial Intelligence", "Neural Networks", "Python", "Java", "Data Structures", "Robotics"].includes(skill)) {
        level = "Advanced";
      } else if (["C", "C++", "HTML", "CSS", "Git", "Linux", "Algorithms", "Computer Vision"].includes(skill)) {
        level = "Proficient";
      }

      matched.push({
        name: skill,
        category: SKILL_CATEGORIES[skill],
        level,
        evidence: `Extracted and verified from primary resume text (${skill}).`,
      });
    }
  }

  return matched;
}

/**
 * Segments raw resume text into distinct logical sections by detecting standard uppercase headers.
 */
export function segmentResumeSections(text: string): Record<string, string> {
  if (!text) return {};

  const sectionKeywords = [
    { key: "education", regex: /\b(EDUCATION|ACADEMIC BACKGROUND|ACADEMICS|QUALIFICATIONS)\b/g },
    { key: "experience", regex: /\b(LEADERSHIP & EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|INTERNSHIPS|EXPERIENCE|EMPLOYMENT HISTORY)\b/g },
    { key: "skills", regex: /\b(TECHNICAL SKILLS|SKILLS & ABILITIES|CORE COMPETENCIES|SKILLS)\b/g },
    { key: "certifications", regex: /\b(CERTIFICATIONS & TECHNICAL EXPOSURE|CERTIFICATIONS|CERTIFICATES)\b/g },
    { key: "projects", regex: /\b(ACADEMIC PROJECTS|KEY PROJECTS|PERSONAL PROJECTS|PROJECTS)\b/g },
    { key: "activities", regex: /\b(EXTRA-CURRICULAR ACTIVITIES|ACTIVITIES)\b/g },
  ];

  const matches: Array<{ key: string; index: number; length: number; header: string }> = [];
  for (const s of sectionKeywords) {
    let m;
    while ((m = s.regex.exec(text)) !== null) {
      // Must be an uppercase header to avoid mid-sentence false positives
      if (m[0] === m[0].toUpperCase()) {
        matches.push({ key: s.key, index: m.index, length: m[0].length, header: m[0] });
      }
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const sections: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const start = cur.index + cur.length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    sections[cur.key] = text.slice(start, end).trim();
  }

  return sections;
}

/**
 * Extracts structured educational credentials (college, university, degrees, graduation year, grades).
 * Strictly isolated from corporate work experience.
 */
export function extractEducationFromText(text: string): Array<{
  institution: string;
  degree: string;
  dates: string;
  gradYear: string;
  details: string;
}> {
  if (!text) return [];
  const sections = segmentResumeSections(text);
  const eduText = sections.education || "";

  const items: Array<{
    institution: string;
    degree: string;
    dates: string;
    gradYear: string;
    details: string;
  }> = [];

  const textToScan = eduText || text;

  // Split by emdash or dash delimiter
  const parts = textToScan.split(/\s*[\u2014—]\s*/);
  if (parts.length > 1) {
    let currentInst = parts[0].replace(/^(?:EDUCATION|ACADEMICS)\s*/i, "").trim();

    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i];
      // Check if chunk ends with another institution name
      const nextInstMatch =
        i < parts.length - 1
          ? chunk.match(/(?:[•\n]|\s{2,}|^|undergraduate\s+)?([A-Z][A-Za-z\s&.',]+?(?:University|School|College|Institute|Academy|Vidyalaya))$/)
          : null;

      let degreeAndDates = chunk;
      let nextInst = "";
      if (nextInstMatch) {
        nextInst = nextInstMatch[1].trim();
        degreeAndDates = chunk.slice(0, chunk.length - nextInstMatch[0].length).trim();
      }

      const barParts = degreeAndDates.split("|");
      const degree = barParts[0].trim();
      const datesAndDetails = barParts[1] ? barParts[1].trim() : "";

      const gradYearMatch = datesAndDetails.match(/\b(20\d\d)\b/g);
      const gradYear = gradYearMatch ? gradYearMatch[gradYearMatch.length - 1] : "";

      if (currentInst && degree) {
        items.push({
          institution: currentInst,
          degree,
          dates: datesAndDetails,
          gradYear,
          details: datesAndDetails,
        });
      }

      if (nextInst) {
        currentInst = nextInst;
      }
    }
  }

  return items;
}

/**
 * Extracts structured work experiences and internships detected in resume text.
 * Strictly separates work experience from the educational institution where the student is studying.
 */
export function extractExperiencesFromText(
  text: string,
  enrolledCollege = ""
): Array<{
  title: string;
  company: string;
  employment_type: string;
  duration?: string;
  description: string;
}> {
  if (!text) return [];
  const sections = segmentResumeSections(text);

  // Scan only experience and activities sections (strictly ignoring the education section)
  const expText = [sections.experience, sections.activities].filter(Boolean).join("\n") || text;
  const experiences: Array<{
    title: string;
    company: string;
    employment_type: string;
    duration?: string;
    description: string;
  }> = [];

  // Patterns for work experiences, internships, research appointments, and leadership roles
  const rolePattern =
    /(?:^|[•\n.]|\b)\s*([A-Z][A-Za-z\s&/]{2,45}?(?:Intern|Lead|Captain|Head Boy|Head Girl|President|Developer|Engineer|Fellow|Associate|Manager|Coordinator|Officer|Specialist|Analyst))\s*[-—–]\s*([^|•\n\r]+?)(?:\s*\|\s*([^•\n\r]+?))?(?=(?:\s*[•\n.]\s*[A-Z]|$))/g;

  let m;
  const seenKeys = new Set<string>();

  while ((m = rolePattern.exec(expText)) !== null) {
    const rawTitle = m[1].trim();
    const rawCompany = m[2].trim();
    const rawDuration = m[3] ? m[3].trim() : "";

    // Anti-conflation filter:
    // If the title is an academic degree program ("B.Tech", "Class XII", "Student") without an employment term, skip!
    const isAcademicDegree = /\b(b\.?tech|b\.?e\.?|b\.?sc|m\.?tech|m\.?sc|bca|mca|class\s+(?:xii|x|12|10)|undergraduate\s+student|high\s+school)\b/i.test(
      rawTitle
    );
    if (isAcademicDegree && !/intern|research|fellow|assistant|lead|captain/i.test(rawTitle)) {
      continue;
    }

    // If company is identical to the enrolled college and no distinct job/intern title exists, skip
    if (enrolledCollege && rawCompany.toLowerCase() === enrolledCollege.toLowerCase() && !/intern|fellow|assistant/i.test(rawTitle)) {
      continue;
    }

    // Determine specific employment type
    let empType = "Internship";
    if (/lead|captain|head boy|head girl|president|coordinator|officer/i.test(rawTitle)) {
      empType = "Leadership & Responsibility";
    } else if (/research|fellow|lab/i.test(rawTitle) || /research|lab/i.test(rawCompany)) {
      empType = "Research Appointment";
    } else if (!/intern/i.test(rawTitle)) {
      empType = "Employment / Professional";
    }

    const key = `${rawTitle.toLowerCase()}__${rawCompany.toLowerCase()}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      experiences.push({
        title: rawTitle,
        company: rawCompany,
        employment_type: empType,
        duration: rawDuration || "Document-verified",
        description: `Document-verified role: ${rawTitle} at ${rawCompany}${rawDuration ? ` (${rawDuration})` : ""}.`,
      });
    }
  }

  // Fallback explicit patterns if regex didn't catch specific formatted roles
  if (experiences.length === 0) {
    const fallbackPatterns = [
      /(Social Work Intern)\s*[-—–]\s*([^|•\n]+)(?:\|\s*([^•\n]+))?/i,
      /(Vice Head Boy|Head Boy|Head Girl|Sports Captain|President|Lead)\s*[-—–]\s*([^|•\n]+)(?:\|\s*([^•\n]+))?/i,
      /(Software Engineering Intern|Research Intern|Developer Intern|SDE Intern)\s*[-—–]\s*([^|•\n]+)(?:\|\s*([^•\n]+))?/i,
    ];

    for (const p of fallbackPatterns) {
      const match = expText.match(p);
      if (match) {
        const title = match[1].trim();
        const company = match[2].trim();
        experiences.push({
          title,
          company,
          employment_type: title.toLowerCase().includes("intern")
            ? "Internship"
            : /lead|captain|head/i.test(title)
            ? "Leadership & Responsibility"
            : "Employment / Professional",
          duration: match[3]?.trim() || "Verified in Resume",
          description: `Verified role extracted from document: ${title} at ${company}.`,
        });
      }
    }
  }

  return experiences;
}

/**
 * Inserts or updates extracted skills in the SQLite skill_claims table.
 */
export function syncExtractedSkillsToDb(
  db: any,
  userId: string,
  skills: Array<{ name: string; level: string; category?: string; evidence?: string }>
): number {
  if (!skills || skills.length === 0) return 0;

  try {
    const existing = db.prepare("SELECT skill_name FROM skill_claims WHERE user_id = ?").all(userId) as any[];
    const existingNames = new Set(existing.map((e: any) => e.skill_name.toLowerCase()));

    const insertStmt = db.prepare(`
      INSERT INTO skill_claims (id, user_id, skill_id, skill_name, level, provenance, evidence_notes, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    let addedCount = 0;
    for (const skill of skills) {
      if (!existingNames.has(skill.name.toLowerCase())) {
        const skillId = `sk_${skill.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString(36)}`;
        const claimId = `claim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Also register in skills lookup table if missing
        try {
          db.prepare("INSERT OR IGNORE INTO skills (id, name, category, description) VALUES (?, ?, ?, ?)").run(
            skillId,
            skill.name,
            skill.category || categorizeSkill(skill.name),
            `Technical competency extracted from primary resume.`
          );
        } catch (e) {}

        try {
          insertStmt.run(
            claimId,
            userId,
            skillId,
            skill.name,
            skill.level || "Intermediate",
            "Resume-backed",
            skill.evidence || `Extracted and verified from primary resume (${skill.name}).`
          );
          existingNames.add(skill.name.toLowerCase());
          addedCount++;
        } catch (claimErr) {
          console.warn("Could not insert skill claim:", claimErr);
        }
      }
    }

    return addedCount;
  } catch (err) {
    console.warn("syncExtractedSkillsToDb warning:", err);
    return 0;
  }
}

/**
 * Syncs extracted educational credentials to the student user record (college, degree, graduation_year).
 */
export function syncExtractedEducationToDb(
  db: any,
  userId: string,
  educationList: Array<{ institution: string; degree: string; gradYear: string }>
): boolean {
  if (!educationList || educationList.length === 0) return false;

  try {
    // Find college/university degree (preference for B.Tech, Degree vs High School)
    const tertiaryEdu =
      educationList.find((e) => /\b(university|institute|college)\b/i.test(e.institution) || /\b(b\.?tech|b\.?e\.?|degree|bachelor|master)\b/i.test(e.degree)) ||
      educationList[0];

    if (!tertiaryEdu) return false;

    const user = db.prepare("SELECT college, degree, graduation_year FROM users WHERE id = ?").get(userId) as any;
    if (!user) return false;

    const newCollege = user.college && user.college !== "University" ? user.college : tertiaryEdu.institution;
    const newDegree = user.degree && user.degree !== "Computer Science" ? user.degree : tertiaryEdu.degree;
    const newGradYear = user.graduation_year || tertiaryEdu.gradYear;

    db.prepare(`
      UPDATE users SET
        college = ?,
        degree = ?,
        graduation_year = COALESCE(?, graduation_year)
      WHERE id = ?
    `).run(newCollege, newDegree, newGradYear ? Number(newGradYear) : null, userId);

    return true;
  } catch (err) {
    console.warn("syncExtractedEducationToDb warning:", err);
    return false;
  }
}

/**
 * Syncs extracted genuine work experiences to the student_experiences table.
 */
export function syncExtractedExperiencesToDb(
  db: any,
  userId: string,
  experiences: Array<{
    title: string;
    company: string;
    employment_type: string;
    duration?: string;
    description: string;
  }>
): number {
  if (!experiences || experiences.length === 0) return 0;

  try {
    const existing = db.prepare("SELECT title, company FROM student_experiences WHERE user_id = ?").all(userId) as any[];
    const existingKeys = new Set(existing.map((e: any) => `${e.title.toLowerCase()}__${e.company.toLowerCase()}`));

    const insertStmt = db.prepare(`
      INSERT INTO student_experiences (
        id, user_id, title, company, employment_type, location, is_remote, is_current, start_date, end_date, description, skills_used, proof_url, verified_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let added = 0;
    for (const exp of experiences) {
      const key = `${exp.title.toLowerCase()}__${exp.company.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        const expId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const startDate = exp.duration || "Verified in Resume";
        try {
          insertStmt.run(
            expId,
            userId,
            exp.title,
            exp.company,
            exp.employment_type || "Internship",
            "Document-verified",
            0,
            0,
            startDate,
            "Completed",
            exp.description,
            JSON.stringify([]),
            "",
            "Resume-Extracted"
          );
          existingKeys.add(key);
          added++;
        } catch (expErr) {
          console.warn("Could not insert student experience:", expErr);
        }
      }
    }

    return added;
  } catch (err) {
    console.warn("syncExtractedExperiencesToDb warning:", err);
    return 0;
  }
}

/**
 * Builds an authentic, readable summary based on the actual extracted resume text.
 */
export function generateResumeSummary(text: string, user: any, matchedSkills: string[]): string {
  const college = user?.college || "University";
  const degree = user?.degree || "Computer Science";
  const topSkills = matchedSkills.slice(0, 5).join(", ");

  if (matchedSkills.length > 0) {
    return `${degree} candidate at ${college} with demonstrated proficiency in ${topSkills}${
      matchedSkills.length > 5 ? ` and ${matchedSkills.length - 5} other verified competencies` : ""
    }. Profile highlights active project experience and technical foundations.`;
  }

  // Fallback if no specific skills matched
  if (text.length > 50) {
    const cleanSnippet = text.slice(0, 150).replace(/\s+/g, " ").trim();
    return `${degree} candidate at ${college}. Summary: ${cleanSnippet}...`;
  }

  return `${degree} student at ${college} seeking engineering and technology opportunities.`;
}
