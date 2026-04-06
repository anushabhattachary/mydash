"use client";

import { useStore, Goal } from "@/lib/store";
import { Plus, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function Goals() {
  const { goals, addGoal, updateGoal } = useStore();

  const shortTerm = goals.filter((g) => g.type === "short");
  const longTerm = goals.filter((g) => g.type === "long");

  const handleAdd = (type: "short" | "long") => {
    addGoal({
      title: "New Goal",
      progress: 0,
      colorTag: "bg-clay",
      type,
    });
  };

  const renderGoal = (goal: Goal) => {
    return (
      <motion.div
        key={goal.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-sm border border-sand shadow-sm rounded-2xl p-4 flex flex-col gap-3 group hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <input
            className="font-serif text-lg text-slate-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-sage/50 rounded w-full"
            value={goal.title}
            onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
          />
          <div className={`w-3 h-3 rounded-full ${goal.colorTag} shrink-0 mt-2 ml-2`} />
        </div>
        <div className="w-full bg-sand rounded-full h-3 overflow-hidden mt-1 relative group-hover:bg-sand/80 transition-colors">
          <motion.div
            className={`h-full ${goal.colorTag}`}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <input
            type="range"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            min="0"
            max="100"
            value={goal.progress}
            onChange={(e) => updateGoal(goal.id, { progress: parseInt(e.target.value) })}
          />
        </div>
        <div className="text-xs text-slate-400 font-medium tracking-wide flex justify-between">
          <span>PROGRESS</span>
          <span>{goal.progress}%</span>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <Target className="text-terra w-6 h-6" />
        <h2 className="text-2xl font-serif text-slate-800">Goals</h2>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-500 uppercase tracking-wider text-sm">Short-Term</h3>
            <button onClick={() => handleAdd("short")} className="text-sage hover:text-sage/80 transition-colors p-1 rounded-full hover:bg-black/5">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {shortTerm.map(renderGoal)}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-500 uppercase tracking-wider text-sm">Long-Term</h3>
            <button onClick={() => handleAdd("long")} className="text-sage hover:text-sage/80 transition-colors p-1 rounded-full hover:bg-black/5">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {longTerm.map(renderGoal)}
        </div>
      </div>
    </section>
  );
}
