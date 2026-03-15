"use client";

import Link from "next/link";
import { FlaskConical, Stethoscope, ShoppingBag, ArrowRight } from "lucide-react";

const items = [
  {
    href: "/explore/lab",
    icon: FlaskConical,
    title: "Book Lab Tests",
    subtitle: "Home collection",
    from: "from-cyan-500",
    to: "to-teal-600",
  },
  {
    href: "/explore/doctors",
    icon: Stethoscope,
    title: "Consult Doctors",
    subtitle: "Same-day slots",
    from: "from-emerald-500",
    to: "to-teal-600",
  },
  {
    href: "/explore/store",
    icon: ShoppingBag,
    title: "Health Store",
    subtitle: "Curated picks",
    from: "from-violet-500",
    to: "to-purple-700",
  },
];

export default function EcosystemCarousel() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-0.5">
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Explore</p>
        <Link href="/explore" className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="outline-none group"
          >
            <div className={`relative bg-gradient-to-br ${item.from} ${item.to} rounded-[18px] p-3.5 shadow-md overflow-hidden h-[90px] flex flex-col justify-between active:scale-[0.97] transition-transform`}>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="w-8 h-8 bg-white/20 rounded-[10px] flex items-center justify-center relative z-10">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-[12px] font-extrabold text-white leading-tight">{item.title}</p>
                <p className="text-[9px] text-white/65 font-medium mt-0.5 leading-snug">{item.subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
