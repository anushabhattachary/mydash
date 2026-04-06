"use client";

import { useEffect, useState, useRef } from "react";
import {
  useStore,
  Habit,
  shouldShowHabitToday,
  getRecurrenceLabel,
} from "@/lib/store";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Plus, Check } from "lucide-react";
import HabitModal from "./HabitModal";

export default function Timeline() {
  const { habits, addHabit, updateHabit, deleteHabit } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter habits for today based on recurrence rules
  const todaysHabits = habits.filter((h) => shouldShowHabitToday(h));

  // Calculate top percentage for the "now" line
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowPercentage = (nowMinutes / (24 * 60)) * 100;

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollPos =
        (container.scrollHeight * nowPercentage) / 100 -
        container.clientHeight / 2;
      container.scrollTop = scrollPos;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const getTopPercentage = (timeString: string) => {
    const [h, m] = timeString.split(":").map(Number);
    return ((h * 60 + m) / (24 * 60)) * 100;
  };

  const getHeightPercentage = (durationMinutes: number) => {
    return (durationMinutes / (24 * 60)) * 100;
  };

  const toggleComplete = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const isCompleted = habit.completedDates.includes(todayStr);
    const newDates = isCompleted
      ? habit.completedDates.filter((d) => d !== todayStr)
      : [...habit.completedDates, todayStr];
    updateHabit(habit.id, { completedDates: newDates });
  };

  const formatTimeRange = (startTime: string, durationMinutes: number) => {
    const [h, m] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${format(startDate, "h:mm a")} – ${format(endDate, "h:mm a")}`;
  };

  const openNewHabit = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const openEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleSave = (
    data: Omit<Habit, "id" | "completedDates" | "createdAt">
  ) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
  };

  const handleDelete = () => {
    if (editingHabit) {
      deleteHabit(editingHabit.id);
    }
  };

  return (
    <>
      <section className="flex flex-col h-[calc(100vh-180px)] bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden flex-1">
        {/* Header */}
        <div className="p-6 border-b border-sand/50 bg-white/60 flex items-center justify-between">
          <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3">
            <Clock className="text-clay w-6 h-6" />
            Daily Timeline
          </h2>
          <button
            onClick={openNewHabit}
            className="p-2.5 rounded-xl bg-clay/10 hover:bg-clay/20 text-clay hover:text-terra transition-all group"
            title="Add new habit"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Timeline */}
        <div
          className="flex-1 overflow-y-auto relative timeline-bg custom-scrollbar"
          ref={scrollRef}
        >
          <div className="h-[1536px] relative w-full pt-2 min-w-[300px]">
            {/* Time markers */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full flex items-center gap-4 px-4"
                style={{ top: `${(hour / 24) * 100}%` }}
              >
                <div className="text-xs font-semibold text-slate-400 w-16 text-right uppercase tracking-wider relative -top-3">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                    ? `${hour} AM`
                    : hour === 12
                    ? "12 PM"
                    : `${hour - 12} PM`}
                </div>
                <div className="flex-1 border-t border-sand border-dashed" />
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

            {/* Habit blocks */}
            {todaysHabits.map((habit) => {
              const todayStr = format(new Date(), "yyyy-MM-dd");
              const isCompleted = habit.completedDates.includes(todayStr);
              const topPct = getTopPercentage(habit.timeSlot);
              const heightPct = getHeightPercentage(habit.duration);

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`absolute left-24 right-6 rounded-xl shadow-sm border border-white/20 p-3 ${habit.colorTag} text-white cursor-pointer transition-all hover:brightness-110 hover:shadow-md group ${
                    isCompleted ? "opacity-50" : ""
                  }`}
                  style={{
                    top: `${topPct}%`,
                    height: `max(${heightPct}%, 48px)`,
                    minHeight: "48px",
                  }}
                  onClick={() => openEditHabit(habit)}
                >
                  <div className="flex items-start justify-between h-full">
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium text-sm drop-shadow-sm ${
                          isCompleted ? "line-through" : ""
                        }`}
                      >
                        {habit.title}
                      </div>
                      <div className="text-xs opacity-80 mt-0.5">
                        {formatTimeRange(habit.timeSlot, habit.duration)}
                      </div>
                      <div className="text-[10px] opacity-60 mt-0.5 uppercase tracking-wider">
                        {getRecurrenceLabel(habit.recurrence)}
                      </div>
                    </div>
                    {/* Completion toggle */}
                    <button
                      onClick={(e) => toggleComplete(habit, e)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                        isCompleted
                          ? "bg-white/30 text-white"
                          : "bg-white/10 hover:bg-white/25 text-white/60 hover:text-white"
                      }`}
                      title={isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      <Check
                        className={`w-4 h-4 ${isCompleted ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Empty state */}
            {todaysHabits.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand/50 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-clay/50" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    No habits scheduled for today
                  </p>
                  <button
                    onClick={openNewHabit}
                    className="mt-3 text-clay hover:text-terra text-sm font-medium underline underline-offset-2 transition-colors"
                  >
                    Add your first habit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Today's summary bar */}
        <div className="border-t border-sand/50 bg-white/60 px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            {todaysHabits.length} habit{todaysHabits.length !== 1 ? "s" : ""}{" "}
            today
          </span>
          <span className="text-xs text-slate-400">
            {todaysHabits.filter((h) =>
              h.completedDates.includes(format(new Date(), "yyyy-MM-dd"))
            ).length}{" "}
            / {todaysHabits.length} done
          </span>
        </div>
      </section>

      {/* Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        onDelete={editingHabit ? handleDelete : undefined}
        initialHabit={editingHabit}
      />
    </>
  );
}
