"use client";

import { MapPin } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { PanInfo } from "framer-motion";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import type { PublicProfile, SwipeDirection } from "@/lib/types";

type ProfileCardProps = {
  profile: PublicProfile;
  onSwipe: (direction: SwipeDirection) => void;
  disabled: boolean;
};

export function ProfileCard({ profile, onSwipe, disabled }: ProfileCardProps) {
  const x = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const rotate = useTransform(
    x,
    [-220, 0, 220],
    reducedMotion ? [0, 0, 0] : [-16, 0, 16],
  );
  const likeOpacity = useTransform(x, [0, 70, 150], [0, 0.75, 1]);
  const passOpacity = useTransform(x, [-150, -70, 0], [1, 0.75, 0]);
  const exitTransition = reducedMotion
    ? { duration: 0.16 }
    : { type: "spring" as const, stiffness: 300, damping: 28 };
  const variants = {
    exit: (direction: SwipeDirection) => ({
      x: reducedMotion ? 0 : direction === "like" ? 560 : -560,
      opacity: 0,
      rotate: reducedMotion ? 0 : direction === "like" ? 18 : -18,
      transition: exitTransition,
    }),
  };

  function finishDrag(
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) {
    const projectedDistance = info.offset.x + info.velocity.x * 0.18;
    if (Math.abs(info.offset.x) > 105 || Math.abs(info.velocity.x) > 650) {
      onSwipe(projectedDistance >= 0 ? "like" : "pass");
    }
  }

  return (
    <motion.article
      drag={disabled ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.16}
      dragMomentum={false}
      onDragEnd={finishDrag}
      style={{ x, rotate, touchAction: "pan-y" }}
      variants={variants}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit="exit"
      transition={
        reducedMotion
          ? { duration: 0.16 }
          : { type: "spring", stiffness: 300, damping: 28 }
      }
      className={`absolute inset-0 overflow-hidden rounded-[28px] bg-surface-2 shadow-card ${
        disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
      aria-label={`${profile.name}, ${profile.age}`}
    >
      <ProfilePhoto
        src={profile.photo_url}
        alt={`${profile.name}, ${profile.age}`}
        sizes="(max-width: 430px) 100vw, 430px"
        className="object-cover"
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <motion.div
        aria-hidden="true"
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-6 top-8 -rotate-12 rounded-lg border-[3px] border-like px-3 py-1 text-xl font-bold tracking-[0.16em] text-like"
      >
        LIKE
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ opacity: passOpacity }}
        className="pointer-events-none absolute right-6 top-8 rotate-12 rounded-lg border-[3px] border-pass px-3 py-1 text-xl font-bold tracking-[0.16em] text-pass"
      >
        NOPE
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-20 text-white sm:px-6 sm:pb-6">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-[30px] leading-none tracking-tight sm:text-[32px]">
            {profile.name}
          </h2>
          <span className="text-lg font-light text-white/85">
            {profile.age}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
          <MapPin aria-hidden="true" size={15} strokeWidth={1.8} />
          {profile.city_or_college}
        </p>
        <p className="mt-2 line-clamp-2 max-w-[34ch] text-sm leading-5 text-white/95">
          {profile.bio}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Interests">
          {profile.interests.slice(0, 4).map((interest) => (
            <li
              key={interest}
              className="profile-interest rounded-full px-3 py-1 text-xs font-medium"
            >
              {interest}
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  );
}
