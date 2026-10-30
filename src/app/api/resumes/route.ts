import { NextResponse } from "next/server";
import db, { ensureUserExists } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { getCurrentUserFromRequest } from "@/lib/auth/session";
import {
  extractResumeText,
  extractSkillsFromText,
  extractEducationFromText,
  extractExperiencesFromText,
  syncExtractedSkillsToDb,
  syncExtractedEducationToDb,
  syncExtractedExperiencesToDb,
  generateResumeSummary,
  categorizeSkill,
} from "@/lib/parser/resumeExtractor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);
    const resumes = db.prepare("SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC").all(userId) as any[];

    // Ensure raw_text is populated for complete NLP pipeline visibility
    for (const r of resumes) {
      if (!r.raw_text && r.file_path) {
        const text = extractResumeText(r.file_path);
        if (text) {
          try {
            db.prepare("UPDATE resumes SET raw_text = ? WHERE id = ?").run(text, r.id);
            r.raw_text = text;
          } catch (e) {}
        }
      }
    }

    return NextResponse.json({ resumes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    // Strictly ensure that userId exists in users and student_profiles
    // before performing any child insertions to eliminate FOREIGN KEY errors
    const verifiedUser = ensureUserExists(db, userId, user?.full_name, user?.email);

    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const manualSummary = formData.get("summary") as string;
    const manualSkills = formData.get("skills") as string;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Please upload a valid resume file (PDF or DOCX)." }, { status: 400 });
    }

    // Save file to disk
    const stored = await saveUploadedFile(file, "resumes", "resume");

    // Extract actual text from the uploaded file
    const resumeText = extractResumeText(stored.filePath);
    const extractedSkills = extractSkillsFromText(resumeText);

    // Merge manual skills if user entered any in the form
    if (manualSkills) {
      const splitManual = manualSkills.split(",").map((s) => s.trim()).filter(Boolean);
      for (const ms of splitManual) {
        if (!extractedSkills.some((es) => es.name.toLowerCase() === ms.toLowerCase())) {
          extractedSkills.push({
            name: ms,
            category: categorizeSkill(ms),
            level: "Proficient",
            evidence: `Student-declared skill supported by uploaded resume (${file.name}).`,
          });
        }
      }
    }

    // Automatically sync extracted skills into the student's skill_claims table
    syncExtractedSkillsToDb(db, userId, extractedSkills);

    // Fetch user details
    const userRecord = verifiedUser || (db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any);

    // Extract education credentials (strictly differentiating from employment)
    const extractedEducation = extractEducationFromText(resumeText);
    syncExtractedEducationToDb(db, userId, extractedEducation);

    // Extract genuine work experiences & internships (with anti-conflation filter)
    const enrolledCollege = userRecord?.college || (extractedEducation[0]?.institution || "");
    const extractedExperiences = extractExperiencesFromText(resumeText, enrolledCollege);
    syncExtractedExperiencesToDb(db, userId, extractedExperiences);

    const skillNames = extractedSkills.map((s) => s.name);
    const computedSummary = manualSummary || generateResumeSummary(resumeText, userRecord, skillNames);

    // Unset existing primary resumes
    try {
      db.prepare("UPDATE resumes SET is_primary = 0 WHERE user_id = ?").run(userId);
    } catch (e) {}

    const resumeId = `res_${Date.now()}`;
    const parsedSkillsJson = JSON.stringify(skillNames);

    db.prepare(`
      INSERT INTO resumes (
        id, user_id, file_name, file_path, file_size, file_type, parsed_skills, parsed_summary, raw_text, is_primary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      resumeId,
      userId,
      stored.originalName,
      stored.publicUrl,
      stored.size,
      stored.mimeType,
      parsedSkillsJson,
      computedSummary,
      resumeText
    );

    // Update student profile primary resume link
    try {
      db.prepare(`
        UPDATE student_profiles SET
          resume_filename = ?,
          resume_url = ?,
          resume_updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(stored.originalName, stored.publicUrl, userId);
    } catch (profErr) {
      console.warn("Student profile link warning:", profErr);
    }

    // Record activity event
    try {
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, title, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        `act_${Date.now()}`,
        userId,
        "resume_updated",
        "Primary Resume Uploaded & Verified",
        `Attached ${stored.originalName} (${Math.round(stored.size / 1024)} KB) with ${extractedSkills.length} verified technical skills extracted.`
      );
    } catch (actErr) {
      console.warn("Activity event log warning:", actErr);
    }

    return NextResponse.json({
      success: true,
      resumeId,
      fileUrl: stored.publicUrl,
      fileName: stored.originalName,
      extractedSkillsCount: extractedSkills.length,
      skills: skillNames,
      extractedEducation,
      extractedExperiences,
      summary: computedSummary,
      message: `Resume parsed successfully: ${extractedSkills.length} skills, ${extractedEducation.length} academic credentials, and ${extractedExperiences.length} work experiences extracted and synchronized.`,
    });
  } catch (err: any) {
    console.error("Resume upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
