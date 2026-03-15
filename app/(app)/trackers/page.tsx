import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllReadings, getMedications, getTrackerSettings } from "@/lib/actions/health";
import TrackersClient from "@/components/trackers/TrackersClient";

export default async function TrackersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [trackerSettings, activeTrackers, medications] = await Promise.all([
    getTrackerSettings(session.user.id),
    getAllReadings(session.user.id),
    getMedications(session.user.id),
  ]);

  return (
    <TrackersClient
      trackerSettings={trackerSettings}
      activeTrackers={activeTrackers}
      medications={medications}
    />
  );
}
