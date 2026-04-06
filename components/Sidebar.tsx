"use client";

import { Clock, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Timeline", icon: Clock, href: "/" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <nav className="fixed md:static bottom-0 left-0 right-0 md:w-24 bg-white/80 md:bg-white/40 backdrop-blur-md md:border-r border-sand/50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] md:shadow-none z-50 flex md:flex-col items-center justify-around md:justify-start px-2 py-4 md:py-12 gap-1 md:gap-8 min-h-[auto] md:min-h-screen border-t md:border-t-0 border-sand">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
              isActive
                ? "bg-sage/20 text-slate-800 scale-110 shadow-sm"
                : "text-slate-400 hover:text-slate-600 hover:bg-black/5"
            }`}
          >
            <Icon className="w-6 h-6 md:w-7 md:h-7" />
            <span className="text-[10px] md:text-xs font-medium mt-1 md:mt-2">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
