"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Upload } from "lucide-react";

export default function UploadError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-[20px] flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>
      <h2 className="text-[20px] font-extrabold text-slate-800 mb-2">Upload failed</h2>
      <p className="text-[14px] text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
        Something went wrong during the upload. Please check your file and try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-[#1A365D] text-white font-bold text-[14px] px-5 py-3 rounded-[14px] hover:bg-[#12243e] transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/vault"
          className="flex items-center gap-2 bg-white text-slate-600 font-bold text-[14px] px-5 py-3 rounded-[14px] border border-slate-200 hover:border-slate-300 transition-all"
        >
          <Upload className="w-4 h-4" />
          Go to Vault
        </Link>
      </div>
    </div>
  );
}
