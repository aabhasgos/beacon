import { NextResponse } from "next/server";
import { syncLiveOpportunities } from "@/lib/crawlers/opportunitySync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncLiveOpportunities();
    return NextResponse.json({
      success: true,
      message: `Autonomous sync complete: ${result.added} new opportunities added, ${result.updated} refreshed. Total active: ${result.totalLive}.`,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await syncLiveOpportunities();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
