import { NextResponse } from "next/server";
import db, { ensureUserExists } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Please select an image file to upload." }, { status: 400 });
    }

    const stored = await saveUploadedFile(file, "avatars", `user_${userId}`);
    const avatarUrl = stored.publicUrl;

    db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatarUrl, userId);

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Profile picture uploaded successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
