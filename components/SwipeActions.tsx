"use client";

import { Heart, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { SwipeDirection } from "@/lib/types";

type SwipeActionsProps = {
  disabled: boolean;
  onSwipe: (direction: SwipeDirection) => void;
};

export function SwipeActions({ disabled, onSwipe }: SwipeActionsProps) {
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, stiffness: 300, damping: 28 };

  return (
    <div className="mt-4 flex min-h-[68px] items-center justify-center gap-6">
      <motion.button
        type="button"
        aria-label="Pass on profile"
        disabled={disabled}
        whileTap={{ scale: 0.94 }}
        transition={transition}
        onClick={() => onSwipe("pass")}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border bg-surface text-pass shadow-card disabled:opacity-50"
      >
        <X aria-hidden="true" size={24} strokeWidth={1.9} />
      </motion.button>
      <motion.button
        type="button"
        aria-label="Like profile"
        disabled={disabled}
        whileTap={{ scale: 0.94 }}
        transition={transition}
        onClick={() => onSwipe("like")}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-contrast shadow-card disabled:opacity-50"
      >
        <Heart aria-hidden="true" size={26} strokeWidth={1.9} />
      </motion.button>
    </div>
  );
}
