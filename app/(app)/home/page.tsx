import { auth } from "@/auth";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { 
  FolderHeart, 
  MessageSquareText, 
  Stethoscope, 
  FlaskConical, 
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowRight
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const today = format(new Date(), "EEEE, MMMM do");

  if (!userId) return null;

  // 1. Fetch the latest document to show the "Recent Upload" date
  const latestDoc = await prisma.document.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch the most recent anomaly (case-insensitive flag check for 'high' or 'low')
  const recentAnomaly = await prisma.extractedData.findFirst({
    where: { 
      userId, 
      flag: { in: ["high", "low", "High", "Low"] } 
    },
    orderBy: { testDate: "desc" },
  });

  // Future integration placeholders
  const lastPathDate = "No history"; 
  const lastDoctorDate = "No history"; 

  return (
    // FIXED: Removed 'h-full' so it can freely scroll within the desktop layout
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">
      
      {/* 🌤️ Dynamic Greeting */}
      <header className="px-6 pt-12 pb-6 z-10">
        <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {today}
        </p>
        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight leading-tight">
          Good morning, <br/>
          <span className="text-[#1A365D]">{firstName}.</span>
        </h1>
      </header>

      <main className="px-6 space-y-6">
        
        {/* 🚨 THE INSIGHT ENGINE: Dynamically adapts based on anomalies */}
        {recentAnomaly ? (
          <div className="bg-amber-50 rounded-[28px] p-6 border border-amber-200/60 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-amber-100 rounded-[16px] flex items-center justify-center shrink-0 text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-amber-900 tracking-tight">Attention required</h2>
                <p className="text-[13px] text-amber-700/80 font-medium leading-snug mt-1">
                  Your recent report on {format(new Date(recentAnomaly.testDate), "MMM d")} flagged <span className="font-bold">{recentAnomaly.markerName}</span> as {recentAnomaly.flag}.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-2">
              <button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[13px] font-bold py-3 rounded-[14px] transition-colors shadow-sm">
                Consult Doctor
              </button>
              <button className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[13px] font-bold py-3 rounded-[14px] transition-colors">
                Retest Path
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#1A365D] rounded-[28px] p-6 shadow-lg shadow-[#1A365D]/20 relative overflow-hidden">
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
             
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-[16px] flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white tracking-tight">All clear</h2>
                  <p className="text-[13px] text-blue-200 font-medium leading-snug mt-1">
                    No recent anomalies detected in your archived medical trends.
                  </p>
                </div>
             </div>
          </div>
        )}

        {/* 🧭 THE ACTION GRID: Clean navigation with Last Activity Dates */}
        <div>
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Core Actions</h2>
          
          {/* ✨ FIXED: Desktop Responsive Grid (md:grid-cols-3) ✨ */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-4">
            
            {/* Vault Access */}
            <Link href="/vault" className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between gap-4 active:scale-[0.98] transition-all outline-none group h-full">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-[#F4F3F0] rounded-[16px] text-[#1A365D] flex items-center justify-center shrink-0 group-hover:bg-[#1A365D] group-hover:text-white transition-colors">
                  <FolderHeart className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold text-[#111827]">Medical Vault</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Last upload: {latestDoc ? format(new Date(latestDoc.createdAt), "MMM d, yyyy") : "None"}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#1A365D] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>

            {/* Path Lab Access */}
            <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between gap-4 active:scale-[0.98] transition-all cursor-pointer group h-full">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-slate-50 rounded-[16px] text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold text-[#111827]">Pathology Lab</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Last test: {lastPathDate}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
            </div>

            {/* Doctor Access */}
            <div className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center justify-between gap-4 active:scale-[0.98] transition-all cursor-pointer group h-full">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-slate-50 rounded-[16px] text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-bold text-[#111827]">Consult Doctor</h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Last visit: {lastDoctorDate}</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
            </div>

          </div>
        </div>

        {/* 🤖 QUICK AI ACCESS */}
        {/* We give this a max-w-2xl so it doesn't stretch awkwardly across an entire ultra-wide monitor */}
        <Link href="/chat" className="block mt-4 outline-none group md:max-w-2xl">
          <div className="bg-[#1A365D] p-5 rounded-[20px] shadow-md flex items-center justify-between active:scale-[0.98] transition-all">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-[12px] text-white flex items-center justify-center backdrop-blur-sm">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">Ask Ledger AI</h3>
                  <p className="text-[12px] text-blue-200 font-medium mt-0.5">Analyze your history</p>
                </div>
             </div>
             <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

      </main>
    </div>
  );
}