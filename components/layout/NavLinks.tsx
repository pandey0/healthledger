"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderHeart, MessageSquareText, FlaskConical, Stethoscope, ShoppingBag } from "lucide-react";

const coreLinks = [
  { href: "/home",  label: "Home",         icon: Home,            color: "text-sky-400" },
  { href: "/vault", label: "Medical Vault", icon: FolderHeart,     color: "text-emerald-400" },
  { href: "/chat",  label: "AI Assistant",  icon: MessageSquareText, color: "text-violet-400" },
];

const ecosystemLinks = [
  { href: "/lab",     label: "Book Lab Tests", icon: FlaskConical,  color: "text-cyan-400",    badge: "Beta", explorePath: "/explore/lab" },
  { href: "/doctors", label: "Find Doctors",   icon: Stethoscope,   color: "text-emerald-400", badge: "Beta", explorePath: "/explore/doctors" },
  { href: "/store",   label: "Health Store",   icon: ShoppingBag,   color: "text-violet-400",  badge: "Beta", explorePath: "/explore/store" },
];

export default function NavLinks({ section = "core" }: { section?: "core" | "ecosystem" }) {
  const pathname = usePathname();
  const links = section === "ecosystem" ? ecosystemLinks : coreLinks;

  return (
    <>
      {links.map(({ href, label, icon: Icon, color, badge, explorePath }) => {
        const active = pathname === href || (href !== "/home" && pathname.startsWith(href)) || (explorePath && pathname === explorePath);
        return (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all ${
              active
                ? "bg-white/12 text-white"
                : "text-white/50 hover:text-white/80 hover:bg-white/6"
            }`}
          >
            <div className={`w-7 h-7 rounded-[9px] flex items-center justify-center shrink-0 transition-all ${
              active ? "bg-white/15" : "bg-white/8 group-hover:bg-white/12"
            }`}>
              <Icon className={`w-4 h-4 ${active ? color : "text-white/50 group-hover:text-white/70"}`} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={`text-[14px] font-semibold flex-1 ${active ? "font-bold" : ""}`}>{label}</span>
            {badge && !active && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
                {badge}
              </span>
            )}
            {active && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.replace("text-", "bg-")}`} />
            )}
          </Link>
        );
      })}
    </>
  );
}
