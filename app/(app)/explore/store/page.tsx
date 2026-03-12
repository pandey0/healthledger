import {
  ShoppingBag, Clock, Star, ChevronRight,
  Zap, Shield, RefreshCw, CheckCircle2, Tag, Package,
} from "lucide-react";

const categories = [
  { name: "Vitamins & Minerals", icon: "💊", count: "480+ products", color: "from-amber-400 to-orange-500" },
  { name: "Health Devices", icon: "🩺", count: "120+ products", color: "from-blue-500 to-indigo-600" },
  { name: "Home Test Kits", icon: "🧪", count: "85+ kits", color: "from-teal-500 to-cyan-600" },
  { name: "Protein & Nutrition", icon: "💪", count: "200+ products", color: "from-emerald-500 to-green-600" },
  { name: "Mental Wellness", icon: "🧠", count: "60+ products", color: "from-violet-500 to-purple-600" },
  { name: "Gut Health", icon: "🦠", count: "95+ products", color: "from-rose-500 to-pink-600" },
];

const featured = [
  {
    name: "Omega-3 Fish Oil 1000mg",
    brand: "HealthVit",
    price: "₹649",
    originalPrice: "₹899",
    rating: "4.8",
    reviews: "2,340",
    tag: "AI Recommended",
    tagColor: "bg-violet-50 text-violet-700 border-violet-100",
    badge: "27% OFF",
    emoji: "🐟",
    reason: "Based on your low HDL cholesterol trend",
  },
  {
    name: "Vitamin D3 60,000 IU",
    brand: "Wellbeing Nutrition",
    price: "₹399",
    originalPrice: "₹599",
    rating: "4.9",
    reviews: "1,890",
    tag: "AI Recommended",
    tagColor: "bg-violet-50 text-violet-700 border-violet-100",
    badge: "33% OFF",
    emoji: "☀️",
    reason: "Your Vitamin D is below optimal range",
  },
  {
    name: "Glucometer + 25 Strips",
    brand: "Accu-Chek",
    price: "₹1,299",
    originalPrice: "₹1,899",
    rating: "4.7",
    reviews: "4,210",
    tag: "Best Seller",
    tagColor: "bg-amber-50 text-amber-700 border-amber-100",
    badge: "32% OFF",
    emoji: "🩸",
    reason: null,
  },
];

const features = [
  { icon: Zap, title: "AI-Curated for You", desc: "Products recommended based on your actual biomarker deficiencies", color: "bg-violet-50 text-violet-600" },
  { icon: Shield, title: "Authenticated Products", desc: "Only genuine products from authorized distributors", color: "bg-blue-50 text-blue-600" },
  { icon: RefreshCw, title: "Auto-Replenishment", desc: "Never run out — subscribe for timely restocking", color: "bg-emerald-50 text-emerald-600" },
];

export default function ExploreStorePage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">
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

        {/* AI Recommended section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">AI Picks</p>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full border border-violet-100">
              Personalised
            </span>
          </div>
          <div className="space-y-3">
            {featured.map((item) => (
              <div key={item.name} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm group">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-[16px] flex items-center justify-center text-3xl shrink-0 border border-slate-100">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className={`inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1.5 ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <p className="text-[14px] font-bold text-slate-800 leading-tight">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{item.brand}</p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    {item.reason && (
                      <p className="text-[11px] text-violet-600 font-semibold mt-2 bg-violet-50 rounded-[8px] px-2 py-1 border border-violet-100">
                        💡 {item.reason}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[17px] font-extrabold text-slate-800">{item.price}</span>
                        <span className="text-[12px] font-medium text-slate-400 line-through">{item.originalPrice}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-bold text-slate-600">{item.rating}</span>
                          <span className="text-[11px] text-slate-300">({item.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Browse Categories</p>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm group cursor-pointer overflow-hidden relative">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${cat.color} transition-opacity`} />
                <div className={`w-10 h-10 rounded-[12px] bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl mb-3`}>
                  {cat.icon}
                </div>
                <p className="text-[13px] font-bold text-slate-800 leading-snug">{cat.name}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">{cat.count}</p>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-violet-700 to-purple-700 rounded-[24px] p-6 text-center shadow-lg shadow-violet-500/20">
          <CheckCircle2 className="w-10 h-10 text-violet-200 mx-auto mb-3" />
          <h3 className="text-[18px] font-extrabold text-white mb-2">Launching soon</h3>
          <p className="text-[13px] text-violet-100 font-medium mb-4">
            AI-personalised health shopping based on your actual lab results. Join the waitlist.
          </p>
          <button className="w-full bg-white text-violet-700 font-bold text-[14px] py-3.5 rounded-[14px] hover:bg-violet-50 transition-colors active:scale-[0.98] shadow-sm">
            Join Waitlist — It&apos;s Free
          </button>
        </div>

      </div>
    </div>
  );
}
