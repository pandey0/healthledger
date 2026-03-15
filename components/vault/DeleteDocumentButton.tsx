"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDocument } from "@/lib/actions/vault";

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteDocument(documentId);
      if (result.success) {
        toast.success("Report deleted");
        router.push("/vault");
      } else {
        toast.error(result.error ?? "Failed to delete report");
        setConfirming(false);
      }
    });
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] border border-red-200 text-red-500 text-[13px] font-semibold hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Report
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-[14px] px-4 py-2.5">
      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
      <span className="text-[12px] font-semibold text-red-700 flex-1">Delete this report and all its markers?</span>
      <button
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 px-2 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-[10px] transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        {isPending ? "Deleting…" : "Yes, delete"}
      </button>
    </div>
  );
}
