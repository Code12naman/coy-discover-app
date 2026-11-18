"use client";

import { AnimatePresence } from "framer-motion";
import { Heart, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DeckError, DeckSkeleton, EmptyDeck } from "@/components/DeckStates";
import { MatchOverlay } from "@/components/MatchOverlay";
import { MatchesView } from "@/components/MatchesView";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { SwipeActions } from "@/components/SwipeActions";
import { Toast } from "@/components/Toast";
import { getApiErrorMessage, getClientErrorMessage } from "@/lib/client-errors";
import {
  FeedResponseSchema,
  SwipeResponseSchema,
  type PublicProfile,
  type SwipeDirection,
} from "@/lib/types";

type DiscoverView = "deck" | "matches";

export function DiscoverScreen() {
  const [view, setView] = useState<DiscoverView>("deck");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [decidedIds, setDecidedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [prefetchError, setPrefetchError] = useState<string | null>(null);
  const [swipePending, setSwipePending] = useState(false);
  const [lastDirection, setLastDirection] = useState<SwipeDirection>("like");
  const [matchedProfile, setMatchedProfile] = useState<PublicProfile | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const seenIds = useRef(new Set<string>());
  const initialFetchStarted = useRef(false);
  const moreBusy = useRef(false);
  const swipeBusy = useRef(false);

  const loadInitialFeed = useCallback(async () => {
    setLoading(true);
    setFeedError(null);
    setPrefetchError(null);
    try {
      const response = await fetch("/api/feed", { cache: "no-store" });
      if (!response.ok)
        throw new Error(
          await getApiErrorMessage(
            response,
            "Unable to load profiles right now. Please try again.",
          ),
        );
      const parsed = FeedResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        throw new Error("The profile feed returned an unexpected response.");
      }
      const nextProfiles = parsed.data.profiles;
      seenIds.current = new Set(nextProfiles.map(({ id }) => id));
      setProfiles(nextProfiles);
      setDecidedIds(new Set());
      setHasMore(nextProfiles.length === 10);
    } catch (error) {
      setFeedError(
        getClientErrorMessage(
          error,
          "Unable to connect. Please check your connection and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFetchStarted.current) return;
    initialFetchStarted.current = true;
    void loadInitialFeed();
  }, [loadInitialFeed]);

  const loadMoreProfiles = useCallback(async () => {
    if (moreBusy.current || !hasMore) return;
    moreBusy.current = true;
    setMoreLoading(true);
    setPrefetchError(null);
    try {
      const response = await fetch("/api/feed", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            "Unable to load more profiles. Please try again.",
          ),
        );
      }
      const parsed = FeedResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error("Invalid feed response");
      const batch = parsed.data.profiles;
      const newProfiles = batch.filter(({ id }) => !seenIds.current.has(id));
      for (const profile of batch) seenIds.current.add(profile.id);
      setProfiles((current) => [...current, ...newProfiles]);
      setHasMore(batch.length === 10);
    } catch (error) {
      setPrefetchError(
        getClientErrorMessage(
          error,
          "Unable to load additional profiles. Please try again.",
        ),
      );
    } finally {
      moreBusy.current = false;
      setMoreLoading(false);
    }
  }, [hasMore]);

  const availableProfiles = profiles.filter(
    (profile) => !decidedIds.has(profile.id),
  );
  const currentProfile = availableProfiles[0];
  const nextProfile = availableProfiles[1];

  useEffect(() => {
    if (!loading && !feedError && hasMore && availableProfiles.length <= 3) {
      void loadMoreProfiles();
    }
  }, [availableProfiles.length, feedError, hasMore, loadMoreProfiles, loading]);

  const handleSwipe = useCallback(
    async (direction: SwipeDirection) => {
      if (!currentProfile || swipeBusy.current || matchedProfile) return;
      const profile = currentProfile;
      swipeBusy.current = true;
      setSwipePending(true);
      setLastDirection(direction);
      setDecidedIds((current) => new Set(current).add(profile.id));

      try {
        const response = await fetch("/api/swipe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ targetId: profile.id, direction }),
        });
        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response,
              "Unable to save your choice. Please try again.",
            ),
          );
        }
        const parsed = SwipeResponseSchema.safeParse(await response.json());
        if (!parsed.success) throw new Error("Invalid swipe response");
        if (parsed.data.matched) {
          setMatchedProfile(parsed.data.profile);
          setMatchCount((count) => (count === null ? null : count + 1));
        }
      } catch (error) {
        setDecidedIds((current) => {
          const restored = new Set(current);
          restored.delete(profile.id);
          return restored;
        });
        setToastMessage(
          getClientErrorMessage(
            error,
            "That choice didn't save. Please check your connection and try again.",
          ),
        );
      } finally {
        swipeBusy.current = false;
        setSwipePending(false);
      }
    },
    [currentProfile, matchedProfile],
  );

  useEffect(() => {
    if (view !== "deck" || matchedProfile) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        void handleSwipe(event.key === "ArrowRight" ? "like" : "pass");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSwipe, matchedProfile, view]);

  const dismissToast = useCallback(() => setToastMessage(null), []);
  const handleMatchesLoaded = useCallback(
    (count: number) => setMatchCount(count),
    [],
  );

  async function resetDemo() {
    if (resetting) return;
    setResetting(true);
    try {
      const response = await fetch("/api/reset", { method: "POST" });
      if (!response.ok) throw new Error("Unable to reset demo");
      setMatchedProfile(null);
      setMatchCount(0);
      await loadInitialFeed();
      setToastMessage("Demo reset.");
    } catch {
      setToastMessage("The demo couldn't be reset. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  function showMatches() {
    setMatchedProfile(null);
    setView("matches");
  }

  return (
    <>
      {view === "matches" ? (
        <MatchesView
          onBack={() => setView("deck")}
          onMatchesLoaded={handleMatchesLoaded}
        />
      ) : (
        <section className="px-4 pb-5 pt-6 sm:px-5 sm:pt-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                coy
              </p>
              <h1 className="mt-1 font-display text-[32px] leading-tight tracking-tight">
                Discover
              </h1>
            </div>
            <button
              type="button"
              onClick={showMatches}
              aria-label={
                matchCount === null
                  ? "Open matches"
                  : `Open ${matchCount} matches`
              }
              className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-text transition-transform active:scale-[0.98]"
            >
              <Heart
                aria-hidden="true"
                size={18}
                strokeWidth={1.8}
                className="text-primary"
              />
              <span>Matches</span>
              {matchCount !== null && matchCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-2 px-1 text-[11px] text-muted">
                  {matchCount}
                </span>
              )}
            </button>
          </header>

          <div className="mt-3 flex min-h-8 items-center justify-between">
            <p className="text-sm text-muted">
              Meet someone beyond the small talk.
            </p>
            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                disabled={resetting}
                onClick={() => void resetDemo()}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-muted underline-offset-4 hover:text-text hover:underline disabled:opacity-50"
              >
                <RotateCcw aria-hidden="true" size={13} strokeWidth={1.8} />
                Reset demo
              </button>
            )}
          </div>

          {loading ? (
            <DeckSkeleton />
          ) : feedError ? (
            <DeckError
              detail={feedError}
              onRetry={() => void loadInitialFeed()}
            />
          ) : currentProfile ? (
            <>
              <div className="relative mt-4 h-[min(56dvh,520px)] w-full">
                {nextProfile && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-2 top-3 h-full origin-top scale-[0.96] overflow-hidden rounded-[26px] bg-surface-2 opacity-70"
                  >
                    <ProfilePhoto
                      src={nextProfile.photo_url}
                      alt=""
                      sizes="(max-width: 430px) 90vw, 390px"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                <AnimatePresence initial={false} custom={lastDirection}>
                  <ProfileCard
                    key={currentProfile.id}
                    profile={currentProfile}
                    onSwipe={(direction) => void handleSwipe(direction)}
                    disabled={swipePending}
                  />
                </AnimatePresence>
              </div>
              <SwipeActions
                disabled={swipePending}
                onSwipe={(direction) => void handleSwipe(direction)}
              />
              {prefetchError && (
                <button
                  type="button"
                  onClick={() => void loadMoreProfiles()}
                  className="mx-auto mt-1 block min-h-10 px-3 text-center text-xs text-muted underline underline-offset-4"
                >
                  Couldn&apos;t load more profiles: {prefetchError} Try again
                </button>
              )}
            </>
          ) : moreLoading ? (
            <DeckSkeleton />
          ) : (
            <EmptyDeck onViewMatches={showMatches} />
          )}
        </section>
      )}

      <AnimatePresence>
        {matchedProfile && (
          <MatchOverlay
            key={matchedProfile.id}
            profile={matchedProfile}
            onKeepSwiping={() => setMatchedProfile(null)}
            onViewMatches={showMatches}
          />
        )}
      </AnimatePresence>
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={dismissToast} />
      )}
    </>
  );
}
