"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { genUploader } from "uploadthing/client";

const { uploadFiles } = genUploader();

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "extracting" | "uploading" | "success">("idle");
  const [fileName, setFileName] = useState<string>("");

  const handleSmartUpload = async (selectedFile: File) => {
    setFileName(selectedFile.name);
    
    try {
      // 🟢 STEP 1: Fast AI Extraction (via Python FastAPI)
      setStatus("extracting");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const aiResponse = await fetch("http://localhost:8000/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!aiResponse.ok) {
        throw new Error("Could not read this document. Please ensure it is a valid report.");
      }
      
      const aiData = await aiResponse.json();

      // 🟢 STEP 2: Secure Storage (UploadThing)
      setStatus("uploading");
      
      const utResponse = await uploadFiles("medicalReport", {
        files: [selectedFile],
      });
      
      const permanentFileUrl = utResponse[0].url;

      // 🟢 STEP 3: Pass to Review Screen
      const sessionPayload = {
        extractedItems: aiData.data,
        fileName: selectedFile.name,
        fileUrl: permanentFileUrl,
      };
      
      sessionStorage.setItem("pendingVaultData", JSON.stringify(sessionPayload));

      setStatus("success");
      setTimeout(() => router.push("/upload/review"), 1200);

    } catch (error: any) {
      setStatus("idle");
      alert(error.message || "An error occurred. Please try a clearer image.");
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-700 p-6 max-w-md mx-auto">
      
      <section className="mt-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Upload Report</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Add lab reports or health summaries to your vault.</p>
      </section>

      {/* State 1: Idle (Dropzone) */}
      {status === "idle" && (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group active:scale-[0.98]">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-5 group-hover:-translate-y-1 transition-transform duration-300">
              <UploadCloud className="w-7 h-7 text-slate-600" />
            </div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Tap to select document</p>
            <p className="text-xs text-slate-400 font-medium">JPG, PNG, or WebP (Max 4MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleSmartUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      )}

      {/* States 2, 3, 4: Processing & Success */}
      {status !== "idle" && (
        <Card className="border-slate-200 shadow-sm mt-4 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-center justify-center">
                {status === "success" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                ) : (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 tracking-tight">
                {status === "extracting" && "1/2: Analyzing document..."}
                {status === "uploading" && "2/2: Securing in vault..."}
                {status === "success" && "Analysis complete."}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {status === "success" ? "Preparing your review screen..." : fileName}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Indicator */}
      <div className="mt-auto pt-6 flex items-start gap-2.5 text-slate-400 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <FileText className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <p className="text-[11px] leading-relaxed font-medium">
          Documents are processed using secure, stateless infrastructure. Your data is encrypted at rest and in transit.
        </p>
      </div>
    </div>
  );
}