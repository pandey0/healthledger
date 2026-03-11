import Link from "next/link";
import {
  FlaskConical, Stethoscope, ShoppingBag,
  ArrowRight, Compass,
} from "lucide-react";

const sections = [
  {
    href: "/lab",
    icon: FlaskConical,
    title: "Book Lab Tests",
    desc: "Get blood work, thyroid panels, CBC and more — collected at your doorstep from partner labs like Thyrocare, Redcliffe, and Dr Lal.",
    from: "from-cyan-500",
    to: "to-teal-600",
    badge: "Beta",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-100",
  },
  {
    href: "/doctors",
    icon: Stethoscope,
    title: "Consult Doctors",
    desc: "Connect with 500+ specialists. Share your health timeline directly so they see the full picture before your appointment.",
    from: "from-emerald-500",
    to: "to-teal-600",
    badge: "Beta",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    href: "/store",
    icon: ShoppingBag,
    title: "Health Store",
    desc: "AI-curated supplements, home testing kits, and wellness devices — recommended based on your actual biomarker data.",
    from: "from-violet-500",
    to: "to-purple-700",
    badge: "Beta",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-100",
  },
];

export default function ExplorePage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-28">
      <header className="px-6 pt-10 pb-2">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[#0F1F3D] to-[#1A365D] flex items-center justify-center shadow-sm">
            <Compass className="w-4.5 h-4.5 text-teal-400" />
          </div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Explore HealthLedger</h1>
        </div>
        <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
          Coming soon features to complete your health journey.
        </p>
      </header>

      <main className="px-6 mt-6 space-y-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="block group outline-none">
            <div className="relative bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden hover:border-slate-200 hover:shadow-md transition-all">
              <div className={`h-2 bg-gradient-to-r ${s.from} ${s.to}`} />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${s.from} ${s.to} rounded-[16px] flex items-center justify-center shrink-0 shadow-sm`}>
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[16px] font-bold text-slate-800">{s.title}</p>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${s.badgeColor}`}>
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3">
                  <span className="text-[12px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
