import { signIn } from "@/auth";
import { ShieldCheck, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <main className="relative flex-1 max-w-6xl mx-auto px-6 pt-24 pb-32 text-center flex flex-col items-center justify-center overflow-hidden">
      
      {/* Visualized: The subtle background motion graphic */}
      <div className="absolute inset-0 -z-10 bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <Badge variant="outline" className="mb-8 py-1.5 px-4 text-xs font-semibold text-slate-600 bg-white/50 backdrop-blur-sm border-slate-200 shadow-sm gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Phase 1: The Intelligent Archive is Live
      </Badge>
      
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter mb-6 leading-[1.05] max-w-4xl">
        Your health data, <br className="hidden md:block" />
        <span className="text-slate-500">finally making sense.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
        Stop carrying messy folders. Start understanding your data. Securely store, analyze, and chat with your medical history using advanced AI.
      </p>

      <div className="flex flex-col items-center gap-6">
        <form action={async () => { "use server"; await signIn("google", { redirectTo: "/vault" }); }}>
          <Button size="lg" className="h-14 px-8 text-base bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:-translate-y-0.5 transition-all duration-200 gap-3">
            Start Your Free Ledger
            <ArrowRight className="w-4 h-4 opacity-70" />
          </Button>
        </form>
        
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400 bg-slate-50/50 backdrop-blur-sm p-4 rounded-xl border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure HIPAA Compliant Architecture
        </div>
      </div>
    </main>
  );
}