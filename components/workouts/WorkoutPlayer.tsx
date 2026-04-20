"use client";

import { useStore } from "@/lib/store";
import { ArrowLeft, Pause, Play, SkipForward, X, RefreshCcw } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { WorkoutViewState } from "./WorkoutManager";

type PlayerState = "IDLE" | "ACTIVE" | "PAUSED" | "DONE";

export default function WorkoutPlayer({ workoutId, onNavigate }: { workoutId: string, onNavigate: (view: WorkoutViewState, id?: string) => void }) {
  const { workouts } = useStore();
  const workout = workouts.find((w) => w.id === workoutId);

  // Unroll the workout into a flat sequence for the timeline based on setRepeats
  const sequence = useMemo(() => {
    if (!workout) return [];
    let seq: { seqId: string, exercise: typeof workout.exercises[0], setIndex: number, globalIndex: number }[] = [];
    let globalIndex = 0;
    for (let s = 1; s <= workout.setRepeats; s++) {
      workout.exercises.forEach((ex) => {
        seq.push({ seqId: `${s}-${ex.id}-${globalIndex}`, exercise: ex, setIndex: s, globalIndex });
        globalIndex++;
      });
    }
    return seq;
  }, [workout]);

  const [playerState, setPlayerState] = useState<PlayerState>("ACTIVE");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Time elapsed and stats
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [repsCompleted, setRepsCompleted] = useState(0);
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const repTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const activeItem = sequence[currentIndex];
  const maxReps = activeItem?.exercise.reps || 1;

  // Initialize rep state when active item changes
  useEffect(() => {
    if (!activeItem) return;
    setCurrentRep(1);
    if (activeItem.exercise.secondsPerRep) {
      setTimeLeft(activeItem.exercise.secondsPerRep);
    } else {
      setTimeLeft(null);
    }
  }, [currentIndex, activeItem]);

  // Global elapsed timer
  useEffect(() => {
    if (playerState === "ACTIVE") {
      globalTimerRef.current = setInterval(() => {
        setTotalSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    };
  }, [playerState]);

  // Rep Timer logic
  useEffect(() => {
    if (playerState === "ACTIVE" && timeLeft !== null && timeLeft > 0) {
      repTimerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (playerState === "ACTIVE" && timeLeft === 0) {
      // Time is up for this rep!
      handleRepComplete();
    }
    return () => {
      if (repTimerRef.current) clearTimeout(repTimerRef.current);
    };
  }, [playerState, timeLeft]);

  // Progress circular bar calculation
  const getProgressStroke = () => {
    if (!activeItem || !activeItem.exercise.secondsPerRep || timeLeft === null) return 0;
    const total = activeItem.exercise.secondsPerRep;
    const fraction = timeLeft / total;
    return fraction * 283; // 283 is circumference of r=45 (2 * PI * 45)
  };

  const handleRepComplete = () => {
    if (activeItem.exercise.type === 'exercise') {
      setRepsCompleted(prev => prev + 1);
    }

    if (currentRep < maxReps) {
      setCurrentRep(prev => prev + 1);
      if (activeItem.exercise.secondsPerRep) {
        setTimeLeft(activeItem.exercise.secondsPerRep);
      }
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setPlayerState("DONE");
      // Log to localStorage here
      const logKey = `lilac_workout_log`;
      const logs = JSON.parse(localStorage.getItem(logKey) || "[]");
      logs.push({
        workoutId: workout?.id,
        date: new Date().toISOString(),
        durationSeconds: totalSecondsElapsed,
        setsCompleted: activeItem.setIndex,
        totalReps: repsCompleted
      });
      localStorage.setItem(logKey, JSON.stringify(logs));
    }
  };

  const skipExercise = () => {
    if (activeItem.exercise.type === 'exercise') {
      // credit them the reps they hadn't done yet, just for ease? or zero?
      // let's just move on.
    }
    handleNextExercise();
  };

  const togglePause = () => {
    setPlayerState(prev => prev === "ACTIVE" ? "PAUSED" : "ACTIVE");
  };

  if (!workout) return null;

  if (playerState === "DONE") {
    return (
      <div className="fixed inset-0 z-50 bg-[#e8e4dc] flex flex-col items-center justify-center p-6 text-slate-800 animate-fade-in">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-white/60 p-8 rounded-[40px] shadow-xl backdrop-blur-md flex flex-col items-center text-center max-w-sm w-full border border-white/40"
        >
          <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mb-6 text-2xl">🌿</div>
          <h1 className="font-serif text-4xl mb-2 text-slate-800">Workout Complete</h1>
          <p className="text-slate-500 mb-8 font-medium">You did wonderful today.</p>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-white/50 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-3xl font-serif text-terra mb-1">{Math.round(totalSecondsElapsed / 60)}</span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Minutes</span>
            </div>
            <div className="bg-white/50 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-3xl font-serif text-terra mb-1">{repsCompleted}</span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Reps Done</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button onClick={() => onNavigate("LIBRARY")} className="w-full bg-terra text-white py-4 rounded-full font-medium shadow-md hover:bg-terra/90 transition-colors">
              Done
            </button>
            <button onClick={() => {
              setPlayerState("ACTIVE");
              setCurrentIndex(0);
              setTotalSecondsElapsed(0);
              setRepsCompleted(0);
            }} className="w-full bg-transparent text-slate-500 py-4 rounded-full font-medium hover:bg-white/50 transition-colors flex items-center justify-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Do it again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Calculate scrolling transform
  // The center of the screen is where the active item should be.
  // Each card is roughly 400px tall. We use flex and Framer Motion layoutId instead.

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-1000 ${
        activeItem?.exercise.type === 'break' ? 'bg-[#ebe5f0]' : 'bg-[#e8e4dc]'
      }`}
    >
      {/* Background breathing glow */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent opacity-30 pointer-events-none"
      />

      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#e8e4dc] to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-[80px] left-0 right-0 h-32 bg-gradient-to-t from-[#e8e4dc] to-transparent z-20 pointer-events-none" />

      {/* Main Timeline Scroller */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col items-center justify-center pb-24">
        
       <div className="w-full max-w-md px-6 relative flex flex-col items-center h-[120vh]">
         {/* We absolutely position the items centered around the middle of this tall container based on index difference */}
         
         <AnimatePresence>
         {sequence.map((item, index) => {
           const offset = index - currentIndex;
           if (Math.abs(offset) > 2) return null; // Only render nearby items to save DOM nodes

           const isActive = offset === 0;
           const isPast = offset < 0;

           let yPos = offset * 260; // Base spacing

           return (
             <motion.div
               key={item.seqId}
               initial={false}
               animate={{ 
                 y: yPos,
                 scale: isActive ? 1 : 0.85,
                 opacity: isActive ? (playerState === "PAUSED" ? 0.7 : 1) : 0.4,
                 filter: isPast ? 'grayscale(80%)' : 'grayscale(0%)',
                 zIndex: isActive ? 10 : 1
               }}
               transition={{ type: "spring", damping: 20, stiffness: 120 }}
               className="absolute top-1/2 left-6 right-6 -translate-y-1/2"
             >
               {item.exercise.type === 'exercise' ? (
                 <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 shadow-xl border border-white/50 flex flex-col items-center flex-1 h-[400px]">
                    
                    <div className="font-medium tracking-widest text-[#a69aa7] text-[10px] uppercase mb-4">
                      Set {item.setIndex} of {workout.setRepeats}
                    </div>

                    <div className="w-32 h-32 rounded-3xl bg-sand/50 overflow-hidden mb-6 flex items-center justify-center shadow-inner relative">
                      {item.exercise.imageUrl ? (
                        <img src={item.exercise.imageUrl} alt={item.exercise.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-16 h-16 text-terra/30" viewBox="0 0 100 100" fill="currentColor">
                          <path d="M50 20 A 10 10 0 0 1 50 40 A 10 10 0 0 1 50 20 Z M35 50 Q 50 40 65 50 Q 75 70 65 90 L 35 90 Q 25 70 35 50 Z" />
                        </svg>
                      )}
                      
                      {/* Rep Progress Indicator inside image overlay if no timer */}
                      {isActive && item.exercise.secondsPerRep === null && (
                         <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/10">
                           <motion.div 
                              className="h-full bg-terra"
                              initial={{ width: 0 }}
                              animate={{ width: `${(currentRep / maxReps) * 100}%` }}
                           />
                         </div>
                      )}
                    </div>

                    <h2 className="text-3xl font-serif text-slate-800 text-center mb-1 drop-shadow-sm">{item.exercise.name}</h2>
                    
                    <div className="text-sm font-medium text-slate-400 mb-6 font-mono">
                      Rep {currentRep} / {maxReps}
                    </div>

                    {item.exercise.secondsPerRep !== null ? (
                      <div className="relative w-32 h-32 shrink-0">
                         <svg className="w-full h-full transform -rotate-90">
                           <circle cx="64" cy="64" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-sand" />
                           <motion.circle 
                             cx="64" 
                             cy="64" 
                             r="45" 
                             fill="none" 
                             stroke="currentColor" 
                             strokeWidth="6" 
                             className="text-terra"
                             strokeDasharray="283"
                             animate={{ strokeDashoffset: isActive ? getProgressStroke() : 283 }}
                             transition={{ duration: 1, ease: "linear" }}
                             strokeLinecap="round"
                           />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                           <span className="text-4xl font-serif font-medium tracking-tighter mix-blend-multiply text-slate-800">
                              {timeLeft}
                           </span>
                         </div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleRepComplete}
                        className="mt-auto mb-4 w-full max-w-[200px] bg-terra/10 text-terra font-medium px-6 py-4 rounded-2xl flex items-center justify-between hover:bg-terra hover:text-white transition-all active:scale-95"
                      >
                        <span>Next Rep</span>
                        <SkipForward className="w-5 h-5" />
                      </button>
                    )}
                 </div>
               ) : (
                 <div className="bg-[#f0ecf6]/80 backdrop-blur-md rounded-[32px] p-8 shadow-xl border border-white/50 flex flex-col items-center justify-center flex-1 h-[400px]">
                    <h2 className="text-4xl font-serif text-[#7c6a96] mb-2 tracking-wide">Rest</h2>
                    <p className="text-sm font-medium text-[#a69aa7] mb-12">
                      Next: {sequence[index+1]?.exercise.name || 'Done'}
                    </p>

                    <div className="relative w-40 h-40 shrink-0">
                         <svg className="w-full h-full transform -rotate-90">
                           <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="4" className="text-[#e2dce8]" />
                           <motion.circle 
                             cx="80" 
                             cy="80" 
                             r="70" 
                             fill="none" 
                             stroke="currentColor" 
                             strokeWidth="4" 
                             className="text-[#9682b1]"
                             strokeDasharray="440"
                             animate={{ strokeDashoffset: isActive ? (timeLeft! / item.exercise.secondsPerRep!) * 440 : 440 }}
                             transition={{ duration: 1, ease: "linear" }}
                             strokeLinecap="round"
                           />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                           <span className="text-6xl font-serif text-[#695780]">
                              {timeLeft}
                           </span>
                         </div>
                      </div>

                      <button onClick={skipExercise} className="mt-12 text-[#9682b1] text-sm font-medium hover:text-[#5a4871] border border-[#9682b1]/30 rounded-full px-6 py-2">
                        Skip Rest
                      </button>
                 </div>
               )}
             </motion.div>
           );
         })}
         </AnimatePresence>

       </div>
      </div>

      {/* Fixed Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-xl border-t border-sand shadow-[0_-10px_20px_rgba(0,0,0,0.02)] flex items-center justify-between px-6 z-40 safe-area-bottom">
        <button onClick={() => {
            if(confirm("End this workout early? Your progress will be saved.")) {
              setPlayerState("DONE");
            }
          }} 
          className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <button 
          onClick={togglePause}
          className="w-16 h-16 rounded-full bg-terra text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all -translate-y-4 border-4 border-[#e8e4dc]"
        >
          {playerState === "ACTIVE" ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
        </button>

        <button onClick={skipExercise} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 text-slate-500 hover:text-slate-800 transition-colors">
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Progress Bar overlaying the top of the nav */}
        <div className="absolute top-[-2px] left-0 right-0 h-0.5 bg-sand">
          <motion.div 
            className="h-full bg-terra"
            animate={{ width: `${(currentIndex / sequence.length) * 100}%` }}
          />
        </div>
      </div>
      
    </motion.div>
  );
}
