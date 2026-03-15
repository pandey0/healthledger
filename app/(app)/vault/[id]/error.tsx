"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function DocumentError({
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
    <div className="flex flex-col px-6 pt-8 pb-12">
      <Link
        href="/vault"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Vault
      </Link>
      <div className="flex flex-col items-center text-center mt-8">
        <div className="w-14 h-14 bg-red-50 rounded-[20px] flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-[20px] font-extrabold text-slate-800 mb-2">Couldn&apos;t load report</h2>
        <p className="text-[14px] text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
          There was a problem loading this document. It may have been moved or deleted.
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-[#1A365D] text-white font-bold text-[14px] px-5 py-3 rounded-[14px] hover:bg-[#12243e] transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
