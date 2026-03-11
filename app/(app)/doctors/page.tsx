import Link from "next/link";
import {
  Stethoscope, ArrowLeft, Clock, Star, MessageSquareText,
  Video, Calendar, Award, Users, ChevronRight, CheckCircle2,
} from "lucide-react";

const specialties = [
  { name: "General Physician", icon: "🩺", count: "240+ doctors", color: "bg-blue-50 border-blue-100" },
  { name: "Cardiologist", icon: "❤️", count: "85+ doctors", color: "bg-rose-50 border-rose-100" },
  { name: "Endocrinologist", icon: "🔬", count: "60+ doctors", color: "bg-amber-50 border-amber-100" },
  { name: "Diabetologist", icon: "💉", count: "95+ doctors", color: "bg-teal-50 border-teal-100" },
  { name: "Neurologist", icon: "🧠", count: "45+ doctors", color: "bg-violet-50 border-violet-100" },
  { name: "Gastroenterologist", icon: "🫁", count: "70+ doctors", color: "bg-emerald-50 border-emerald-100" },
];

const doctors = [
  {
    name: "Dr. Ananya Mehta",
    specialty: "Endocrinologist",
    exp: "14 yrs exp",
    rating: "4.9",
    reviews: "1,240",
    hospital: "Apollo Hospital, Mumbai",
    available: "Today, 3:00 PM",
    fee: "₹800",
    initials: "AM",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Dr. Karan Sethi",
    specialty: "Cardiologist",
    exp: "18 yrs exp",
    rating: "4.8",
    reviews: "980",
    hospital: "Fortis, Delhi",
    available: "Tomorrow, 11:00 AM",
    fee: "₹1,200",
    initials: "KS",
    color: "from-rose-500 to-red-600",
  },
  {
    name: "Dr. Priya Nair",
    specialty: "General Physician",
    exp: "9 yrs exp",
    rating: "4.7",
    reviews: "2,100",
    hospital: "Manipal, Bangalore",
    available: "Today, 5:30 PM",
    fee: "₹500",
    initials: "PN",
    color: "from-teal-500 to-emerald-600",
  },
];

const features = [
  { icon: Video, title: "Video Consultations", desc: "HD video calls with verified specialists", color: "bg-blue-50 text-blue-600" },
  { icon: Award, title: "Verified Credentials", desc: "Every doctor verified with MCI registration", color: "bg-emerald-50 text-emerald-600" },
  { icon: Users, title: "Shared Health Timeline", desc: "Share your Vault data securely before the call", color: "bg-violet-50 text-violet-600" },
];

export default function DoctorsPage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500 pb-12">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(ellipse 80% 60% at 50% 0%, white, transparent)"}} />
        <div className="relative px-6 pt-10 pb-10">
          <Link href="/home" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 mb-4">
            <Clock className="w-3.5 h-3.5 text-emerald-200" />
            <span className="text-[12px] font-bold text-white uppercase tracking-wide">Launching Soon</span>
          </div>

          <h1 className="text-[30px] font-extrabold text-white leading-tight mb-3 tracking-tight">
            Consult Expert<br />Doctors Online
          </h1>
          <p className="text-[14px] text-emerald-100 font-medium leading-relaxed max-w-sm">
            Book verified specialists. Share your health trends securely before your appointment. Get better, faster.
          </p>

          <div className="flex gap-3 mt-6 flex-wrap">
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              <span className="text-[13px] font-bold text-white">500+ Doctors</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2">
              <Calendar className="w-4 h-4 text-emerald-200" />
              <span className="text-[13px] font-bold text-white">Same Day Slots</span>
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

        {/* Specialties */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Browse Specialties</p>
          <div className="grid grid-cols-2 gap-3">
            {specialties.map((s) => (
              <div key={s.name} className={`rounded-[18px] p-4 border ${s.color} bg-white flex items-center gap-3 group cursor-pointer`}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-[13px] font-bold text-slate-800 leading-snug">{s.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{s.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Preview Cards */}
        <div>
          <p className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-3">Top Doctors</p>
          <div className="space-y-3">
            {doctors.map((doc) => (
              <div key={doc.name} className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm group">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${doc.color} flex items-center justify-center text-white font-extrabold text-[15px] shrink-0 shadow-sm`}>
                    {doc.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[15px] font-bold text-slate-800 leading-tight">{doc.name}</p>
                        <p className="text-[12px] text-slate-500 font-semibold mt-0.5">{doc.specialty} · {doc.exp}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 rounded-full px-2 py-1 shrink-0">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-amber-700">{doc.rating}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-2">{doc.hospital}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {doc.available}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-extrabold text-slate-800">{doc.fee}</span>
                        <button className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[12px] font-bold px-3 py-1.5 rounded-[10px] border border-emerald-100 hover:bg-emerald-100 transition-colors">
                          <MessageSquareText className="w-3.5 h-3.5" />
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[24px] p-6 text-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
          <h3 className="text-[18px] font-extrabold text-white mb-2">Doctor Connect is coming</h3>
          <p className="text-[13px] text-emerald-100 font-medium mb-4">
            Get early access when we launch. Share your health history securely with specialists.
          </p>
          <button className="w-full bg-white text-emerald-700 font-bold text-[14px] py-3.5 rounded-[14px] hover:bg-emerald-50 transition-colors active:scale-[0.98] shadow-sm">
            Join the Waitlist
          </button>
        </div>

      </div>
    </div>
  );
}
