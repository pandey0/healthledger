"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderHeart, MessageSquareText } from "lucide-react";

const links = [
  { href: "/home",  label: "Home",          icon: Home },
  { href: "/vault", label: "Medical Vault",  icon: FolderHeart },
  { href: "/chat",  label: "AI Assistant",   icon: MessageSquareText },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/home" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              active
                ? "bg-[#1A365D]/8 text-[#1A365D] font-bold"
                : "text-slate-500 hover:text-[#1A365D] hover:bg-slate-50 font-semibold"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`}
              strokeWidth={active ? 2.5 : 2}
            />
            <span className="text-[15px]">{label}</span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1A365D]" />
            )}
          </Link>
        );
      })}
    </>
  );
}
