import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minCgpa = searchParams.get("minCgpa");
    const skillQuery = searchParams.get("skill");
    const minRubric = searchParams.get("minRubric");

    let query = "SELECT id, full_name, email, role, avatar_url, headline, bio, college, degree, graduation_year, cgpa FROM users WHERE role = 'student'";
    const params: any[] = [];

    if (minCgpa) {
      query += " AND cgpa >= ?";
      params.push(Number(minCgpa));
    }

    query += " ORDER BY cgpa DESC, created_at DESC";

    const users = db.prepare(query).all(...params) as any[];

    // Enrich each student with verified skills, projects, and cryptographic credentials
    const getSkillsStmt = db.prepare("SELECT skill_name, level, provenance FROM skill_claims WHERE user_id = ?");
    const getProjectsStmt = db.prepare("SELECT id, title, category, rubric_score, repository_url, live_url FROM projects WHERE user_id = ?");
    const getCredsStmt = db.prepare("SELECT id, credential_hash, artifact_title, artifact_type, rubric_score, signature, issued_at FROM cryptographic_credentials WHERE user_id = ?");

    const candidates = users.map((u) => {
      const skills = getSkillsStmt.all(u.id) as any[];
      const projects = getProjectsStmt.all(u.id) as any[];
      const credentials = getCredsStmt.all(u.id) as any[];

      const avgRubric = projects.length > 0
        ? projects.reduce((acc, p) => acc + (p.rubric_score || 70), 0) / projects.length
        : 0;

      return {
        ...u,
        skills,
        projects,
        credentials,
        proofCount: projects.length + credentials.length,
        avgRubricScore: Math.round(avgRubric * 10) / 10,
      };
    });

    // Apply skill and rubric filters in memory if specified
    let filtered = candidates;
    if (skillQuery && skillQuery.trim()) {
      const targetSkill = skillQuery.toLowerCase().trim();
      filtered = filtered.filter((c) =>
        c.skills.some((s: any) => s.skill_name.toLowerCase().includes(targetSkill))
      );
    }

    if (minRubric) {
      const rubricVal = Number(minRubric);
      filtered = filtered.filter((c) => c.avgRubricScore >= rubricVal || c.credentials.some((cr: any) => cr.rubric_score >= rubricVal));
    }

    return NextResponse.json({ candidates: filtered, total: filtered.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
