import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMedications } from "@/lib/actions/health";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const meds = await getMedications(session.user.id);
  return NextResponse.json(meds);
}
