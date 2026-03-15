import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTrackerSettings } from "@/lib/actions/health";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trackers = await getTrackerSettings(session.user.id);
  return NextResponse.json(trackers);
}
