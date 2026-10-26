import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";
import { calculateSemanticMatch } from "@/lib/matching/semanticMatch";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const remoteFilter = searchParams.get("remote");
    const search = searchParams.get("q");

    let query = "SELECT * FROM opportunities WHERE 1=1";
    const params: any[] = [];

    if (typeFilter && typeFilter !== "all") {
      query += " AND type = ?";
      params.push(typeFilter);
    }

    if (remoteFilter === "1") {
      query += " AND is_remote = 1";
    }

    if (search) {
      query += " AND (title LIKE ? OR organization LIKE ? OR skills_required LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY featured DESC, deadline ASC";

    const opportunities = db.prepare(query).all(...params) as any[];

    // Fetch user skills to calculate eligibility and match percentage
    const userSkills = db.prepare("SELECT skill_name FROM skill_claims WHERE user_id = ?").all(userId) as any[];
    const skillList = userSkills.map((s) => s.skill_name);

    // Fetch user profile and audited projects for deep proof-of-work weighting
    const studentUser = db.prepare("SELECT cgpa, college, degree FROM users WHERE id = ?").get(userId) as any;
    const userProjects = db.prepare("SELECT title, category, description, rubric_score FROM projects WHERE user_id = ?").all(userId) as any[];

    const studentContext = {
      skills: skillList,
      cgpa: studentUser?.cgpa || 8.0,
      college: studentUser?.college,
      degree: studentUser?.degree,
      projects: userProjects.map((p) => ({
        title: p.title,
        category: p.category,
        description: p.description,
        rubricScore: p.rubric_score || 85,
      })),
    };

    // Get user applications
    const applications = db.prepare("SELECT opportunity_id, status FROM applications WHERE user_id = ?").all(userId) as any[];
    const appMap = new Map(applications.map((a) => [a.opportunity_id, a.status]));

    const enriched = opportunities.map((opp) => {
      let reqSkills: string[] = [];
      try {
        reqSkills = JSON.parse(opp.skills_required);
      } catch (e) {
        reqSkills = [];
      }

      // Phase 4: Dense Semantic Match Engine
      const semanticMatch = calculateSemanticMatch(studentContext, {
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        skillsRequired: reqSkills,
        eligibilityCriteria: opp.eligibility_criteria,
        description: opp.description,
      });

      return {
        ...opp,
        official_url: opp.source_url,
        stipend_range: opp.stipend,
        skills_required: reqSkills,
        matchPercent: semanticMatch.matchScore,
        matchedSkills: semanticMatch.matchedSkills,
        missingSkills: semanticMatch.missingSkills,
        fitTier: semanticMatch.fitTier,
        rubricBoost: semanticMatch.rubricBoost,
        explanation: semanticMatch.explanation,
        appliedStatus: appMap.get(opp.id) || null,
      };
    });

    return NextResponse.json({ opportunities: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
