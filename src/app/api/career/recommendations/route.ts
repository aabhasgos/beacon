import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id;

    let studentSkills: string[] = [];
    let studentInterests: string[] = [];
    let certificatesCount = 0;
    let projectsCount = 0;
    let resumePresent = false;

    if (userId) {
      const skills = db.prepare("SELECT skill_name FROM skill_claims WHERE user_id = ?").all(userId) as any[];
      studentSkills = skills.map((s) => s.skill_name.toLowerCase());

      const profile = db.prepare("SELECT interests FROM student_profiles WHERE user_id = ?").get(userId) as any;
      try {
        if (profile?.interests) studentInterests = JSON.parse(profile.interests);
      } catch (e) {}

      const certs = db.prepare("SELECT COUNT(*) as count FROM certificates WHERE user_id = ?").get(userId) as any;
      certificatesCount = certs?.count || 0;

      const projs = db.prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ?").get(userId) as any;
      projectsCount = projs?.count || 0;

      const resume = db.prepare("SELECT id FROM resumes WHERE user_id = ? AND is_primary = 1").get(userId) as any;
      resumePresent = !!resume;
    }

    // 1. Fetch Opportunities & Calculate Profile Match Scores
    const opps = db.prepare("SELECT * FROM opportunities ORDER BY featured DESC, likes_count DESC").all() as any[];
    const matchedOpportunities = opps.map((opp) => {
      let requiredSkills: string[] = [];
      try {
        requiredSkills = JSON.parse(opp.skills_required);
      } catch (e) {
        requiredSkills = [];
      }

      const matching: string[] = [];
      const missing: string[] = [];

      requiredSkills.forEach((req) => {
        const reqLower = req.toLowerCase();
        const hasSkill = studentSkills.some((s) => s.includes(reqLower) || reqLower.includes(s)) ||
          studentInterests.some((i) => i.toLowerCase().includes(reqLower));
        if (hasSkill) {
          matching.push(req);
        } else {
          missing.push(req);
        }
      });

      // Match percentage calculation
      let matchScore = 70; // baseline exploratory fit
      if (requiredSkills.length > 0) {
        matchScore = Math.round(50 + (matching.length / requiredSkills.length) * 45);
      }
      if (user?.cgpa && user.cgpa >= 8.0) matchScore = Math.min(98, matchScore + 5);

      return {
        ...opp,
        skills_required_parsed: requiredSkills,
        matchingSkills: matching,
        missingSkills: missing,
        matchScore: Math.min(98, Math.max(55, matchScore)),
      };
    });

    // 2. Fetch Courses & Map to Skill Gaps
    const allCourses = db.prepare("SELECT * FROM courses ORDER BY rating DESC").all() as any[];
    const recommendedCourses = allCourses.map((crs) => {
      let relevanceScore = 80;
      const skillsCoveredLower = (crs.skills_covered || "").toLowerCase();

      // Check if course addresses student's missing skills across top opportunities
      const helpsWithMissing = matchedOpportunities.some((o) =>
        o.missingSkills.some((m: string) => skillsCoveredLower.includes(m.toLowerCase()))
      );

      if (helpsWithMissing) relevanceScore = 95;

      return {
        ...crs,
        relevanceScore,
        whyRecommended: helpsWithMissing
          ? `Directly bridges required skills for high-paying openings on your radar.`
          : `High-value verified credential to elevate your Student Passport.`,
      };
    });

    // 3. Profile Completeness & "How to Get Better" Engine
    let completeness = 20; // baseline account created
    const missingSteps: string[] = [];

    if (user?.college) completeness += 15;
    else missingSteps.push("Add your University & Degree in Passport");

    if (user?.cgpa) completeness += 15;
    else missingSteps.push("Record your verified CGPA");

    if (certificatesCount > 0) completeness += 20;
    else missingSteps.push("Upload at least 1 verified certificate to your locker");

    if (projectsCount > 0) completeness += 15;
    else missingSteps.push("Add a GitHub repository or project brief in Proof Vault");

    if (resumePresent) completeness += 15;
    else missingSteps.push("Attach an active PDF resume to unlock 1-click apply");

    // "What Should You Do? What Should You Learn? What Should You Prefer?"
    const gradYear = user?.graduation_year || 2027;
    const currentYear = 2026;
    const yearsRemaining = gradYear - currentYear;

    let preferredPathway = "Pursue Tier-1 Engineering Internships (Razorpay, Google STEP, ISRO)";
    let pathwayExplanation = "You have 1-2 years before graduation. Strong industrial internships provide the highest conversion to Pre-Placement Offers (PPOs).";

    if (yearsRemaining <= 1) {
      preferredPathway = "Focus on High-Impact Production Proof & Rapid PPO Hackathons (Flipkart GRiD, SIH)";
      pathwayExplanation = "In your penultimate/final year, national hackathons offer fast-tracked direct interview rounds within 30 days.";
    }

    const cvImprovements = [
      {
        area: "Quantifiable Impact Metrics",
        tip: "Replace 'Worked on backend APIs' with 'Engineered REST endpoints processing 1,200 req/min with sub-40ms latency'.",
      },
      {
        area: "Verified Evidence Badges",
        tip: "Recruiters reject unverified bullet points. Run your projects through Beacon AI Audit to display official Artifact-backed badges.",
      },
      {
        area: "ATS Keyword Alignment",
        tip: "Ensure core technologies like PostgreSQL, Docker, and REST APIs are declared in your skill matrix so automated screening passes.",
      },
    ];

    return NextResponse.json({
      success: true,
      profileCompleteness: Math.min(100, completeness),
      missingSteps,
      preferredPathway,
      pathwayExplanation,
      cvImprovements,
      matchedOpportunities,
      recommendedCourses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
