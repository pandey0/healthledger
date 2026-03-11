import Link from "next/link";
import {
  FlaskConical, ArrowLeft, Clock, CheckCircle2, MapPin,
  Star, ChevronRight, Truck, Shield, Zap, TestTube,
} from "lucide-react";

const partners = [
  { name: "Thyrocare", logo: "TC", tagline: "1200+ tests · Home collection", rating: "4.8", color: "from-orange-500 to-red-500" },
  { name: "Redcliffe Labs", logo: "RC", tagline: "Pan-India · NABL certified", rating: "4.7", color: "from-blue-500 to-indigo-500" },
  { name: "1mg Labs", logo: "1M", tagline: "Same day reports · 500+ cities", rating: "4.6", color: "from-teal-500 to-cyan-500" },
  { name: "Dr Lal Path Labs", logo: "DL", tagline: "75 years of excellence", rating: "4.9", color: "from-purple-500 to-violet-500" },
];

const popularTests = [
  { name: "Complete Blood Count (CBC)", price: "₹299", time: "6 hrs", params: "25+ parameters", tag: "Popular" },
  { name: "HbA1c (Diabetes)", price: "₹399", time: "24 hrs", params: "1 parameter", tag: "Top Rated" },
  { name: "Lipid Profile", price: "₹449", time: "12 hrs", params: "8 parameters", tag: "Trending" },
  { name: "Thyroid Panel (T3 T4 TSH)", price: "₹599", time: "24 hrs", params: "3 parameters", tag: "" },
  { name: "Vitamin D Total", price: "₹699", time: "48 hrs", params: "1 parameter", tag: "" },
  { name: "Liver Function Test", price: "₹549", time: "12 hrs", params: "11 parameters", tag: "" },
];

const features = [
  { icon: Truck, title: "Free Home Collection", desc: "Phlebotomist comes to you, no travel needed", color: "bg-teal-50 text-teal-600" },
  { icon: Shield, title: "NABL Certified Labs", desc: "Only government accredited labs on our platform", color: "bg-blue-50 text-blue-600" },
  { icon: Zap, title: "Auto-synced Reports", desc: "Results automatically land in your Health Vault", color: "bg-violet-50 text-violet-600" },
];

export default function LabPage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <div className="relative px-6 pt-10 pb-10">
          <Link href="/home" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 mb-4">
            <Clock className="w-3.5 h-3.5 text-teal-200" />
            <span className="text-[12px] font-bold text-white uppercase tracking-wide">Launching Soon</span>
          </div>

          <h1 className="text-[30px] font-extrabold text-white leading-tight mb-3 tracking-tight">
            Book Lab Tests<br />from Home
          </h1>
          <p className="text-[14px] text-teal-100 font-medium leading-relaxed max-w-sm">
            Compare prices across top labs, book a home phlebotomist, and get results synced directly to your Health Vault.
          </p>

          <div className="flex gap-3 mt-6">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <TestTube className="w-4 h-4 text-teal-200" />
              <span className="text-[13px] font-bold text-white">1,200+ Tests</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <MapPin className="w-4 h-4 text-teal-200" />
              <span className="text-[13px] font-bold text-white">500+ Cities</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-8 space-y-8">

        {/* Features */}
        <div className="grid grid-cols-1 gap-3">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">{f.title}</p>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lab Partners */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Partner Labs</p>
          <div className="grid grid-cols-2 gap-3">
            {partners.map((p) => (
              <div key={p.name} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}`} />
                <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-extrabold text-[13px] mb-3`}>
                  {p.logo}
                </div>
                <p className="text-[13px] font-bold text-slate-800 leading-tight">{p.name}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">{p.tagline}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold text-slate-600">{p.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Catalogue */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Popular Tests</p>
          <div className="space-y-2.5">
            {popularTests.map((test) => (
              <div key={test.name} className="bg-white rounded-[18px] p-4 border border-slate-100 shadow-sm flex items-center gap-4 group">
                <div className="w-10 h-10 bg-teal-50 rounded-[12px] flex items-center justify-center shrink-0">
                  <FlaskConical className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-bold text-slate-800 truncate">{test.name}</p>
                    {test.tag && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded-full border border-teal-100">
                        {test.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-slate-400 font-medium">{test.params}</span>
                    <span className="text-[11px] text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {test.time}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] font-extrabold text-slate-800">{test.price}</p>
                  <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors mt-0.5 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notify CTA */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-[24px] p-6 text-center shadow-lg shadow-teal-500/20">
          <CheckCircle2 className="w-10 h-10 text-teal-200 mx-auto mb-3" />
          <h3 className="text-[18px] font-extrabold text-white mb-2">Be the first to know</h3>
          <p className="text-[13px] text-teal-100 font-medium mb-4">
            Lab booking goes live in early 2026. Join the waitlist.
          </p>
          <button className="w-full bg-white text-teal-700 font-bold text-[14px] py-3.5 rounded-[14px] hover:bg-teal-50 transition-colors active:scale-[0.98] shadow-sm">
            Join Waitlist — It&apos;s Free
          </button>
        </div>

      </div>
    </div>
  );
}
