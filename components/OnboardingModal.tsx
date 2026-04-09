"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProfile } from "@/lib/userProfile";
import { Check } from "lucide-react";

const ICON_CATEGORIES = [
  { name: "Nature & Plants", icons: ["🌿", "🌸", "🌺", "🌻", "🍃", "🌾", "🌵", "🌷", "🍀"] },
  { name: "Animals & Creatures", icons: ["🦋", "🐝", "🦩", "🐚", "🦔", "🐈", "🦜", "🐠"] },
  { name: "Celestial & Mystical", icons: ["🌙", "✨", "🌟", "☀️", "🪐", "🔮", "🌈", "⚡", "💫"] },
  { name: "Food & Cozy", icons: ["☕", "🍵", "🫧", "🍋", "🧁", "🫶", "📚", "🎨", "🎵", "🕯️"] },
  { name: "Wellness & Movement", icons: ["🧘", "💪", "🏃", "🌊", "💤", "🏔️"] },
];

export default function OnboardingModal() {
  const { profile, isLoaded, updateProfile, isEditingProfile, setIsEditingProfile } = useUserProfile();

  const isInitialOnboarding = isLoaded && !profile && !isEditingProfile;
  const isEditing = isEditingProfile;

  const showModal = isInitialOnboarding || isEditing;

  // Internal state for the flow
  // Steps: 0: Welcome, 1: Name, 2: Icon, 3: Preview
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [customEmoji, setCustomEmoji] = useState("");
  
  // Confetti/petals overlay
  const [showPetals, setShowPetals] = useState(false);

  useEffect(() => {
    if (isEditing && profile) {
      setName(profile.name);
      setIcon(profile.icon);
      setStep(1);
    }
  }, [isEditing, profile]);

  if (!isLoaded) return null; // wait until checked

  const nextStep = () => {
    if (step === 1 && !name.trim()) return;
    setStep(s => s + 1);
  };

  const handleConfirm = () => {
    updateProfile(name.trim(), customEmoji || icon);
    setShowPetals(true);
    setTimeout(() => {
      setShowPetals(false);
      if (isEditing) {
        setIsEditingProfile(false);
      }
    }, 2000);
  };

  if (!showModal && !showPetals) return null;

  return (
    <>
      <AnimatePresence>
        {showModal && !showPetals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F7F5F0] border border-sand shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden relative flex flex-col h-full max-h-[85vh] md:h-auto md:max-h-[80vh]"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar relative p-8">
                <AnimatePresence mode="wait">
                  
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center h-full min-h-[300px]"
                    >
                      <motion.h1 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        className="text-6xl font-serif text-slate-800 mb-4"
                      >
                        🪻 Lilac
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl font-serif text-slate-600 mb-6"
                      >
                        Your personal daily sanctuary
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8"
                      >
                        Track your days, honor your cycles, tend to your goals. 
                        Built for you — and only you.
                      </motion.p>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        onClick={nextStep}
                        className="bg-terra hover:bg-orange-700 text-white px-8 py-3.5 rounded-full font-medium transition-colors shadow-sm"
                      >
                        Get started →
                      </motion.button>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      className="flex flex-col h-full"
                    >
                      {isEditing && (
                        <button 
                          onClick={() => setIsEditingProfile(false)}
                          className="absolute text-slate-400 hover:text-slate-600 top-4 right-4"
                        >
                          Cancel
                        </button>
                      )}
                      <h2 className="text-3xl font-serif text-slate-800 mt-4 mb-2">Welcome to Lilac 🪻</h2>
                      <p className="text-slate-500 mb-10">Let&apos;s make this space yours. What should I call you?</p>
                      
                      <div className="flex flex-col gap-2 relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') nextStep();
                          }}
                          placeholder="Your name..."
                          className="w-full bg-transparent border-b-2 border-sand focus:border-terra text-3xl font-serif text-slate-800 py-3 outline-none transition-colors placeholder:text-slate-300"
                          autoFocus
                        />
                      </div>
                      
                      <div className="mt-12 flex justify-end">
                        <button
                          onClick={nextStep}
                          disabled={!name.trim()}
                          className="bg-clay hover:bg-terra disabled:bg-sand disabled:text-slate-400 text-white px-8 py-3 rounded-full font-medium transition-colors"
                        >
                          Next →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -50, opacity: 0 }}
                      className="flex flex-col h-full"
                    >
                      <div className="mb-6">
                        <h2 className="text-2xl font-serif text-slate-800">Pick an icon that feels like you</h2>
                        <p className="text-slate-500 text-sm mt-1">It&apos;ll live next to your name every day.</p>
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-6">
                        {ICON_CATEGORIES.map((cat, i) => (
                          <div key={cat.name} className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{cat.name}</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                              {cat.icons.map((emoji, j) => {
                                const isSelected = (customEmoji || icon) === emoji;
                                return (
                                  <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 + j * 0.03 }}
                                    key={emoji}
                                    onClick={() => {
                                      setIcon(emoji);
                                      setCustomEmoji("");
                                    }}
                                    className={`w-full aspect-square text-3xl flex items-center justify-center rounded-2xl transition-all ${
                                      isSelected 
                                        ? "bg-white border-2 border-terra shadow-sm shadow-terra/10" 
                                        : "bg-white/50 border border-sand hover:scale-105 hover:shadow-sm"
                                    } relative`}
                                  >
                                    {emoji}
                                    {isSelected && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-terra rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-6 border-t border-sand/50">
                        <p className="text-sm font-medium text-slate-500 mb-3">Or type any emoji you love 💛</p>
                        <div className="flex items-center gap-4">
                           <input
                             type="text"
                             maxLength={2}
                             value={customEmoji}
                             onChange={(e) => setCustomEmoji(e.target.value)}
                             placeholder="✨"
                             className="w-16 h-16 text-3xl text-center bg-white border-2 border-sand focus:border-terra rounded-2xl outline-none transition-colors"
                           />
                           <button
                             onClick={nextStep}
                             className="flex-1 bg-clay hover:bg-terra text-white px-8 py-4 rounded-full font-medium transition-colors h-16"
                           >
                             Preview →
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="flex flex-col h-full justify-center min-h-[300px]"
                    >
                      <h2 className="text-2xl font-serif text-slate-800 text-center mb-2">Preview & Confirm</h2>
                      <p className="text-slate-500 text-sm text-center mb-10">This is how Lilac will greet you every day.</p>
                      
                      {/* Fake header preview */}
                      <div className="bg-white/60 p-6 rounded-2xl border border-sand shadow-sm mb-12">
                        <div className="flex flex-col gap-2">
                           <h1 className="text-2xl font-serif text-slate-800 flex items-center gap-2">
                             Good morning, {name} {(customEmoji || icon)}
                           </h1>
                           <p className="text-sm text-slate-500">Welcome to Lilac 🪻 — your sanctuary for today.</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full">
                        <button
                          onClick={handleConfirm}
                          className="w-full bg-terra hover:bg-orange-700 text-white px-8 py-4 rounded-full font-medium transition-colors shadow-md"
                        >
                          This is me ✓
                        </button>
                        <button
                          onClick={() => setStep(1)}
                          className="w-full bg-transparent hover:bg-sand/30 text-slate-500 px-8 py-3 rounded-full font-medium transition-colors"
                        >
                          ← Change it
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Progress Dots */}
              {step > 0 && (
                <div className="p-6 pt-0 flex justify-center gap-2">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        step === i ? "w-6 bg-terra" : "w-2 bg-sand hover:bg-clay/40 cursor-pointer"
                      }`}
                      onClick={() => {
                         if (i < step || name.trim()) setStep(i);
                      }}
                    />
                  ))}
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Falling Petals Animation (rendered on top of layout) */}
      <AnimatePresence>
        {showPetals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          >
            {/* Generate some falling petals */}
            {Array.from({ length: 30 }).map((_, i) => {
              const startX = Math.random() * 100;
              const delay = Math.random() * 0.5;
              const duration = 1.5 + Math.random();
              const size = 10 + Math.random() * 15;
              const rotate = Math.random() * 360;
              
              return (
                <motion.div
                  key={i}
                  initial={{ top: "-10%", left: `${startX}%`, rotate: 0, opacity: 0 }}
                  animate={{ 
                    top: "110%", 
                    rotate: rotate,
                    opacity: [0, 1, 1, 0],
                    x: Math.sin(i) * 50
                  }}
                  transition={{ duration, delay, ease: "linear" }}
                  className="absolute"
                  style={{
                     width: size,
                     height: size * 1.2,
                     backgroundColor: i % 3 === 0 ? '#d8b4e2' : '#e0c3e8', // Lilac colors
                     borderRadius: "50% 0 50% 50%",
                     boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
