"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Mark app as ready after a brief load
    const readyTimer = setTimeout(() => setIsReady(true), 400);
    // Hide splash after animation completes
    const hideTimer = setTimeout(() => setShowSplash(false), 1800);
    
    return () => {
      clearTimeout(readyTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ backgroundColor: "#FAF7F2" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isReady ? 1 : 0, 
                scale: isReady ? 1 : 0.8 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <span className="text-7xl">🪻</span>
              <h1 className="text-5xl font-serif text-slate-800 tracking-wide">
                Lilac
              </h1>
              <p className="text-sm text-slate-400 font-medium tracking-wider uppercase">
                Your Daily Sanctuary
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
}
