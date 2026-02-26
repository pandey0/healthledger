"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, AlertCircle, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import our new Server Action
import { saveDocumentData } from "@/lib/actions/vault";

type ExtractedMarker = {
  id: string;
  marker: string;
  value: string;
  unit: string;
  flag: string;
};

type PendingData = {
  fileName: string;
  fileUrl: string;
  extractedItems: ExtractedMarker[];
};

export default function ReviewPage() {
  const router = useRouter();
  const [pendingData, setPendingData] = useState<PendingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Pull the AI extraction results from session memory
    const saved = sessionStorage.getItem("pendingVaultData");
    if (saved) {
      setPendingData(JSON.parse(saved));
    } else {
      router.replace("/upload");
    }
  }, [router]);

  const handleValueChange = (id: string, newValue: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.map((item) => 
        item.id === id ? { ...item, value: newValue } : item
      )
    });
  };

  const handleDelete = (id: string) => {
    if (!pendingData) return;
    setPendingData({
      ...pendingData,
      extractedItems: pendingData.extractedItems.filter((item) => item.id !== id)
    });
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    setIsSaving(true);

    // Call our secure Server Action
    const result = await saveDocumentData({
      fileName: pendingData.fileName,
      fileUrl: pendingData.fileUrl,
      extractedItems: pendingData.extractedItems,
    });

    if (!result.success) {
      alert(result.error || "Failed to archive document.");
      setIsSaving(false);
      return;
    }

    // Clean up memory and quietly route to the vault
    sessionStorage.removeItem("pendingVaultData");
    router.push("/vault"); 
  };

  if (!pendingData) return null; // Prevent hydration mismatch

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-in slide-in-from-right-4 duration-500 max-w-md mx-auto">
      
      {/* Calm Header */}
      <div className="px-6 pt-6 pb-4 bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Verify Record</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium truncate">
          {pendingData.extractedItems.length} markers found in <span className="font-semibold text-slate-700">{pendingData.fileName}</span>.
        </p>
        
        {/* Archival Link to Original Document */}
        <a href={pendingData.fileUrl} target="_blank" rel="noreferrer" className="block mt-4">
          <Button variant="outline" className="w-full bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium">
            <FileText className="w-4 h-4 mr-2 text-slate-400" />
            View Original Source
          </Button>
        </a>
      </div>

      {/* Editable List: Structured and Aligned */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-40">
        {pendingData.extractedItems.map((item) => (
          <Card key={item.id} className="border-slate-200/60 shadow-sm overflow-hidden bg-white group">
            <CardContent className="p-0 flex items-stretch">
              
              {/* Subtle visual indicator: No harsh reds, just amber for attention */}
              <div className={`w-1.5 shrink-0 ${
                item.flag === "high" || item.flag === "low" 
                  ? "bg-amber-400" 
                  : "bg-emerald-400/60"
              }`} />

              <div className="flex-1 p-3.5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.marker}</p>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">{item.unit}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Input 
                    type="text" 
                    value={item.value} 
                    onChange={(e) => handleValueChange(item.id, e.target.value)}
                    className="w-20 h-9 text-right font-medium text-slate-800 border-slate-200 focus-visible:ring-slate-400 bg-slate-50 rounded-lg"
                  />
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 pb-safe z-20">
        <div className="flex items-start gap-2 mb-4 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
            Please ensure these values match your physical report. Accurate data ensures precise longitudinal trend tracking.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <Button 
            onClick={handleConfirm} 
            disabled={isSaving}
            className="w-full h-12 text-base font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all duration-200"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-slate-300" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" />
            )}
            {isSaving ? "Archiving..." : "Archive to Vault"}
          </Button>
        </div>
      </div>

    </div>
  );
}