import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, Activity, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import our DAL function
import { getDocumentById } from "@/lib/dal/vault";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // 👈 1. Tell TypeScript params is a Promise
}) {
  // 👈 2. Await the params before trying to read the ID
  const resolvedParams = await params;

  // 3. Fetch the secure data using the unwrapped ID
  const document = await getDocumentById(resolvedParams.id);

  // If the document doesn't exist or belongs to someone else, show a 404
  if (!document) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto pb-24">
      
      {/* Calm Sticky Header */}
      <header className="px-6 pt-6 pb-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-10">
        <Link href="/vault" className="inline-flex items-center text-slate-400 hover:text-slate-600 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Back to Vault</span>
        </Link>
        
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate">
          {document.fileName}
        </h1>
        
        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            {format(new Date(document.createdAt), "MMMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-slate-400" />
            {document.extractedData.length} markers recorded
          </div>
        </div>

        {/* View Original Source Button */}
        <a href={document.fileUrl} target="_blank" rel="noreferrer" className="block mt-5">
          <Button variant="outline" className="w-full bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium shadow-sm transition-all">
            <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
            View Original Document
          </Button>
        </a>
      </header>

      {/* Structured Archival Data List */}
      <main className="px-6 pt-6 space-y-3">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight mb-4 px-1">Extracted Biomarkers</h2>
        
        {document.extractedData.map((data) => (
            <Link key={data.id} href={`/vault/marker/${encodeURIComponent(data.markerName)}`} className="block outline-none">
<Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all duration-300">            <CardContent className="p-0 flex items-stretch">
              
              {/* Vibe Check: Gentle Amber for flagged, Muted Emerald for normal */}
              <div className={`w-1.5 shrink-0 transition-colors ${
                data.flag === "high" || data.flag === "low" 
                  ? "bg-amber-400" 
                  : "bg-emerald-400/60 group-hover:bg-emerald-400"
              }`} />

              <div className="flex-1 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{data.markerName}</p>
                  {/* Show the flag if it's high or low, keeping it analytical, not alarming */}
                  {(data.flag === "high" || data.flag === "low") && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded text-[10px] font-bold uppercase tracking-wider">
                      {data.flag}
                    </span>
                  )}
                </div>
                
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-800 tabular-nums">
                    {data.numericValue !== null ? data.numericValue : data.textValue}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    {data.unit}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
          </Link>
        ))}
      </main>

    </div>
  );
}