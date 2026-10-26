import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("q");

    let query = "SELECT * FROM courses WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "all") {
      query += " AND (category LIKE ? OR skills_covered LIKE ?)";
      params.push(`%${category}%`, `%${category}%`);
    }

    if (search) {
      query += " AND (title LIKE ? OR provider LIKE ? OR skills_covered LIKE ? OR description LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += " ORDER BY rating DESC";

    const courses = db.prepare(query).all(...params) as any[];

    return NextResponse.json({ courses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
