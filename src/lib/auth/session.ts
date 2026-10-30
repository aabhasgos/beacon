import db, { ensureUserExists } from "@/lib/db";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  avatar_url?: string;
  college?: string;
  degree?: string;
  graduation_year?: number;
  cgpa?: number;
  headline?: string;
  bio?: string;
  location?: string;
  experience_years?: number;
  linkedin_url?: string;
}

export function getCurrentUserFromRequest(request?: Request): CurrentUser | null {
  try {
    let userId: string | null = null;

    if (request) {
      // 1. Try reading cookie header directly
      const cookieHeader = request.headers.get("cookie") || "";
      const sessionMatch = cookieHeader.match(/beacon_session=([^;]+)/);
      const userMatch = cookieHeader.match(/beacon_user_id=([^;]+)/);

      if (sessionMatch) {
        userId = decodeURIComponent(sessionMatch[1].trim());
      } else if (userMatch) {
        userId = decodeURIComponent(userMatch[1].trim());
      }

      // 2. Try x-user-id header
      if (!userId) {
        const headerUserId = request.headers.get("x-user-id");
        if (headerUserId) userId = headerUserId.trim();
      }
    }

    if (userId) {
      let user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user && (userId === "usr_student_01" || userId.startsWith("usr_student_"))) {
        user = ensureUserExists(db, userId);
      }
      if (user) {
        return user;
      }
    }

    // No session found -> Return null (NEVER fallback to mock/first user)
    return null;
  } catch (err) {
    console.error("Error resolving current user:", err);
    return null;
  }
}
