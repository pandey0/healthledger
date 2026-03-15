"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import DemoTour from "./DemoTour";

export default function TourStarter({ isEmpty }: { isEmpty: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Take a tour
      </button>

      <DemoTour show={isEmpty} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
