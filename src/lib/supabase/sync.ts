import { getDb } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const AABHAS_SUPABASE_ID = "4f4a9a42-877b-4526-baef-c9ddc7638dee";

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export interface SupabaseProfileRecord {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
  location?: string;
  education_stage?: string;
  college?: string;
  degree?: string;
  graduation_year?: number;
  cgpa?: number;
  interests?: any;
  constraints?: any;
  preferred_language?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  is_public?: boolean;
}

/**
 * Synchronizes a Supabase Cloud profile row into local SQLite cache.
 */
export function syncSupabaseProfileToDb(db: any, profile: SupabaseProfileRecord): any {
  if (!profile || !profile.id) return null;

  const email = (profile.email || "aabhasgos2@gmail.com").toLowerCase().trim();
  const fullName = profile.full_name || "Aabhas Goswami";
  const college = profile.college || "Bennett University (Times Group)";
  const degree = profile.degree || "B.Tech Computer Science and Engineering";
  const location = profile.location || "Greater Noida / Delhi NCR";
  const headline = profile.headline || "Pre-final Year B.Tech CSE @ Bennett University | AI & Systems Engineer";
  const bio = profile.bio || "Undergraduate student at Bennett University passionate about distributed systems, real-time AI inference, and autonomous technologies.";
  const gradYear = profile.graduation_year || 2027;
  const cgpa = profile.cgpa || 8.8;
  const role = profile.role || "student";
  const avatarUrl = profile.avatar_url || null;

  // 1. Check existing in users table by ID or by email
  const existingById = db.prepare("SELECT * FROM users WHERE id = ?").get(profile.id) as any;
  const existingByEmail = db.prepare("SELECT * FROM users WHERE LOWER(email) = ?").get(email) as any;

  const targetId = existingById ? profile.id : (existingByEmail ? existingByEmail.id : profile.id);

  if (existingById || existingByEmail) {
    db.prepare(`
      UPDATE users SET
        email = ?,
        full_name = ?,
        role = ?,
        avatar_url = COALESCE(?, avatar_url),
        headline = ?,
        bio = ?,
        location = ?,
        college = ?,
        degree = ?,
        graduation_year = ?,
        cgpa = ?
      WHERE id = ?
    `).run(
      email,
      fullName,
      role,
      avatarUrl,
      headline,
      bio,
      location,
      college,
      degree,
      gradYear,
      cgpa,
      targetId
    );
  } else {
    db.prepare(`
      INSERT OR IGNORE INTO users (
        id, email, password, full_name, role, avatar_url, headline, bio, location, education_stage, college, degree, graduation_year, cgpa
      ) VALUES (?, ?, 'password123', ?, ?, ?, ?, ?, ?, 'College / Undergraduate', ?, ?, ?, ?)
    `).run(
      targetId,
      email,
      fullName,
      role,
      avatarUrl,
      headline,
      bio,
      location,
      college,
      degree,
      gradYear,
      cgpa
    );
  }

  // 2. Sync to student_profiles table
  const interestsJson = typeof profile.interests === "string" ? profile.interests : JSON.stringify(profile.interests || []);
  const constraintsJson = typeof profile.constraints === "string" ? profile.constraints : JSON.stringify(profile.constraints || []);
  const isPublic = profile.is_public !== undefined ? (profile.is_public ? 1 : 0) : 1;

  const existingProfile = db.prepare("SELECT user_id FROM student_profiles WHERE user_id = ?").get(targetId);
  if (existingProfile) {
    db.prepare(`
      UPDATE student_profiles SET
        interests = ?,
        constraints = ?,
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url),
        portfolio_url = COALESCE(?, portfolio_url),
        resume_url = COALESCE(?, resume_url),
        is_public = ?
      WHERE user_id = ?
    `).run(
      interestsJson,
      constraintsJson,
      profile.github_url || null,
      profile.linkedin_url || null,
      profile.portfolio_url || null,
      profile.resume_url || null,
      isPublic,
      targetId
    );
  } else {
    db.prepare(`
      INSERT OR IGNORE INTO student_profiles (
        user_id, interests, constraints, preferred_language, github_url, linkedin_url, portfolio_url, resume_url, is_public
      ) VALUES (?, ?, ?, 'English', ?, ?, ?, ?, ?)
    `).run(
      targetId,
      interestsJson,
      constraintsJson,
      profile.github_url || null,
      profile.linkedin_url || null,
      profile.portfolio_url || null,
      profile.resume_url || null,
      isPublic
    );
  }

  return db.prepare("SELECT * FROM users WHERE id = ?").get(targetId);
}

/**
 * Queries Supabase Cloud Database for a student profile by user ID or email,
 * and syncs it into SQLite cache.
 */
export async function fetchAndSyncProfileFromSupabase(userIdOrEmail: string): Promise<any> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !userIdOrEmail) return null;

  try {
    const clean = userIdOrEmail.trim().toLowerCase();
    const isEmail = clean.includes("@");

    let query = supabase.from("profiles").select("*");
    if (isEmail) {
      query = query.eq("email", clean);
    } else if (isUuid(clean)) {
      query = query.or(`id.eq.${clean},email.eq.${clean}`);
    } else {
      query = query.eq("email", "aabhasgos2@gmail.com");
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) {
      // Fallback: check if canonical Aabhas profile exists
      if (clean === "usr_student_01" || clean.includes("aabhas") || clean === AABHAS_SUPABASE_ID) {
        const { data: canonData } = await supabase.from("profiles").select("*").eq("id", AABHAS_SUPABASE_ID).maybeSingle();
        if (canonData) {
          const db = getDb();
          return syncSupabaseProfileToDb(db, canonData);
        }
      }
      return null;
    }

    const db = getDb();
    return syncSupabaseProfileToDb(db, data);
  } catch (err) {
    console.warn("fetchAndSyncProfileFromSupabase warning:", err);
    return null;
  }
}

/**
 * Pushes updated profile fields directly to Supabase Cloud Database.
 */
export async function pushProfileToSupabase(profile: {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  avatar_url?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  college?: string | null;
  degree?: string | null;
  graduation_year?: number | null;
  cgpa?: number | null;
  interests?: any;
  constraints?: any;
  github_url?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  resume_url?: string | null;
  is_public?: boolean;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !profile) return false;

  try {
    const cleanEmail = (profile.email || "aabhasgos2@gmail.com").toLowerCase().trim();
    let targetId = profile.id;

    // Supabase profiles table requires a valid UUID primary key
    if (!isUuid(targetId)) {
      if (cleanEmail === "aabhasgos2@gmail.com" || targetId === "usr_student_01") {
        targetId = AABHAS_SUPABASE_ID;
      } else {
        const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", cleanEmail).maybeSingle();
        if (existingUser?.id) {
          targetId = existingUser.id;
        } else {
          console.warn("Cannot push to Supabase: ID is not a UUID and email is not registered in Supabase auth:", targetId);
          return false;
        }
      }
    }

    const { error } = await supabase.from("profiles").upsert({
      id: targetId,
      email: cleanEmail,
      full_name: profile.full_name || "Aabhas Goswami",
      role: profile.role || "student",
      avatar_url: profile.avatar_url || null,
      headline: profile.headline || null,
      bio: profile.bio || null,
      location: profile.location || "Greater Noida / Delhi NCR",
      education_stage: "College / Undergraduate",
      college: profile.college || "Bennett University (Times Group)",
      degree: profile.degree || "B.Tech Computer Science and Engineering",
      graduation_year: profile.graduation_year ? Number(profile.graduation_year) : 2027,
      cgpa: profile.cgpa ? Number(profile.cgpa) : 8.8,
      interests: profile.interests || [],
      constraints: profile.constraints || [],
      preferred_language: "English",
      github_url: profile.github_url || null,
      linkedin_url: profile.linkedin_url || null,
      portfolio_url: profile.portfolio_url || null,
      resume_url: profile.resume_url || null,
      is_public: profile.is_public !== undefined ? Boolean(profile.is_public) : true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("pushProfileToSupabase notice:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("pushProfileToSupabase exception:", err);
    return false;
  }
}
