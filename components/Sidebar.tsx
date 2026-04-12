"use client";

import { Clock, Settings, Flower2, CheckSquare, Target } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const navItems = [
  { label: "Today", icon: Clock, href: "/", tab: "today", emoji: "🏠" },
  { label: "Cycle", icon: Flower2, href: "/?tab=cycle", tab: "cycle", emoji: "🌸" },
  { label: "To-Do", icon: CheckSquare, href: "/?tab=todo", tab: "todo", emoji: "✓" },
  { label: "Goals", icon: Target, href: "/?tab=goals", tab: "goals", emoji: "🎯" },
  { label: "Settings", icon: Settings, href: "/settings", tab: "settings", emoji: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "today";

  const getIsActive = (item: typeof navItems[0]) => {
    if (item.href === "/settings") return pathname === "/settings";
    if (pathname !== "/") return false;
    return currentTab === item.tab;
  };

  return (
    <>
      {/* Desktop Sidebar — unchanged from original behavior */}
      <nav className="hidden md:flex md:static md:w-24 bg-white/40 backdrop-blur-md border-r border-sand/50 z-50 flex-col items-center justify-start py-12 gap-8 min-h-screen">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all touch-target ${
                isActive
                  ? "bg-sage/20 text-slate-800 scale-110 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 hover:bg-black/5"
              }`}
            >
              <Icon className="w-7 h-7" />
              <span className="text-xs font-medium mt-2">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-sand/60 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-area-bottom">
        <div className="flex items-center justify-around px-1 pt-2 pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] touch-target transition-all no-select ${
                  isActive
                    ? "text-terra"
                    : "text-slate-400"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 transition-all ${isActive ? "scale-110" : ""}`} />
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 transition-colors ${
                  isActive ? "text-terra" : "text-slate-400"
                }`}>
                  {item.label}
                </span>
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavDot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-terra"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
