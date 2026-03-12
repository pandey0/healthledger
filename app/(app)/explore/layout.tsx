"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { href: "/explore/lab", label: "Lab Tests", color: "text-cyan-600", activeBg: "bg-cyan-100" },
  { href: "/explore/doctors", label: "Doctors", color: "text-emerald-600", activeBg: "bg-emerald-100" },
  { href: "/explore/store", label: "Store", color: "text-violet-600", activeBg: "bg-violet-100" },
];

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {/* Sticky Tab Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 rounded-full text-[14px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? `${tab.activeBg} ${tab.color}`
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
