"use client";

import { useEffect, useState, useRef } from "react";
import { useStore, Habit } from "@/lib/store";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, CheckSquare, GripVertical } from "lucide-react";

export default function Timeline() {
  const { habits, updateHabit } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const timedHabits = habits.filter((h) => h.type === "timed");
  const floatingHabits = habits.filter((h) => h.type === "floating");

  // Calculate top percentage for the "now" line
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowPercentage = (nowMinutes / (24 * 60)) * 100;

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollPos = (container.scrollHeight * nowPercentage) / 100 - container.clientHeight / 2;
      container.scrollTop = scrollPos;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const getHabitTopPercentage = (timeString?: string) => {
    if (!timeString) return 0;
    const [h, m] = timeString.split(":").map(Number);
    return ((h * 60 + m) / (24 * 60)) * 100;
  };

  const toggleFloatingHabit = (habit: Habit) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const isCompletedInfo = habit.completedDates.includes(todayStr);
    const newDates = isCompletedInfo
      ? habit.completedDates.filter((d) => d !== todayStr)
      : [...habit.completedDates, todayStr];
    updateHabit(habit.id, { completedDates: newDates });
  };

  return (
    <section className="flex flex-col h-[calc(100vh-180px)] bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden flex-1">
      <div className="p-6 border-b border-sand/50 bg-white/60">
        <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3">
          <Clock className="text-clay w-6 h-6" />
          Daily Timeline
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto relative timeline-bg custom-scrollbar" ref={scrollRef}>
        <div className="h-[1536px] relative w-full pt-2 min-w-[300px]">
          {/* Time markers */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full flex items-center gap-4 px-4"
              style={{ top: `${(hour / 24) * 100}%` }}
            >
              <div className="text-xs font-semibold text-slate-400 w-16 text-right uppercase tracking-wider relative -top-3">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
              <div className="flex-1 border-t border-sand border-dashed"></div>
            </div>
          ))}

          {/* Now line */}
          <div
             className="absolute w-full z-20 flex items-center gap-4 px-4 pointer-events-none transition-all duration-1000"
             style={{ top: `${nowPercentage}%` }}
          >
            <div className="text-xs font-bold text-terra w-16 text-right relative -top-3 animate-pulse">
              {format(currentTime, "h:mm a")}
            </div>
            <div className="flex-1 border-t-2 border-terra relative">
              <div className="absolute left-[-4px] top-[-5px] w-2 h-2 rounded-full bg-terra shadow-[0_0_8px_rgba(217,128,100,0.8)]" />
            </div>
          </div>

          {/* Timed Blocks */}
          {timedHabits.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`absolute left-24 right-6 h-14 rounded-xl shadow-sm border border-white/20 p-3 ${habit.colorTag} text-white cursor-pointer hover:brightness-105 transition-all`}
              style={{ top: `${getHabitTopPercentage(habit.timeSlot)}%` }}
            >
              <div className="font-medium text-sm drop-shadow-sm">{habit.title}</div>
              <div className="text-xs opacity-80 mt-0.5">{habit.timeSlot}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Habits */}
      <div className="h-1/3 min-h-[200px] border-t border-sand/50 bg-linen/50 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Free-floating tasks</h3>
        <div className="flex flex-col gap-2">
          {floatingHabits.map((habit) => {
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const isCompleted = habit.completedDates.includes(todayStr);

            return (
               <div
                  key={habit.id}
                  className={`bg-white/80 border ${isCompleted ? 'border-transparent opacity-60' : 'border-sand'} p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-white`}
               >
                 <div className="cursor-grab active:cursor-grabbing text-slate-300">
                    <GripVertical className="w-4 h-4" />
                 </div>
                 <button onClick={() => toggleFloatingHabit(habit)} className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isCompleted ? `${habit.colorTag} border-transparent text-white` : 'border-slate-300'}`}>
                    {isCompleted && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                 </button>
                 <span className={`flex-1 font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                   {habit.title}
                 </span>
                 <div className={`w-2.5 h-2.5 rounded-full ${habit.colorTag}`} />
               </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
