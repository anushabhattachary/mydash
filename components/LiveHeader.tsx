"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import { Leaf } from "lucide-react";
import { useSession } from "next-auth/react";

export default function LiveHeader() {
  const { settings } = useStore();
  const { data: session } = useSession();
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 px-4 md:px-12 bg-white/40 backdrop-blur-md rounded-b-3xl shadow-sm border-b border-sand/50 mb-8 sticky top-0 z-50">
      <div>
        <h1 className="text-4xl font-serif text-slate-800 flex items-center gap-3">
          Welcome back, {settings.name}
          <Leaf className="text-sage w-8 h-8" />
        </h1>
        <div className="flex items-center gap-2 mt-2 font-medium text-slate-500">
          <span>{format(time, "EEEE, MMMM d")}</span>
          <span>·</span>
          <span>{format(time, "h:mm a")}</span>
        </div>
      </div>
      <div className="mt-4 md:mt-0 px-4 py-2 bg-white/60 rounded-full border border-sand shadow-sm flex items-center gap-2 text-sm text-slate-600">
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
    </header>
  );
}
