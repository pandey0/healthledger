import Link from "next/link";
import { format } from "date-fns";
import { FileText, ChevronRight, Activity, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import our secure Data Access Layer
import { getUserDocuments } from "@/lib/dal/vault";

export default async function VaultPage() {
  // Fetch data securely on the server
  const documents = await getUserDocuments();

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 max-w-2xl mx-auto pb-8">
      
      {/* Calm Header Section */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Vault</h1>
        <p className="text-slate-500 mt-2 font-medium leading-relaxed">
          A secure archive of your medical history and extracted biomarkers.
        </p>
      </header>

      <main className="px-6">
        {/* Empty State */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/50 mt-4">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Vault is empty</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs font-medium leading-relaxed mb-6">
              Upload your first lab report to start tracking your health data intelligently.
            </p>
            <Link href="/upload">
              <Button className="bg-slate-800 hover:bg-slate-900 text-white rounded-full px-6 shadow-md transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Upload Report
              </Button>
            </Link>
          </div>
        ) : (
          /* Populated State: The Archival List */
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/vault/${doc.id}`} className="block group outline-none">
                <Card className="border-slate-200/60 shadow-sm bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                          {doc.fileName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-400">
                          <span>{format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{doc._count.extractedData} markers</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}