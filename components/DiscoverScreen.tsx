import { Heart, SlidersHorizontal } from "lucide-react";

export function DiscoverScreen() {
  return (
    <section className="px-5 pb-6 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            coy
          </p>
          <h1 className="mt-1 font-display text-[32px] leading-tight tracking-tight">
            Discover
          </h1>
        </div>
        <button
          type="button"
          aria-label="Open matches"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text transition-transform active:scale-95"
        >
          <Heart aria-hidden="true" size={20} strokeWidth={1.8} />
        </button>
      </header>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted">A few new faces, picked for you.</p>
        <button
          type="button"
          aria-label="Discovery preferences"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted"
        >
          <SlidersHorizontal aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </div>
      <div className="mt-4 flex h-[min(58dvh,540px)] flex-col items-center justify-center rounded-[28px] border border-border bg-surface text-center shadow-card">
        <div className="h-56 w-40 animate-pulse rounded-3xl bg-surface-2" />
        <p className="mt-5 text-sm text-muted">
          Getting to know the neighborhood…
        </p>
      </div>
      <div className="mt-5 flex items-center justify-center gap-5">
        <div className="h-12 w-12 animate-pulse rounded-full bg-surface-2" />
        <div className="h-16 w-16 animate-pulse rounded-full bg-surface-2" />
      </div>
    </section>
  );
}
