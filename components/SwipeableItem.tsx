"use client";

import { useRef, useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Trash2 } from "lucide-react";

interface SwipeableItemProps {
  children: ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  rightLabel?: string;
  leftLabel?: string;
  disabled?: boolean;
}

export default function SwipeableItem({
  children,
  onSwipeRight,
  onSwipeLeft,
  rightLabel = "Done",
  leftLabel = "Delete",
  disabled = false,
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background opacity based on drag distance
  const rightBgOpacity = useTransform(x, [0, 80], [0, 1]);
  const leftBgOpacity = useTransform(x, [-80, 0], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const threshold = 80;

    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      if (showDeleteConfirm) {
        onSwipeLeft();
        setShowDeleteConfirm(false);
      } else {
        setShowDeleteConfirm(true);
        setTimeout(() => setShowDeleteConfirm(false), 3000);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl touch-pan-y">
      {/* Right swipe background (complete) */}
      {onSwipeRight && (
        <motion.div
          style={{ opacity: rightBgOpacity }}
          className="absolute inset-0 bg-sage/80 flex items-center pl-6 rounded-2xl"
        >
          <Check className="w-6 h-6 text-white" />
          <span className="ml-2 text-white font-medium text-sm">{rightLabel}</span>
        </motion.div>
      )}

      {/* Left swipe background (delete) */}
      {onSwipeLeft && (
        <motion.div
          style={{ opacity: leftBgOpacity }}
          className="absolute inset-0 bg-red-400/80 flex items-center justify-end pr-6 rounded-2xl"
        >
          <span className="mr-2 text-white font-medium text-sm">
            {showDeleteConfirm ? "Confirm?" : leftLabel}
          </span>
          <Trash2 className="w-5 h-5 text-white" />
        </motion.div>
      )}

      {/* Draggable content */}
      <motion.div
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 bg-white cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
}
