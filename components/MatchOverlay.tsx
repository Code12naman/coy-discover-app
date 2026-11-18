"use client";

import { Heart, UserRound } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { PublicProfile } from "@/lib/types";
import { ProfilePhoto } from "@/components/ProfilePhoto";

type MatchOverlayProps = {
  profile: PublicProfile;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
};

const hearts = [
  { left: "18%", top: "26%", delay: 0 },
  { left: "76%", top: "23%", delay: 0.12 },
  { left: "24%", top: "48%", delay: 0.2 },
  { left: "80%", top: "46%", delay: 0.08 },
  { left: "50%", top: "20%", delay: 0.26 },
];

export function MatchOverlay({
  profile,
  onKeepSwiping,
  onViewMatches,
}: MatchOverlayProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.22 }}
      className="match-surface fixed inset-0 z-50 flex min-h-dvh items-center justify-center px-6 py-10"
    >
      <div className="relative flex w-full max-w-[390px] flex-col items-center text-center">
        <div className="pointer-events-none absolute inset-x-0 top-[-88px] h-[230px]">
          {hearts.map(({ left, top, delay }) => (
            <motion.div
              key={`${left}-${top}`}
              initial={{ opacity: 0, y: 14, scale: 0.7 }}
              animate={
                reducedMotion
                  ? { opacity: [0, 0.8, 0.45], y: 0, scale: 1 }
                  : { opacity: [0, 0.9, 0], y: -38, scale: [0.7, 1, 0.85] }
              }
              transition={{
                duration: reducedMotion ? 0.45 : 1.35,
                delay,
                ease: "easeOut",
              }}
              style={{ left, top }}
              className="absolute text-primary"
            >
              <Heart
                aria-hidden="true"
                size={18}
                fill="currentColor"
                strokeWidth={1.5}
              />
            </motion.div>
          ))}
        </div>

        <p className="text-match-text/65 text-xs font-semibold uppercase tracking-[0.2em]">
          coy
        </p>
        <h1
          id="match-title"
          className="mt-4 font-display text-[38px] leading-tight tracking-tight"
        >
          It&apos;s a match!
        </h1>
        <p className="text-match-text/75 mt-2 text-sm">
          You and {profile.name} liked each other.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <motion.div
            initial={{ x: reducedMotion ? 0 : -44, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={
              reducedMotion
                ? { duration: 0.16 }
                : { type: "spring", stiffness: 280, damping: 24, delay: 0.08 }
            }
            className="relative z-10 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-match-bg bg-primary text-primary-contrast shadow-card"
          >
            <UserRound aria-hidden="true" size={40} strokeWidth={1.5} />
            <span className="sr-only">Your profile photo placeholder</span>
          </motion.div>
          <motion.div
            initial={{ x: reducedMotion ? 0 : 44, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={
              reducedMotion
                ? { duration: 0.16 }
                : { type: "spring", stiffness: 280, damping: 24, delay: 0.08 }
            }
            className="relative -ml-5 h-28 w-28 overflow-hidden rounded-full border-[3px] border-match-bg bg-surface-2"
          >
            <ProfilePhoto
              src={profile.photo_url}
              alt={`${profile.name}'s profile photo`}
              sizes="112px"
              className="object-cover"
            />
          </motion.div>
        </div>

        <p className="mt-5 font-display text-2xl">{profile.name}</p>
        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={onKeepSwiping}
            className="min-h-12 rounded-full bg-primary px-6 text-sm font-semibold text-match-bg transition-transform active:scale-[0.98]"
          >
            Keep swiping
          </button>
          <button
            type="button"
            onClick={onViewMatches}
            className="border-match-text/30 hover:bg-match-text/10 min-h-12 rounded-full border bg-transparent px-6 text-sm font-medium text-match-text transition-colors"
          >
            View matches
          </button>
        </div>
      </div>
    </motion.div>
  );
}
