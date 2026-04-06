"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { nextSunday } from "date-fns";

export type HabitType = "timed" | "floating";
export type RecurrenceType = "daily" | "weekly" | "custom";
export type PriorityType = "low" | "medium" | "high";

export interface Habit {
  id: string;
  type: HabitType;
  title: string;
  timeSlot?: string; // HH:mm
  colorTag: string;
  recurrence: RecurrenceType;
  completedDates: string[]; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number; // 0-100
  colorTag: string;
  type: "short" | "long";
}

export interface Todo {
  id: string;
  title: string;
  dueDate?: string; // ISO string
  priority: PriorityType;
  completed: boolean;
  notes?: string;
}

export interface UserSettings {
  name: string;
  recurByDefault: boolean;
}

interface StoreState {
  settings: UserSettings;
  habits: Habit[];
  goals: Goal[];
  todos: Todo[];
}

interface StoreContextType extends StoreState {
  setSettings: (settings: Partial<UserSettings>) => void;
  addHabit: (habit: Omit<Habit, "id" | "completedDates">) => void;
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
      type: "timed",
      title: "Morning Yoga",
      timeSlot: "07:00",
      colorTag: "bg-sage",
      recurrence: "daily",
      completedDates: [],
    },
    {
      id: "h2",
      type: "floating",
      title: "Budget check-in",
      colorTag: "bg-terra",
      recurrence: "weekly",
      completedDates: [],
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

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("anusha-dashboard");
    if (saved) {
      setState(JSON.parse(saved));
    } else {
      setState(defaultState);
    }
  }, []);

  // Save to LocalStorage inside state updates, or by an effect
  useEffect(() => {
    if (state) {
      localStorage.setItem("anusha-dashboard", JSON.stringify(state));
    }
  }, [state]);

  if (!state) return null; // or a loading state

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const value: StoreContextType = {
    ...state,
    setSettings: (newSettings) => setState({ ...state, settings: { ...state.settings, ...newSettings } }),
    addHabit: (h) => setState({ ...state, habits: [...state.habits, { ...h, id: generateId(), completedDates: [] }] }),
    updateHabit: (id, h) => setState({ ...state, habits: state.habits.map((i) => (i.id === id ? { ...i, ...h } : i)) }),
    deleteHabit: (id) => setState({ ...state, habits: state.habits.filter((i) => i.id !== id) }),
    
    addGoal: (g) => setState({ ...state, goals: [...state.goals, { ...g, id: generateId() }] }),
    updateGoal: (id, g) => setState({ ...state, goals: state.goals.map((i) => (i.id === id ? { ...i, ...g } : i)) }),
    deleteGoal: (id) => setState({ ...state, goals: state.goals.filter((i) => i.id !== id) }),
    
    addTodo: (t) => setState({ ...state, todos: [...state.todos, { ...t, id: generateId(), completed: false }] }),
    updateTodo: (id, t) => setState({ ...state, todos: state.todos.map((i) => (i.id === id ? { ...i, ...t } : i)) }),
    deleteTodo: (id) => setState({ ...state, todos: state.todos.filter((i) => i.id !== id) }),

    clearAllData: () => setState(defaultState),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}
