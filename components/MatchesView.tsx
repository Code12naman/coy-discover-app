"use client";

import Image from "next/image";
import { ArrowLeft, Heart, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { MatchesResponseSchema, type MatchedProfile } from "@/lib/types";

type MatchesViewProps = {
  onBack: () => void;
  onMatchesLoaded: (count: number) => void;
};

export function MatchesView({ onBack, onMatchesLoaded }: MatchesViewProps) {
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const response = await fetch("/api/matches", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load matches");
      const parsed = MatchesResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("Invalid matches response");
      setMatches(parsed.data.matches);
      onMatchesLoaded(parsed.data.matches.length);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [onMatchesLoaded]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadMatches();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadMatches]);

  return (
    <section className="px-5 pb-8 pt-7">
      <header className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Back to Discover"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text"
        >
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={1.8} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            coy
          </p>
          <h1 className="font-display text-[30px] leading-tight tracking-tight">
            Matches
          </h1>
        </div>
        {!loading && !error && (
          <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-medium text-muted">
            {matches.length}
          </span>
        )}
      </header>

      {loading ? (
        <div
          role="status"
          aria-label="Loading matches"
          className="mt-7 grid grid-cols-2 gap-3"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-[0.78] animate-pulse rounded-[22px] bg-surface-2"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-10 flex min-h-[45vh] flex-col items-center justify-center text-center">
          <p className="font-display text-2xl">Matches aren&apos;t loading</p>
          <p className="mt-2 text-sm text-muted">
            Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(false);
              void loadMatches();
            }}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-medium"
          >
            <RefreshCw aria-hidden="true" size={16} strokeWidth={1.8} />
            Try again
          </button>
        </div>
      ) : matches.length === 0 ? (
        <div className="mt-7 flex min-h-[55vh] flex-col items-center justify-center rounded-[28px] border border-border bg-surface px-8 text-center shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-primary">
            <Heart aria-hidden="true" size={23} strokeWidth={1.8} />
          </div>
          <h2 className="mt-5 font-display text-[26px] tracking-tight">
            No matches yet.
          </h2>
          <p className="mt-2 text-sm text-muted">Keep swiping.</p>
        </div>
      ) : (
        <ul className="mt-7 grid grid-cols-2 gap-3">
          {matches.map((profile) => (
            <li
              key={profile.id}
              className="relative aspect-[0.78] overflow-hidden rounded-[22px] bg-surface-2 shadow-card"
            >
              <Image
                src={profile.photo_url}
                alt={`${profile.name}, ${profile.age}`}
                fill
                sizes="(max-width: 430px) 50vw, 215px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <h2 className="font-display text-xl leading-tight">
                  {profile.name}, {profile.age}
                </h2>
                <p className="mt-1 line-clamp-1 text-xs text-white/85">
                  {profile.city_or_college}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
