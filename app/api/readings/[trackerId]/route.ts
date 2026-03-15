import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getReadingsForTracker } from "@/lib/actions/health";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackerId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { trackerId } = await params;
  const readings = await getReadingsForTracker(trackerId, session.user.id);
  return NextResponse.json(readings);
}
