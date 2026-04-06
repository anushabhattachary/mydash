"use client";

import { useState } from "react";
import { useStore, Todo } from "@/lib/store";
import { CheckSquare, Plus, AlertCircle, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isToday, isThisWeek, isThisMonth, parseISO } from "date-fns";

type TabType = "TODAY" | "THIS WEEK" | "THIS MONTH";

export default function ToDo() {
  const { todos, addTodo, updateTodo } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>("TODAY");

  const filteredTodos = todos.filter((todo) => {
    if (!todo.dueDate) return true;
    const date = parseISO(todo.dueDate);
    if (activeTab === "TODAY") return isToday(date);
    if (activeTab === "THIS WEEK") return isThisWeek(date);
    if (activeTab === "THIS MONTH") return isThisMonth(date);
    return true;
  });

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed === b.completed) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return a.completed ? 1 : -1;
  });

  const handleToggle = (todo: Todo) => {
    updateTodo(todo.id, { completed: !todo.completed });
  };

  const handleAdd = () => {
    addTodo({
      title: "New Task",
      priority: "medium",
      dueDate: new Date().toISOString(),
    });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <CheckSquare className="text-sage w-6 h-6" />
          <h2 className="text-2xl font-serif text-slate-800">To-Do List</h2>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 text-sm text-sage hover:text-sage/80 font-medium transition-colors bg-white/50 px-3 py-1.5 rounded-full shadow-sm hover:shadow">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="flex gap-4 border-b border-sand pb-2">
        {(["TODAY", "THIS WEEK", "THIS MONTH"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium transition-colors relative ${
              activeTab === tab ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="todoTab"
                className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-sage"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {sortedTodos.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-center py-8 italic font-serif">
              All caught up for {activeTab.toLowerCase()}.
            </motion.p>
          ) : (
            sortedTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white/70 backdrop-blur-sm border ${
                  todo.completed ? "border-transparent opacity-60" : "border-sand shadow-sm"
                } rounded-xl p-3 flex gap-3 items-center group transition-all`}
              >
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <button
                  onClick={() => handleToggle(todo)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    todo.completed
                      ? "bg-sage border-sage text-white"
                      : "border-slate-300 hover:border-sage bg-transparent"
                  }`}
                >
                  {todo.completed && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <input
                  type="text"
                  value={todo.title}
                  onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                  className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-sage/50 rounded px-1 transition-all ${
                    todo.completed ? "line-through text-slate-400" : "text-slate-700 font-medium"
                  }`}
                />

                <div className="flex items-center gap-2">
                  {todo.priority === "high" && <AlertCircle className="w-4 h-4 text-terra" />}
                  {todo.priority === "medium" && <AlertCircle className="w-4 h-4 text-clay" />}
                  {todo.priority === "low" && <AlertCircle className="w-4 h-4 text-sage" />}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
