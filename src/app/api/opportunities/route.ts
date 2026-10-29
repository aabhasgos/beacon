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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, organization, type, location, is_remote, stipend, deadline, skills_required, description, source_url } = body;

    if (!title?.trim() || !organization?.trim() || !stipend?.trim()) {
      return NextResponse.json(
        { error: "Role Title, Organization, and Verified Stipend / Salary are required." },
        { status: 400 }
      );
    }

    // Professional quality filter: Reject unpaid or spam descriptions
    const descLower = (description || "").toLowerCase();
    const stipendLower = (stipend || "").toLowerCase();
    if (stipendLower.includes("unpaid") || stipendLower.includes("0 /") || descLower.includes("commission only")) {
      return NextResponse.json(
        { error: "Beacon Professional Policy: Unpaid internships or pure commission roles are strictly prohibited." },
        { status: 422 }
      );
    }

    const newId = `opp_${organization.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}_${Date.now()}`;
    const skillsArray = Array.isArray(skills_required) ? skills_required : (skills_required || "").split(",").map((s: string) => s.trim()).filter(Boolean);

    db.prepare(`
      INSERT INTO opportunities (
        id, title, organization, type, location, is_remote, stipend, deadline, source_url,
        verified_status, last_checked, eligibility_criteria, skills_required, description, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recruiter Audited', datetime('now'), 'All verified engineering undergraduates', ?, ?, 1)
    `).run(
      newId,
      title.trim(),
      organization.trim(),
      type || "Internship",
      location?.trim() || "India (Hybrid)",
      is_remote ? 1 : 0,
      stipend.trim(),
      deadline || "2026-12-31",
      source_url?.trim() || "https://beacon.os/careers",
      JSON.stringify(skillsArray),
      description?.trim() || "High-impact engineering role with verified mentorship and deliverables."
    );

    return NextResponse.json({
      success: true,
      message: `Verified role '${title}' published on the Beacon Enterprise Opportunity Radar.`,
      opportunityId: newId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to post opportunity" }, { status: 500 });
  }
}
