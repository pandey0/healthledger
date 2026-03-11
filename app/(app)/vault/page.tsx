import Link from "next/link";
import { Plus, FolderHeart, FileText, Activity, ChevronRight, Search } from "lucide-react";
import { getUserDocuments } from "@/lib/dal/vault";
import VaultContent from "@/components/vault/VaultContent";

export default async function VaultPage() {
  const documents = await getUserDocuments();

  const serialized = documents.map((d) => ({
    id: d.id,
    fileName: d.fileName,
    createdAt: d.createdAt.toISOString(),
    _count: d._count,
    extractedData: d.extractedData,
  }));

  return (
    <div className="flex flex-col animate-in fade-in duration-700 pb-12">

      <header className="px-6 pt-10 pb-5">
        <h1 className="text-[32px] font-extrabold text-slate-800 tracking-tight">Medical Vault</h1>
        <p className="text-slate-500 mt-1 font-medium text-[14px]">
          Your personal archive of reports and extracted biomarkers.
        </p>
      </header>

      {documents.length > 0 && (
        <div className="px-6 mb-2">
          <div className="flex items-center gap-3 bg-white rounded-[16px] px-4 py-3 border border-slate-100 shadow-sm text-slate-400">
            <Search className="w-4 h-4 shrink-0" />
            <span className="text-[14px] font-medium">Search reports or biomarkers...</span>
          </div>
        </div>
      )}

      <main>
        {documents.length === 0 ? (
          <div className="px-6 flex flex-col items-center text-center mt-4">
            <div className="w-24 h-24 bg-white border border-slate-100 rounded-[28px] flex items-center justify-center mb-5 shadow-sm">
              <FolderHeart className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-[20px] font-extrabold text-slate-800 tracking-tight">Vault is empty</h2>
            <p className="text-[14px] text-slate-500 mt-2 max-w-xs font-medium leading-relaxed mb-6">
              Upload your first lab report to start building your health timeline.
            </p>
            <Link href="/upload">
              <button className="flex items-center gap-2 bg-[#1A365D] hover:bg-[#12243e] text-white font-bold text-[14px] px-6 py-3.5 rounded-[16px] shadow-md transition-all hover:-translate-y-0.5 active:scale-95">
                <Plus className="w-4 h-4" />
                Upload First Report
              </button>
            </Link>

            <div className="mt-10 w-full text-left space-y-3">
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">
                What gets stored
              </p>
              {[
                {
                  icon: FileText,
                  title: "Original reports",
                  desc: "Blood tests, lipid profiles, CBC, thyroid panels, scans.",
                },
                {
                  icon: Activity,
                  title: "Extracted biomarkers",
                  desc: "Every value is parsed — marker name, result, unit, and flag.",
                },
                {
                  icon: ChevronRight,
                  title: "Trend history",
                  desc: "Same biomarker across multiple reports builds your health timeline.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-start gap-4"
                >
                  <div className="w-9 h-9 bg-slate-50 rounded-[12px] flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">{item.title}</p>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <VaultContent documents={serialized} />

            <div className="px-6 mt-2">
              <Link href="/upload" className="block">
                <div className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-[20px] text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-white/50 transition-all">
                  <Plus className="w-4 h-4" />
                  <span className="text-[14px] font-semibold">Upload another report</span>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
