import fs from "fs";
import path from "path";

const isServerless = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const baseStorageDir = isServerless ? path.join("/tmp", "storage") : path.join(process.cwd(), "storage");
const CERTIFICATES_DIR = path.join(baseStorageDir, "certificates");
const RESUMES_DIR = path.join(baseStorageDir, "resumes");
const AVATARS_DIR = path.join(baseStorageDir, "avatars");

function ensureDirectoryExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export type StorageCategory = "certificates" | "resumes" | "avatars";

export interface StoredFileInfo {
  fileName: string;
  originalName: string;
  filePath: string;
  publicUrl: string;
  size: number;
  mimeType: string;
}

function getCategoryDir(category: StorageCategory): string {
  if (category === "certificates") return CERTIFICATES_DIR;
  if (category === "resumes") return RESUMES_DIR;
  return AVATARS_DIR;
}

export async function saveUploadedFile(
  file: File,
  category: StorageCategory,
  prefix: string = ""
): Promise<StoredFileInfo> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueName = `${prefix ? prefix + "_" : ""}${Date.now()}_${cleanOriginalName}`;
  const targetDir = getCategoryDir(category);
  ensureDirectoryExists(targetDir);

  const targetPath = path.join(targetDir, uniqueName);
  fs.writeFileSync(targetPath, buffer);

  const publicUrl = `/api/files/${category}/${encodeURIComponent(uniqueName)}`;

  return {
    fileName: uniqueName,
    originalName: file.name,
    filePath: targetPath,
    publicUrl,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export function getFilePath(category: StorageCategory, fileName: string): string | null {
  const targetDir = getCategoryDir(category);
  ensureDirectoryExists(targetDir);
  const safeName = path.basename(fileName);
  const fullPath = path.join(targetDir, safeName);

  if (fs.existsSync(fullPath)) {
    return fullPath;
  }
  return null;
}
