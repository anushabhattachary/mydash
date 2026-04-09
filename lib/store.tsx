"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { nextSunday, getDay, differenceInCalendarDays, startOfDay } from "date-fns";
import { useUserProfile } from "@/lib/userProfile";

// ─── Recurrence ────────────────────────────────────────────────
export type RecurrencePreset =
  | "daily"
  | "every_n_days"
  | "weekly"
  | "specific_days"
  | "biweekly";

export interface RecurrenceRule {
  type: RecurrencePreset;
  interval?: number;       // for "every_n_days": e.g. 2 = every 2 days
  daysOfWeek?: number[];   // for "specific_days" / "weekly": 0=Sun … 6=Sat
}

// ─── Habit ─────────────────────────────────────────────────────
export interface Habit {
  id: string;
  title: string;
  timeSlot: string;         // HH:mm start time
  duration: number;          // minutes
  colorTag: string;
  recurrence: RecurrenceRule;
  completedDates: string[];  // YYYY-MM-DD
  createdAt: string;         // ISO date string for recurrence anchor
}

/** Returns true if `habit` should appear on the given `date`. */
export function shouldShowHabitToday(habit: Habit, date: Date = new Date()): boolean {
  const rule = habit.recurrence;
  const today = startOfDay(date);
  const created = startOfDay(new Date(habit.createdAt));

  switch (rule.type) {
    case "daily":
      return true;

    case "every_n_days": {
      const interval = rule.interval ?? 2;
      const diff = differenceInCalendarDays(today, created);
      return diff >= 0 && diff % interval === 0;
    }

    case "weekly": {
      // Show on the same day-of-week as the first entry in daysOfWeek, or the day it was created
      const targetDay = rule.daysOfWeek?.[0] ?? getDay(created);
      return getDay(today) === targetDay;
    }

    case "specific_days": {
      const days = rule.daysOfWeek ?? [];
      return days.includes(getDay(today));
    }

    case "biweekly": {
      const targetDay = rule.daysOfWeek?.[0] ?? getDay(created);
      if (getDay(today) !== targetDay) return false;
      const diff = differenceInCalendarDays(today, created);
      const weeksDiff = Math.floor(diff / 7);
      return weeksDiff % 2 === 0;
    }

    default:
      return true;
  }
}

// ─── Recurrence labels ────────────────────────────────────────
const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getRecurrenceLabel(rule: RecurrenceRule): string {
  switch (rule.type) {
    case "daily":
      return "Daily";
    case "every_n_days":
      return `Every ${rule.interval ?? 2} days`;
    case "weekly":
      return `Every ${DAY_NAMES_SHORT[rule.daysOfWeek?.[0] ?? 0]}`;
    case "specific_days":
      return (rule.daysOfWeek ?? []).map((d) => DAY_NAMES_SHORT[d]).join(", ");
    case "biweekly":
      return `Biweekly (${DAY_NAMES_SHORT[rule.daysOfWeek?.[0] ?? 0]})`;
    default:
      return "Custom";
  }
}

// ─── Color palette ─────────────────────────────────────────────
export const HABIT_COLORS = [
  { name: "Sage", value: "bg-sage" },
  { name: "Terra", value: "bg-terra" },
  { name: "Clay", value: "bg-clay" },
  { name: "Lavender", value: "bg-[#9b8ec4]" },
  { name: "Ocean", value: "bg-[#5b9bb4]" },
  { name: "Rose", value: "bg-[#c47e8e]" },
  { name: "Moss", value: "bg-[#7a9a6d]" },
  { name: "Amber", value: "bg-[#c49a4e]" },
];

// ─── Other types ───────────────────────────────────────────────
export type PriorityType = "low" | "medium" | "high";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number;
  colorTag: string;
  type: "short" | "long";
}

export interface Todo {
  id: string;
  title: string;
  dueDate?: string;
  priority: PriorityType;
  completed: boolean;
  notes?: string;
}

export interface UserSettings {
  name: string;
  recurByDefault: boolean;
}

// ─── Store ─────────────────────────────────────────────────────
interface StoreState {
  settings: UserSettings;
  habits: Habit[];
  goals: Goal[];
  todos: Todo[];
}

interface StoreContextType extends StoreState {
  setSettings: (settings: Partial<UserSettings>) => void;
  addHabit: (habit: Omit<Habit, "id" | "completedDates" | "createdAt">) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addTodo: (todo: Omit<Todo, "id" | "completed">) => void;
  updateTodo: (id: string, todo: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  clearAllData: () => void;
}

const defaultState: StoreState = {
  settings: { name: "Anusha", recurByDefault: true },
  habits: [
    {
      id: "h1",
      title: "Morning Yoga",
      timeSlot: "07:00",
      duration: 30,
      colorTag: "bg-sage",
      recurrence: { type: "daily" },
      completedDates: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: "h2",
      title: "Evening Reading",
      timeSlot: "20:00",
      duration: 45,
      colorTag: "bg-clay",
      recurrence: { type: "daily" },
      completedDates: [],
      createdAt: new Date().toISOString(),
    },
  ],
  goals: [
    {
      id: "g1",
      type: "short",
      title: "Build a consistent morning routine",
      progress: 40,
      colorTag: "bg-sage",
    },
    {
      id: "g2",
      type: "long",
      title: "Financial independence by 30",
      progress: 15,
      colorTag: "bg-terra",
    },
  ],
  todos: [
    {
      id: "t1",
      title: "Review weekly budget",
      dueDate: nextSunday(new Date()).toISOString(),
      priority: "medium",
      completed: false,
    },
  ],
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState | null>(null);

  const { profile, isLoaded } = useUserProfile();

  // Load from LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    if (!profile) {
      // If no profile, we can load default state or clear it. 
      // But typically OnboardingModal is covering the screen.
      setState(defaultState);
      return;
    }

    const { userId } = profile;
    const settingsSaved = localStorage.getItem(`lilac_${userId}_settings`);
    const habitsSaved = localStorage.getItem(`lilac_${userId}_habits`);
    const goalsSaved = localStorage.getItem(`lilac_${userId}_goals`);
    const todosSaved = localStorage.getItem(`lilac_${userId}_todos`);

    let loadedSettings = defaultState.settings;
    let loadedHabits = defaultState.habits;
    let loadedGoals = defaultState.goals;
    let loadedTodos = defaultState.todos;

    // Check if we have the old "anusha-dashboard" data to migrate
    const oldSaved = localStorage.getItem("anusha-dashboard");
    if (oldSaved && !settingsSaved && !habitsSaved) {
      // Migrate from old state to new
      try {
        const parsed = JSON.parse(oldSaved);
        if (parsed.settings) loadedSettings = parsed.settings;
        if (parsed.goals) loadedGoals = parsed.goals;
        if (parsed.todos) loadedTodos = parsed.todos;
        if (parsed.habits) {
          loadedHabits = parsed.habits.map((h: Habit & { type?: string }) => ({
            ...h,
            duration: h.duration ?? 30,
            timeSlot: h.timeSlot ?? "09:00",
            createdAt: h.createdAt ?? new Date().toISOString(),
            recurrence:
              typeof h.recurrence === "string"
                ? { type: h.recurrence === "custom" ? "daily" : h.recurrence }
                : h.recurrence ?? { type: "daily" },
          }));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          loadedHabits = loadedHabits.map(({ type, ...rest }: any) => rest);
        }
        localStorage.removeItem("anusha-dashboard");
      } catch (e) {
        console.error("Failed to migrate data", e);
      }
    } else {
      if (settingsSaved) { loadedSettings = JSON.parse(settingsSaved); }
      if (habitsSaved) {
        const parsedHabits = JSON.parse(habitsSaved);
        loadedHabits = parsedHabits.map((h: Habit & { type?: string }) => ({
            ...h,
            duration: h.duration ?? 30,
            timeSlot: h.timeSlot ?? "09:00",
            createdAt: h.createdAt ?? new Date().toISOString(),
            recurrence:
              typeof h.recurrence === "string"
                ? { type: h.recurrence === "custom" ? "daily" : h.recurrence }
                : h.recurrence ?? { type: "daily" },
        }));
      }
      if (goalsSaved) { loadedGoals = JSON.parse(goalsSaved); }
      if (todosSaved) { loadedTodos = JSON.parse(todosSaved); }
    }

    setState({
      settings: loadedSettings,
      habits: loadedHabits,
      goals: loadedGoals,
      todos: loadedTodos,
    });
  }, [profile, profile?.userId, isLoaded]); // Re-load when userId changes
  useEffect(() => {
    if (state && profile?.userId) {
      localStorage.setItem(`lilac_${profile.userId}_settings`, JSON.stringify(state.settings));
      localStorage.setItem(`lilac_${profile.userId}_habits`, JSON.stringify(state.habits));
      localStorage.setItem(`lilac_${profile.userId}_goals`, JSON.stringify(state.goals));
      localStorage.setItem(`lilac_${profile.userId}_todos`, JSON.stringify(state.todos));
    }
  }, [state, profile, profile?.userId]);

  if (!state) return null;

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const value: StoreContextType = {
    ...state,
    setSettings: (newSettings) =>
      setState({ ...state, settings: { ...state.settings, ...newSettings } }),

    addHabit: (h) =>
      setState({
        ...state,
        habits: [
          ...state.habits,
          { ...h, id: generateId(), completedDates: [], createdAt: new Date().toISOString() },
        ],
      }),
    updateHabit: (id, h) =>
      setState({
        ...state,
        habits: state.habits.map((i) => (i.id === id ? { ...i, ...h } : i)),
      }),
    deleteHabit: (id) =>
      setState({ ...state, habits: state.habits.filter((i) => i.id !== id) }),

    addGoal: (g) =>
      setState({ ...state, goals: [...state.goals, { ...g, id: generateId() }] }),
    updateGoal: (id, g) =>
      setState({
        ...state,
        goals: state.goals.map((i) => (i.id === id ? { ...i, ...g } : i)),
      }),
    deleteGoal: (id) =>
      setState({ ...state, goals: state.goals.filter((i) => i.id !== id) }),

    addTodo: (t) =>
      setState({
        ...state,
        todos: [...state.todos, { ...t, id: generateId(), completed: false }],
      }),
    updateTodo: (id, t) =>
      setState({
        ...state,
        todos: state.todos.map((i) => (i.id === id ? { ...i, ...t } : i)),
      }),
    deleteTodo: (id) =>
      setState({ ...state, todos: state.todos.filter((i) => i.id !== id) }),

    clearAllData: () => setState(defaultState),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
