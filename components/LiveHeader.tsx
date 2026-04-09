"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Leaf } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserProfile } from "@/lib/userProfile";

export default function LiveHeader() {
  const { data: session } = useSession();
  const { profile, isLoaded, setIsEditingProfile } = useUserProfile();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  let greeting = "Hello";
  if (hour >= 5 && hour < 12) greeting = "Good morning";
  else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17 && hour < 21) greeting = "Good evening";
  else greeting = "Hey night owl";

  // Prevent flash before profile loads
  if (!isLoaded) {
    return (
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 px-4 md:px-12 bg-white/40 backdrop-blur-md rounded-b-3xl shadow-sm border-b border-sand/50 mb-8 sticky top-0 z-40 h-[120px] animate-pulse">
      </header>
    );
  }

  const firstName = profile?.name ? profile.name.split(" ")[0] : "";

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 px-4 md:px-12 bg-white/40 backdrop-blur-md rounded-b-3xl shadow-sm border-b border-sand/50 mb-8 sticky top-0 z-40">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-serif text-slate-800 flex items-center gap-2">
          {greeting}, {firstName} {profile?.icon}
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Welcome to Lilac 🪻 — your sanctuary for today.
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs md:text-sm font-medium text-slate-500">
          <span>{format(time, "EEEE, MMMM d")}</span>
          <span>·</span>
          <span>{format(time, "h:mm a")}</span>
        </div>
      </div>

      <div className="mt-6 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 self-stretch md:self-auto">
        {/* Calendar status pill (optional, keeping from previous codebase) */}
        <div className="px-4 py-2 bg-white/60 rounded-full border border-sand shadow-sm flex items-center gap-2 text-xs md:text-sm text-slate-600 self-start md:self-auto">
          {session ? (
            <>
              <div className="w-2 h-2 rounded-full bg-sage animate-pulse"></div>
              Calendar connected ✓
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-terra opacity-50"></div>
              Calendar disconnected
            </>
          )}
        </div>

        {/* Profile and Brand */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          {profile && (
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 hover:bg-white rounded-full border border-sand shadow-sm transition-all hover:scale-105"
            >
              <span className="text-lg">{profile.icon}</span>
              <span className="font-semibold text-slate-700 text-sm">{firstName}</span>
            </button>
          )}

          <div className="h-6 w-[1px] bg-sand/80 hidden md:block"></div>

          <h2 className="text-2xl font-serif text-[#a691ba] tracking-wide relative">
            Lilac
          </h2>
        </div>
      </div>
    </header>
  );
}
