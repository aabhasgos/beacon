import { NextResponse } from "next/server";
import db, { ensureUserExists } from "@/lib/db";
import { saveUploadedFile } from "@/lib/storage";
import { getCurrentUserFromRequest } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);
    const certs = db.prepare("SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC").all(userId);
    return NextResponse.json({ certificates: certs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUserFromRequest(request);
    const userId = user?.id || "usr_student_01";
    ensureUserExists(db, userId, user?.full_name, user?.email);
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const issuer = formData.get("issuer") as string;
    const issueDate = formData.get("issueDate") as string;
    const credentialId = formData.get("credentialId") as string;
    const credentialUrl = formData.get("credentialUrl") as string;
    const provenance = (formData.get("provenance") as string) || "Self-reported";
    const skillsCovered = formData.get("skillsCovered") as string;
    const file = formData.get("file") as File | null;

    if (!title || !issuer || !issueDate) {
      return NextResponse.json({ error: "Title, Issuer, and Issue Date are required." }, { status: 400 });
    }

    let filePath = "";
    let fileName = "";
    let fileSize = 0;
    let fileType = "";

    if (file && file.size > 0) {
      const stored = await saveUploadedFile(file, "certificates", "cert");
      filePath = stored.publicUrl;
      fileName = stored.originalName;
      fileSize = stored.size;
      fileType = stored.mimeType;
    }

    const id = `cert_${Date.now()}`;
    const verifiedStatus = file ? "Verified File Upload" : "Self-reported Claim";

    db.prepare(`
      INSERT INTO certificates (
        id, user_id, title, issuer, issue_date, credential_id, credential_url, file_path, file_name, file_size, file_type, provenance, verified_status, skills_covered
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      title,
      issuer,
      issueDate,
      credentialId || null,
      credentialUrl || null,
      filePath || null,
      fileName || null,
      fileSize || null,
      fileType || null,
      provenance,
      verifiedStatus,
      skillsCovered || null
    );

    // Record activity event
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `act_${Date.now()}`,
      userId,
      "certificate_added",
      `New Certificate Added: ${title}`,
      `Issued by ${issuer} with provenance '${provenance}'.`
    );

    return NextResponse.json({ success: true, id, message: "Certificate saved successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
