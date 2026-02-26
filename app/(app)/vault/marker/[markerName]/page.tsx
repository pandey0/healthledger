import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";

// Import our secure DAL and Graph Component
import { getBiomarkerHistory } from "@/lib/dal/vault";
import TrendGraph from "@/components/vault/TrendGraph";

export default async function MarkerTrendPage({
  params,
}: {
  params: Promise<{ markerName: string }>;
}) {
  const resolvedParams = await params;
  const decodedMarkerName = decodeURIComponent(resolvedParams.markerName);
  
  // Securely fetch data
  const history = await getBiomarkerHistory(decodedMarkerName);

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto pb-24">
      
      {/* Calm Header */}
      <header className="px-6 pt-6 pb-2 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md">
        <button className="text-slate-400 hover:text-slate-600 mb-4 transition-colors">
           <Link href="/vault" className="inline-flex items-center">
             <ArrowLeft className="w-5 h-5 mr-1" />
             <span className="text-sm font-medium">Back to Vault</span>
           </Link>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">
            {decodedMarkerName}
          </h1>
        </div>
        
        <p className="text-sm font-medium text-slate-500 mt-3">
          {history.length} data points recorded over time.
        </p>
      </header>

      {/* The Graph Section */}
      <main className="px-6 mt-4">
        <TrendGraph data={history} />
      </main>

    </div>
  );
}