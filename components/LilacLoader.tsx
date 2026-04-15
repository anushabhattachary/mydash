"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LilacLoaderProps {
  show: boolean;
  message?: string;
}

/**
 * Full-screen loading overlay with a lilac flower rotating counterclockwise.
 * Used during operations that may stall (disconnecting Google, clearing data, etc.)
 */
export default function LilacLoader({ show, message = "Lilac is loading…" }: LilacLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-linen/90 backdrop-blur-md"
        >
          {/* Rotating Lilac Flower — counterclockwise */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="relative w-24 h-24 flex items-center justify-center"
          >
            {/* SVG Lilac Flower */}
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Petals — 6 petals arranged in a circle */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <ellipse
                  key={angle}
                  cx="60"
                  cy="60"
                  rx="14"
                  ry="30"
                  fill={i % 2 === 0 ? "#C8A2C8" : "#D8B4E2"}
                  opacity={0.85}
                  transform={`rotate(${angle} 60 60) translate(0 -22)`}
                />
              ))}
              {/* Center */}
              <circle cx="60" cy="60" r="10" fill="#E8D5F0" />
              <circle cx="60" cy="60" r="5" fill="#B088B4" />
            </svg>
          </motion.div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-serif text-slate-600 tracking-wide"
          >
            {message}
          </motion.p>

          {/* Subtle animated dots */}
          <div className="flex gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1.5 h-1.5 rounded-full bg-[#B088B4]"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
