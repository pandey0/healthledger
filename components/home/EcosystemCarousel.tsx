"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FlaskConical, Stethoscope, ShoppingBag, ArrowRight } from "lucide-react";

const slides = [
  {
    href: "/lab",
    icon: FlaskConical,
    title: "Book Lab Tests",
    subtitle: "Home collection from partner labs",
    badge: "Beta",
    from: "from-cyan-500",
    to: "to-teal-600",
    badgeBg: "bg-white/20",
  },
  {
    href: "/doctors",
    icon: Stethoscope,
    title: "Consult Doctors",
    subtitle: "500+ specialists, same-day slots",
    badge: "Beta",
    from: "from-emerald-500",
    to: "to-teal-600",
    badgeBg: "bg-white/20",
  },
  {
    href: "/store",
    icon: ShoppingBag,
    title: "Health Store",
    subtitle: "AI-curated supplements & devices",
    badge: "Beta",
    from: "from-violet-500",
    to: "to-purple-700",
    badgeBg: "bg-white/20",
  },
];

export default function EcosystemCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const slideWidth = el.offsetWidth * 0.82;
    const idx = Math.round(scrollLeft / slideWidth);
    setActiveIndex(Math.min(idx, slides.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 -mx-6 px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {slides.map((slide) => (
          <Link
            key={slide.href}
            href={slide.href}
            className="snap-start shrink-0 w-[82%] outline-none group"
          >
            <div className={`relative bg-gradient-to-br ${slide.from} ${slide.to} rounded-[24px] p-5 shadow-lg overflow-hidden h-[140px] flex flex-col justify-between`}>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-[14px] flex items-center justify-center shrink-0">
                    <slide.icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[16px] font-extrabold text-white tracking-tight">{slide.title}</p>
                    <p className="text-[12px] text-white/70 font-medium mt-0.5">{slide.subtitle}</p>
                  </div>
                </div>
                <span className={`${slide.badgeBg} text-white/80 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0`}>
                  {slide.badge}
                </span>
              </div>

              <div className="relative z-10 flex items-center gap-1.5 self-end">
                <span className="text-[12px] font-bold text-white/60 group-hover:text-white/90 transition-colors">Explore</span>
                <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-5 h-1.5 bg-slate-400"
                : "w-1.5 h-1.5 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
