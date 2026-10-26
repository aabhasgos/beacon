import { NextResponse } from "next/server";
import fs from "fs";
import { getFilePath, StorageCategory } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string; filename: string }> }
) {
  try {
    const { category, filename } = await context.params;

    if (category !== "certificates" && category !== "resumes" && category !== "avatars") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const decodedFilename = decodeURIComponent(filename);
    const filePath = getFilePath(category as StorageCategory, decodedFilename);

    if (!filePath || !fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = decodedFilename.split(".").pop()?.toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    else if (ext === "png") contentType = "image/png";
    else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
    else if (ext === "docx") contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${decodedFilename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
