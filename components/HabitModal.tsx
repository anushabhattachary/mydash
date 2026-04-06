"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, Repeat, Palette } from "lucide-react";
import {
  Habit,
  RecurrenceRule,
  RecurrencePreset,
  HABIT_COLORS,
  getRecurrenceLabel,
} from "@/lib/store";

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, "id" | "completedDates" | "createdAt">) => void;
  onDelete?: () => void;
  initialHabit?: Habit | null;
}

const DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
];

const RECURRENCE_PRESETS: { label: string; value: RecurrencePreset }[] = [
  { label: "Daily", value: "daily" },
  { label: "Every N days", value: "every_n_days" },
  { label: "Weekly", value: "weekly" },
  { label: "Specific days", value: "specific_days" },
  { label: "Biweekly", value: "biweekly" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function HabitModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialHabit,
}: HabitModalProps) {
  const isEditing = !!initialHabit;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [title, setTitle] = useState("");
  const [timeSlot, setTimeSlot] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [colorTag, setColorTag] = useState(HABIT_COLORS[0].value);
  const [recurrenceType, setRecurrenceType] = useState<RecurrencePreset>("daily");
  const [interval, setInterval] = useState(2);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]); // Monday
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate fields when editing
  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setTimeSlot(initialHabit.timeSlot);
      setDuration(initialHabit.duration);
      setColorTag(initialHabit.colorTag);
      setRecurrenceType(initialHabit.recurrence.type);
      setInterval(initialHabit.recurrence.interval ?? 2);
      setSelectedDays(initialHabit.recurrence.daysOfWeek ?? [1]);
    } else {
      // Reset for new habit
      setTitle("");
      setTimeSlot("09:00");
      setDuration(30);
      setColorTag(HABIT_COLORS[0].value);
      setRecurrenceType("daily");
      setInterval(2);
      setSelectedDays([1]);
    }
    setShowDeleteConfirm(false);
  }, [initialHabit, isOpen]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const buildRecurrence = (): RecurrenceRule => {
    switch (recurrenceType) {
      case "daily":
        return { type: "daily" };
      case "every_n_days":
        return { type: "every_n_days", interval };
      case "weekly":
        return { type: "weekly", daysOfWeek: selectedDays.slice(0, 1) };
      case "specific_days":
        return { type: "specific_days", daysOfWeek: selectedDays };
      case "biweekly":
        return { type: "biweekly", daysOfWeek: selectedDays.slice(0, 1) };
      default:
        return { type: "daily" };
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      timeSlot,
      duration,
      colorTag,
      recurrence: buildRecurrence(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.();
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const needsDayPicker =
    recurrenceType === "weekly" ||
    recurrenceType === "specific_days" ||
    recurrenceType === "biweekly";

  const recurrencePreview = getRecurrenceLabel(buildRecurrence());

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[100] w-auto md:w-[480px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl border border-sand shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand/50">
              <h3 className="text-xl font-serif text-slate-800">
                {isEditing ? "Edit Habit" : "New Habit"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Habit name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Yoga"
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white/80 focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay text-slate-800 placeholder:text-slate-300 transition-all"
                  autoFocus
                />
              </div>

              {/* Time & Duration row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Start time
                  </label>
                  <input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white/80 focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white/80 focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay text-slate-800 transition-all appearance-none"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColorTag(c.value)}
                      className={`w-9 h-9 rounded-full ${c.value} transition-all border-2 ${
                        colorTag === c.value
                          ? "border-slate-800 scale-110 shadow-md"
                          : "border-transparent hover:scale-105"
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" />
                  Recurrence
                </label>
                <select
                  value={recurrenceType}
                  onChange={(e) =>
                    setRecurrenceType(e.target.value as RecurrencePreset)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white/80 focus:outline-none focus:ring-2 focus:ring-clay/30 focus:border-clay text-slate-800 transition-all appearance-none"
                >
                  {RECURRENCE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                {/* Interval input for every_n_days */}
                {recurrenceType === "every_n_days" && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm text-slate-500">Every</span>
                    <input
                      type="number"
                      min={2}
                      max={30}
                      value={interval}
                      onChange={(e) =>
                        setInterval(Math.max(2, Number(e.target.value)))
                      }
                      className="w-20 px-3 py-2 rounded-lg border border-sand bg-white/80 focus:outline-none focus:ring-2 focus:ring-clay/30 text-center text-slate-800"
                    />
                    <span className="text-sm text-slate-500">days</span>
                  </div>
                )}

                {/* Day picker */}
                {needsDayPicker && (
                  <div className="mt-3 flex gap-1.5">
                    {DAY_NAMES.map((name, i) => {
                      const isSelected = selectedDays.includes(i);
                      const isSingleSelect =
                        recurrenceType === "weekly" ||
                        recurrenceType === "biweekly";
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (isSingleSelect) {
                              setSelectedDays([i]);
                            } else {
                              toggleDay(i);
                            }
                          }}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-clay text-white shadow-sm"
                              : "bg-sand/50 text-slate-400 hover:bg-sand hover:text-slate-600"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Preview */}
                <div className="mt-2 text-xs text-slate-400">
                  Schedule: <span className="font-medium text-slate-500">{recurrencePreview}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-sand/50 flex items-center justify-between gap-3">
              {isEditing && onDelete ? (
                <button
                  onClick={handleDelete}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    showDeleteConfirm
                      ? "bg-red-500 text-white"
                      : "text-red-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {showDeleteConfirm ? "Confirm delete" : "Delete"}
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-clay text-white hover:bg-terra transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isEditing ? "Save changes" : "Add habit"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
