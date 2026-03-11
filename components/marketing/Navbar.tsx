import { Activity } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="p-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-xl shadow-sm border border-emerald-400/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">HealthLedger</span>
        </div>
        
        <div className="flex items-center gap-3">
          <form action={async () => { "use server"; await signIn("google", { redirectTo: "/vault" }); }}>
            <Button variant="ghost" className="text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-100 rounded-full px-5">
              Sign In
            </Button>
          </form>
          <form action={async () => { "use server"; await signIn("google", { redirectTo: "/vault" }); }}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md font-medium px-6">
              Start Free
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}