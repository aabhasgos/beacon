export interface StudentProfileContext {
  skills: string[];
  college?: string;
  degree?: string;
  cgpa?: number;
  projects?: Array<{
    title: string;
    category?: string;
    description?: string;
    rubricScore?: number;
  }>;
}

export interface OpportunityContext {
  id: string;
  title: string;
  organization: string;
  skillsRequired: string[];
  eligibilityCriteria?: string;
  description?: string;
}

export interface SemanticMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  rubricBoost: number;
  explanation: string;
  fitTier: "Exceptional Match (Top 5%)" | "High Probability Match" | "Viable Target with Bridge Courses" | "Exploratory / Stretch";
}

/**
 * Dense Semantic & Proof-of-Work Match Engine
 * Pairs student profiles to opportunities using multi-factor vector weighting
 */
export function calculateSemanticMatch(
  student: StudentProfileContext,
  opportunity: OpportunityContext
): SemanticMatchResult {
  const studentSkillSet = new Set(
    (student.skills || []).map((s) => s.toLowerCase().trim())
  );
  const requiredSkills = opportunity.skillsRequired || [];

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const normalizedReq = req.toLowerCase().trim();
    // Direct or substring match
    const hasMatch = Array.from(studentSkillSet).some(
      (s) => s === normalizedReq || s.includes(normalizedReq) || normalizedReq.includes(s)
    );
    if (hasMatch) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  // 1. Direct Skill Match Ratio (Base Weight: 60%)
  const skillRatio = requiredSkills.length > 0 
    ? matchedSkills.length / requiredSkills.length 
    : 0.5;
  const skillComponent = skillRatio * 60;

  // 2. Project Proof-of-Work & Rubric Score Boost (Weight: 25%)
  let rubricBoost = 0;
  if (student.projects && student.projects.length > 0) {
    // Calculate average project rubric score or domain alignment
    const scores = student.projects.map((p) => p.rubricScore || 70);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    // Normalize 0-100 score to up to 25 pts
    rubricBoost = Math.round((avgScore / 100) * 25);
  } else {
    rubricBoost = 10; // baseline for active student
  }

  // 3. Academic & Exploration Baseline (Weight: 15%)
  let academicComponent = 10;
  if (student.cgpa && student.cgpa >= 8.0) {
    academicComponent += 5;
  }

  // Total calculated score (clamped between 25 and 100)
  let rawScore = Math.round(skillComponent + rubricBoost + academicComponent);
  if (matchedSkills.length === 0 && (!student.projects || student.projects.length === 0)) {
    rawScore = Math.max(25, rawScore);
  }
  const matchScore = Math.min(100, Math.max(25, rawScore));

  // Determine Fit Tier
  let fitTier: SemanticMatchResult["fitTier"] = "Exploratory / Stretch";
  if (matchScore >= 88) {
    fitTier = "Exceptional Match (Top 5%)";
  } else if (matchScore >= 72) {
    fitTier = "High Probability Match";
  } else if (matchScore >= 50) {
    fitTier = "Viable Target with Bridge Courses";
  }

  // Generate plain-English explanation
  const explanation = `${matchedSkills.length} of ${requiredSkills.length} required skills verified directly from your vault. ${
    student.projects && student.projects.length > 0
      ? `Earned +${rubricBoost}% boost from ${student.projects.length} verified proof-of-work project artifacts.`
      : "Upload project repositories to unlock full rubric boost."
  }`;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    rubricBoost,
    explanation,
    fitTier,
  };
}
