"use client";

import { useState, useEffect } from "react";
import { Check, Trash2, Plus, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProfile } from "@/lib/userProfile";

type Task = {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  completed: boolean;
};

export default function TasksForToday() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(["General", "Work", "Personal"]);
  
  const [isClient, setIsClient] = useState(false);
  
  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("General");
  const [newCategory, setNewCategory] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  
  const { profile, isLoaded } = useUserProfile();

  useEffect(() => {
    if (!isLoaded || !profile) return;
    setIsClient(true);
    try {
      const savedTasks = localStorage.getItem(`lilac_${profile.userId}_tasksForToday`);
      const savedCategories = localStorage.getItem(`lilac_${profile.userId}_taskCategories`);
      
      const oldSavedTasks = localStorage.getItem("tasksForToday");
      const oldSavedCategories = localStorage.getItem("taskCategories");
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else if (oldSavedTasks) {
        setTasks(JSON.parse(oldSavedTasks));
        localStorage.setItem(`lilac_${profile.userId}_tasksForToday`, oldSavedTasks);
        localStorage.removeItem("tasksForToday");
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else if (oldSavedCategories) {
        setCategories(JSON.parse(oldSavedCategories));
        localStorage.setItem(`lilac_${profile.userId}_taskCategories`, oldSavedCategories);
        localStorage.removeItem("taskCategories");
      }
    } catch (e) {
      console.error("Failed to load tasks from local storage", e);
    }
  }, [isLoaded, profile, profile?.userId]);

  // Listen for cross-component habit additions (e.g. from Cycle Tracker)
  useEffect(() => {
    const handleTasksUpdated = () => {
      if (!profile) return;
      try {
        const savedTasks = localStorage.getItem(`lilac_${profile.userId}_tasksForToday`);
        const savedCategories = localStorage.getItem(`lilac_${profile.userId}_taskCategories`);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        if (savedCategories) setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error("Failed to reload tasks from local storage", e);
      }
    };
    window.addEventListener("tasks-updated", handleTasksUpdated);
    return () => window.removeEventListener("tasks-updated", handleTasksUpdated);
  }, [profile, profile?.userId]);

  useEffect(() => {
    if (isClient && profile?.userId) {
      localStorage.setItem(`lilac_${profile.userId}_tasksForToday`, JSON.stringify(tasks));
      localStorage.setItem(`lilac_${profile.userId}_taskCategories`, JSON.stringify(categories));
    }
  }, [tasks, categories, isClient, profile, profile?.userId]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalCategory = category;
    if (isAddingNewCategory && newCategory.trim()) {
      finalCategory = newCategory.trim();
      if (!categories.includes(finalCategory)) {
        setCategories([...categories, finalCategory]);
      }
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim(),
      category: finalCategory,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTitle("");
    setDescription("");
    setDuration("");
    setNewCategory("");
    setIsAddingNewCategory(false);
    setCategory(finalCategory);
  };

  const toggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  if (!isClient) return null; // Prevent hydration mismatch

  // Group tasks by category
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <section className="flex flex-col bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-sand/50 bg-white/60">
        <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3">
          <ListTodo className="text-clay w-6 h-6" />
          Tasks for Today
        </h2>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* Add Task Form */}
        <form onSubmit={addTask} className="bg-white/50 border border-white/20 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 focus-within:text-clay transition-colors">
              <label className="text-sm font-medium text-slate-600 transition-colors">Task Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-white/60 border border-sand rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-clay/30 transition-all font-medium"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 focus-within:text-clay transition-colors">
              <label className="text-sm font-medium text-slate-600 transition-colors">Category</label>
              <div className="flex gap-2">
                {!isAddingNewCategory ? (
                  <select 
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === "NEW_CATEGORY") {
                        setIsAddingNewCategory(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="flex-1 w-full bg-white/60 border border-sand rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-clay/30 transition-all font-medium cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="NEW_CATEGORY" className="font-bold text-clay">+ Create New Category</option>
                  </select>
                ) : (
                  <div className="flex-1 flex gap-2 w-full">
                    <input 
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="New category name"
                      className="flex-1 bg-white/60 border border-sand rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-clay/30 transition-all font-medium"
                      autoFocus
                    />
                    <button 
                      type="button"
                      onClick={() => setIsAddingNewCategory(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm px-2 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 md:col-span-2 text-sm focus-within:text-clay transition-colors">
               <label className="font-medium text-slate-600 transition-colors">Description (Optional)</label>
               <input
                 type="text"
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 placeholder="Brief details..."
                 className="w-full bg-white/60 border border-sand rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-clay/30 transition-all font-medium"
               />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2 focus-within:text-clay transition-colors">
              <label className="text-sm font-medium text-slate-600 transition-colors">Estimated Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 30 mins, 2 hours"
                className="w-full bg-white/60 border border-sand rounded-xl px-4 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-clay/30 transition-all font-medium"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-2 bg-clay hover:bg-terra text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 self-start shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </form>

        {/* Task List grouped by category */}
        <div className="flex flex-col gap-8">
          {Object.entries(groupedTasks).map(([cat, catTasks]) => (
            <div key={cat} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1 border-b border-sand/50 pb-2">
                {cat}
              </h3>
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {catTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${
                        task.completed 
                          ? 'bg-slate-50/50 border-sand/30 opacity-60' 
                          : 'bg-white border-sand shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors ${
                            task.completed 
                              ? 'bg-sage border-sage text-white' 
                              : 'border-clay/40 hover:border-clay text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold text-slate-800 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-sm text-slate-500">
                              {task.description}
                            </span>
                          )}
                          {task.duration && (
                            <span className="text-xs font-medium text-clay bg-clay/10 px-2 py-0.5 rounded-md inline-block w-fit mt-1">
                              {task.duration}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sand/50 flex items-center justify-center">
                <ListTodo className="w-8 h-8 text-clay/50" />
              </div>
              <p className="text-slate-400 font-medium">No tasks for today. Enjoy your day!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
