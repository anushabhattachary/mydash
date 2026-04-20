"use client";

import { useStore, Workout } from "@/lib/store";
import { Dumbbell, Plus, Play, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutViewState } from "./WorkoutManager";

const COLOR_TAGS = [
  { name: "Sage", value: "bg-sage" },
  { name: "Terra", value: "bg-terra" },
  { name: "Clay", value: "bg-clay" },
  { name: "Rose", value: "bg-[#c47e8e]" },
  { name: "Sand", value: "bg-sand" },
];

export default function WorkoutLibrary({ onNavigate }: { onNavigate: (view: WorkoutViewState, id?: string) => void }) {
  const { workouts, addWorkout } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLOR_TAGS[0].value);

  const calculateTotalTime = (workout: Workout) => {
    let totalSeconds = 0;
    workout.exercises.forEach((ex) => {
      if (ex.type === "exercise") {
        totalSeconds += (ex.secondsPerRep || 0) * (ex.reps || workout.globalReps);
      } else if (ex.type === "break") {
        totalSeconds += ex.secondsPerRep || 0;
      }
    });
    totalSeconds *= workout.setRepeats;
    return Math.max(1, Math.round(totalSeconds / 60)); // minimum 1 min
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const newWorkout = addWorkout({
      name: newName,
      colorTag: newColor,
      globalReps: 12,
      setRepeats: 1,
      exercises: [],
    });
    setIsModalOpen(false);
    onNavigate("EDITOR", newWorkout.id);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-terra w-6 h-6" />
          <h2 className="text-2xl font-serif text-slate-800">Your Workouts</h2>
        </div>
      </div>
      <p className="text-sm text-slate-500 font-medium -mt-4 mb-4">Tap to start · Hold to edit</p>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {workouts.length === 0 ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 text-center py-8 italic font-serif">
              No workouts yet. Create one to begin.
            </motion.p>
          ) : (
            workouts.map((workout) => {
              // We'll use a timer approach to detect long-press
              let timerId: NodeJS.Timeout;

              const handlePointerDown = () => {
                timerId = setTimeout(() => {
                  onNavigate("EDITOR", workout.id);
                }, 500); // 500ms long press
              };

              const handlePointerUp = () => {
                clearTimeout(timerId);
              };

              return (
                <motion.div
                  key={workout.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="bg-white/70 backdrop-blur-sm border border-sand shadow-sm rounded-2xl p-4 flex items-center justify-between cursor-pointer select-none touch-none group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-12 rounded-full ${workout.colorTag}`} />
                    <div className="flex flex-col">
                      <h3 className="font-serif text-lg font-medium text-slate-800">{workout.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {workout.exercises.filter((e) => e.type === "exercise").length} exercises · ~{calculateTotalTime(workout)} min
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onNavigate("PLAYER", workout.id);
                    }}
                    className="w-10 h-10 rounded-full bg-terra/10 text-terra flex items-center justify-center hover:bg-terra hover:text-white transition-colors"
                  >
                    <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => {
          setNewName("");
          setNewColor(COLOR_TAGS[0].value);
          setIsModalOpen(true);
        }}
        className="fixed md:absolute bottom-6 md:bottom-auto md:top-0 right-6 z-40 w-12 h-12 bg-terra text-white rounded-full shadow-lg flex items-center justify-center hover:bg-terra/90 hover:scale-105 active:scale-95 transition-all mb-[80px] md:mb-0"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-0"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-linen w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-serif text-slate-800 mb-6">New Workout</h2>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-2 uppercase">Workout Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Pilates Flow"
                    className="w-full bg-white/60 border border-sand rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terra/30 transition-shadow"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-500 mb-2 uppercase">Color Tag</label>
                  <div className="flex gap-3">
                    {COLOR_TAGS.map((tag) => (
                      <button
                        key={tag.name}
                        onClick={() => setNewColor(tag.value)}
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center border-2 ${tag.value} ${
                          newColor === tag.value ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title={tag.name}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="w-full bg-terra text-white font-medium rounded-xl py-3.5 mt-2 flex justify-center items-center gap-2 hover:bg-terra/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Workout <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
