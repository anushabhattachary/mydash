"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Edit2, Plus, Droplet, Moon, Sun, Sparkles, X } from "lucide-react";
import { useUserProfile } from "@/lib/userProfile";

type PhaseName = "Menstrual" | "Follicular" | "Ovulation" | "Luteal";

interface CycleData {
  lastPeriodStart: string; // ISO string
  cycleLength: number;
  periodLength: number;
}

interface PhaseInfo {
  name: PhaseName;
  color: string;
  bgColor: string;
  energy: string;
  exercise: string;
  eat: string;
  mood: string;
  tip: string;
  icon: JSX.Element;
  habit: string;
  habitCategory: string;
  habitDuration: string;
}

export default function CycleTracker() {
  const [isClient, setIsClient] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [data, setData] = useState<CycleData | null>(null);
  
  const { profile, isLoaded } = useUserProfile();

  // Setup Form State
  const [formDate, setFormDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [formCycle, setFormCycle] = useState(28);
  const [formPeriod, setFormPeriod] = useState(5);

  useEffect(() => {
    setIsClient(true);
    if (!isLoaded || !profile) return;
    
    const stored = localStorage.getItem(`lilac_${profile.userId}_cycleData`);
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // Check old key
      const oldStored = localStorage.getItem("cycleData");
      if (oldStored) {
        setData(JSON.parse(oldStored));
        localStorage.setItem(`lilac_${profile.userId}_cycleData`, oldStored);
        localStorage.removeItem("cycleData");
      } else {
        setShowSetup(true);
      }
    }
  }, [isLoaded, profile?.userId]);

  const saveSetup = () => {
    if (!profile) return;
    const newData = {
      lastPeriodStart: new Date(formDate).toISOString(),
      cycleLength: formCycle,
      periodLength: formPeriod,
    };
    setData(newData);
    localStorage.setItem(`lilac_${profile.userId}_cycleData`, JSON.stringify(newData));
    setShowSetup(false);
  };

  const getCycleDay = () => {
    if (!data) return 1;
    const start = startOfDay(new Date(data.lastPeriodStart));
    const now = startOfDay(new Date());
    const diff = differenceInDays(now, start);
    // Modulo logic in case we surpass cycle length, treating it as cyclical
    return (diff % data.cycleLength) + 1;
  };

  const cycleDay = getCycleDay();

  const getPhase = (day: number): PhaseInfo => {
    if (!data) return phases.Menstrual;
    if (day <= data.periodLength) return phases.Menstrual;
    if (day <= 13) return phases.Follicular;
    if (day <= 16) return phases.Ovulation;
    return phases.Luteal;
  };

  const phases: Record<PhaseName, PhaseInfo> = {
    Menstrual: {
      name: "Menstrual",
      color: "text-rose-600", // Fallback text color as we use custom hex in tailwind
      bgColor: "bg-rose/20",
      energy: "Rest is productive. Your body is working hard.",
      exercise: "Gentle yoga, walking, stretching — avoid high intensity.",
      eat: "Iron-rich foods (lentils, spinach), warm soups, ginger tea.",
      mood: "Introspective, low energy is normal — journal, don't push.",
      tip: "This is your reset phase. Honor it.",
      icon: <Droplet className="w-5 h-5 text-rose-500" />,
      habit: "Gentle Yoga",
      habitCategory: "Wellness",
      habitDuration: "30 mins",
    },
    Follicular: {
      name: "Follicular",
      color: "text-orange-500",
      bgColor: "bg-peach/30",
      energy: "Rising energy — great time to start new projects.",
      exercise: "Cardio, strength training, try something new.",
      eat: "Fermented foods, leafy greens, seeds, lean proteins.",
      mood: "Creative, optimistic, social — schedule meetings.",
      tip: "Your brain is at peak sharpness. Use it.",
      icon: <Sun className="w-5 h-5 text-orange-400" />,
      habit: "Brainstorm Session",
      habitCategory: "Work",
      habitDuration: "45 mins",
    },
    Ovulation: {
      name: "Ovulation",
      color: "text-sage",
      bgColor: "bg-sage/20",
      energy: "Peak power — you're magnetic right now.",
      exercise: "HIIT, running, group classes, heavy lifting.",
      eat: "Antioxidant-rich foods, fiber, light and fresh meals.",
      mood: "Confident, communicative, high libido.",
      tip: "This is your superpower window.",
      icon: <Sparkles className="w-5 h-5 text-sage" />,
      habit: "High Intensity Workout",
      habitCategory: "Health",
      habitDuration: "45 mins",
    },
    Luteal: {
      name: "Luteal",
      color: "text-purple-500",
      bgColor: "bg-lavender/30",
      energy: "Winding down — structure and comfort are your friends.",
      exercise: "Pilates, yoga, swimming, moderate strength.",
      eat: "Magnesium, complex carbs, B6-rich foods, reduce caffeine.",
      mood: "Detail-oriented, introspective — set boundaries.",
      tip: "Cravings are signals. Nourish, don't restrict.",
      icon: <Moon className="w-5 h-5 text-purple-400" />,
      habit: "Evening Journaling",
      habitCategory: "Personal",
      habitDuration: "15 mins",
    },
  };

  const currentPhase = getPhase(cycleDay);

  const resetCycle = () => {
    if (!data || !profile) return;
    const newData = {
      ...data,
      lastPeriodStart: new Date().toISOString(),
    };
    setData(newData);
    localStorage.setItem(`lilac_${profile.userId}_cycleData`, JSON.stringify(newData));
  };

  const addHabitToTasks = (habit: string, category: string, duration: string) => {
    try {
      if (!profile) return;
      
      const storedTasksStr = localStorage.getItem(`lilac_${profile.userId}_tasksForToday`);
      const storedCategoriesStr = localStorage.getItem(`lilac_${profile.userId}_taskCategories`);
      
      const tasks = storedTasksStr ? JSON.parse(storedTasksStr) : [];
      const categories = storedCategoriesStr ? JSON.parse(storedCategoriesStr) : ["General", "Work", "Personal"];
      
      if (!categories.includes(category)) {
        categories.push(category);
      }

      const newTask = {
        id: crypto.randomUUID(),
        title: habit,
        description: `Suggested habit for ${currentPhase.name} phase`,
        duration: duration,
        category: category,
        completed: false,
      };

      localStorage.setItem(`lilac_${profile.userId}_tasksForToday`, JSON.stringify([...tasks, newTask]));
      localStorage.setItem(`lilac_${profile.userId}_taskCategories`, JSON.stringify(categories));
      
      // Notify TasksForToday
      window.dispatchEvent(new Event("tasks-updated"));
    } catch (e) {
      console.error("Could not add habit", e);
    }
  };

  if (!isClient) return null;

  // Squiggly line logic
  const svgWidth = 1000;
  const svgHeight = 120;
  // Let's create a pleasing sine wave path
  const wavePoints = [];
  const segments = 40;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * svgWidth;
    const y = svgHeight / 2 + Math.sin((i / segments) * Math.PI * 4) * 30; // 2 full sine waves
    if (i === 0) wavePoints.push(`M ${x} ${y}`);
    else {
      // rough bezier interpolation for smoothness
      wavePoints.push(`L ${x} ${y}`);
    }
  }
  const wavePathD = wavePoints.join(" ");

  // Progress percentage (0 to 1) representing how far along the cycle we are.
  const progressPercent = data ? (cycleDay - 1) / (data.cycleLength - 1) : 0;
  // Clamp progress to prevent overflow visually if setting is weird
  const safeProgress = Math.max(0, Math.min(1, progressPercent));
  
  // Estimate position on the path linearly for visual simplicity, since actual length-based getPointAtLength 
  // requires DOM element rendering first, which is tricky in React sometimes. Linear approx on X with Sin on Y works.
  const iconY = svgHeight / 2 + Math.sin(safeProgress * Math.PI * 4) * 30;

  return (
    <section className="w-full bg-white/40 backdrop-blur-md rounded-3xl border border-sand shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-6 md:px-8 border-b border-sand/50 bg-white/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPhase.bgColor}`}>
            {currentPhase.icon}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-serif text-slate-800">
              You&apos;re in your <span className="font-semibold">{currentPhase.name} Phase</span> ✦ Day {cycleDay}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSetup(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
            title="Edit settings"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button 
            onClick={resetCycle}
            className="flex items-center gap-2 px-4 py-2 bg-rose/10 hover:bg-rose/20 text-rose-600 border border-rose/30 rounded-xl font-medium text-sm transition-colors"
          >
            <Droplet className="w-4 h-4" />
            Log Period
          </button>
        </div>
      </div>

      {/* Timeline Wave */}
      <div className="px-6 md:px-8 py-8 relative w-full overflow-hidden">
        {/* Background phase gradients */}
        <div className="absolute inset-0 flex opacity-30 pointer-events-none" style={{ top: '20px', bottom: '20px' }}>
          <div style={{ width: `${(data?.periodLength || 5) / (data?.cycleLength || 28) * 100}%` }} className="bg-rose"></div>
          <div style={{ width: `${(13 - (data?.periodLength || 5)) / (data?.cycleLength || 28) * 100}%` }} className="bg-peach"></div>
          <div style={{ width: `${3 / (data?.cycleLength || 28) * 100}%` }} className="bg-sage"></div>
          <div style={{ flex: 1 }} className="bg-lavender"></div>
        </div>

        <div className="relative w-full overflow-x-auto custom-scrollbar pb-6 md:pb-0">
          <div className="min-w-[700px] w-full relative h-[140px]">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Soft underlying shadow wave */}
              <path 
                d={wavePathD} 
                className="stroke-sand fill-none" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Drawn squiggly path */}
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={wavePathD} 
                className="stroke-clay/40 fill-none" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
            
            {/* Animated Pin Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute pointer-events-none drop-shadow-md z-10"
              style={{
                left: `calc(${safeProgress * 100}% - 12px)`,
                top: `${iconY}px`,
                transform: 'translateY(-50%)',
              }}
            >
              <motion.div 
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-6 h-6 rounded-full bg-white border-2 border-clay shadow-sm flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-clay animate-pulse"></div>
              </motion.div>
            </motion.div>

            {/* Labels beneath the curve */}
            <div className="absolute top-[120px] inset-x-0 flex text-xs md:text-sm font-medium text-slate-400">
               <div style={{ width: `${(data?.periodLength || 5) / (data?.cycleLength || 28) * 100}%` }} className="text-center px-1">Menstrual</div>
               <div style={{ width: `${(13 - (data?.periodLength || 5)) / (data?.cycleLength || 28) * 100}%` }} className="text-center px-1">Follicular</div>
               <div style={{ width: `${3 / (data?.cycleLength || 28) * 100}%` }} className="text-center px-1">Ovulation</div>
               <div style={{ flex: 1 }} className="text-center px-1">Luteal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Panel */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-white/40 to-transparent">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-4">
             <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-white/60 shadow-sm border border-sand">✨</div>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">Energy & Mood</h4>
                 <p className="text-sm text-slate-600 mt-1">{currentPhase.energy}</p>
                 <p className="text-sm text-slate-600 mt-1">{currentPhase.mood}</p>
               </div>
             </div>
             <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-white/60 shadow-sm border border-sand">💡</div>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">Tip</h4>
                 <p className="text-sm italic text-slate-500 mt-1">{currentPhase.tip}</p>
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-white/60 shadow-sm border border-sand">🏃</div>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">Movement</h4>
                 <p className="text-sm text-slate-600 mt-1">{currentPhase.exercise}</p>
               </div>
             </div>
             <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-white/60 shadow-sm border border-sand">🥗</div>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">Nourish</h4>
                 <p className="text-sm text-slate-600 mt-1">{currentPhase.eat}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Habit prompt */}
        <div className="mt-8 pt-6 border-t border-sand flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 flex items-center gap-2">
            Want to add <strong>&quot;{currentPhase.habit}&quot;</strong> to your tasks? 🌿
          </p>
          <button 
             onClick={() => addHabitToTasks(currentPhase.habit, currentPhase.habitCategory, currentPhase.habitDuration)}
             className="flex items-center gap-2 px-5 py-2.5 bg-clay hover:bg-terra text-white rounded-xl shadow-sm text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add to today
          </button>
        </div>
      </div>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
               initial={{ y: 20, scale: 0.95 }}
               animate={{ y: 0, scale: 1 }}
               exit={{ y: 20, scale: 0.95 }}
               className="bg-[#F7F5F0] border border-sand shadow-xl rounded-3xl w-full max-w-md p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => data && setShowSetup(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-2"
              >
                {data && <X className="w-5 h-5" />}
              </button>
              
              <div className="flex flex-col items-center text-center mb-6 pt-2">
                <div className="w-12 h-12 rounded-full bg-rose/20 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-2xl font-serif text-slate-800">Cycle Setup</h3>
                <p className="text-slate-500 text-sm mt-2 font-medium">Customize your tracker to match your rhythm.</p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">When did your last period start?</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-white/60 border border-sand rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-clay/30 font-medium" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700">Average cycle length</label>
                    <span className="text-clay font-bold">{formCycle} days</span>
                  </div>
                  <input 
                    type="range" 
                    min="21" 
                    max="35" 
                    value={formCycle}
                    onChange={(e) => setFormCycle(parseInt(e.target.value))}
                    className="w-full accent-clay" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700">Average period length</label>
                    <span className="text-clay font-bold">{formPeriod} days</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="8" 
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(parseInt(e.target.value))}
                    className="w-full accent-clay" 
                  />
                </div>

                <button 
                  onClick={saveSetup}
                  className="w-full py-3.5 bg-clay hover:bg-terra text-white rounded-xl shadow-sm font-semibold text-base transition-colors mt-2"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
