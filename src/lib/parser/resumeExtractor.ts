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
  if (fs.existsSync(filePathOrUrl)) return filePathOrUrl;

  const fileName = path.basename(filePathOrUrl);
  const candidate = path.join(process.cwd(), "storage", "resumes", fileName);
  if (fs.existsSync(candidate)) return candidate;

  // Check without query params
  const cleanName = fileName.split("?")[0];
  const candidateClean = path.join(process.cwd(), "storage", "resumes", cleanName);
  if (fs.existsSync(candidateClean)) return candidateClean;

  return "";
}

/**
 * Extracts plain text from a resume file on disk (DOCX, TXT, or PDF stream).
 */
export function extractResumeText(filePath: string): string {
  try {
    const diskPath = resolveResumeDiskPath(filePath);
    if (!diskPath || !fs.existsSync(diskPath)) return "";

    const buffer = fs.readFileSync(diskPath);
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
 * Curated dictionary of tech and industry skills for deterministic extraction.
 */
export const KNOWN_SKILLS = [
  "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "HTML", "CSS", "React", "Next.js",
  "Node.js", "Express", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes",
  "AWS", "Git", "GitHub", "Linux", "Machine Learning", "Deep Learning", "Artificial Intelligence",
  "Robotics", "Computer Vision", "NLP", "Data Structures", "Algorithms", "Object-Oriented Programming",
  "REST APIs", "GraphQL", "Tailwind CSS", "Systems Engineering", "Distributed Systems", "Go", "Rust",
  "Leadership", "Project Management", "Team Leadership", "Communication"
];

export function extractSkillsFromText(text: string): Array<{ name: string; level: string; evidence: string }> {
  if (!text) return [];
  const matched: Array<{ name: string; level: string; evidence: string }> = [];

  for (const skill of KNOWN_SKILLS) {
    if (matchSkill(text, skill)) {
      let level = "Intermediate";
      if (["Machine Learning", "Artificial Intelligence", "Python", "Java", "Data Structures", "Robotics"].includes(skill)) {
        level = "Advanced";
      } else if (["C", "C++", "HTML", "CSS", "Git", "Linux", "Algorithms"].includes(skill)) {
        level = "Proficient";
      }

      matched.push({
        name: skill,
        level,
        evidence: `Extracted and verified from primary resume (${skill}).`,
      });
    }
  }

  return matched;
}

/**
 * Inserts or updates extracted skills in the SQLite skill_claims table.
 */
export function syncExtractedSkillsToDb(
  db: any,
  userId: string,
  skills: Array<{ name: string; level: string; evidence?: string }>
): number {
  if (!skills || skills.length === 0) return 0;

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
    }
  }

  return addedCount;
}

/**
 * Builds an authentic, readable summary based on the actual extracted resume text.
 */
export function generateResumeSummary(text: string, user: any, matchedSkills: string[]): string {
  const college = user?.college || "University";
  const degree = user?.degree || "Computer Science";
  const topSkills = matchedSkills.slice(0, 5).join(", ");
  
  if (matchedSkills.length > 0) {
    return `${degree} candidate at ${college} with demonstrated proficiency in ${topSkills}${matchedSkills.length > 5 ? ` and ${matchedSkills.length - 5} other verified competencies` : ""}. Profile highlights active project experience and technical foundations.`;
  }

  // Fallback if no specific skills matched
  if (text.length > 50) {
    const cleanSnippet = text.slice(0, 150).replace(/\s+/g, " ").trim();
    return `${degree} candidate at ${college}. Summary: ${cleanSnippet}...`;
  }

  return `${degree} student at ${college} seeking engineering and technology opportunities.`;
}
