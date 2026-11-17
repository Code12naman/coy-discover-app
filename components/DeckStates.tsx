import { AlertCircle, Heart, RefreshCw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function DeckSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profiles"
      className="mt-5 h-[min(56dvh,520px)] animate-pulse rounded-[28px] border border-border bg-surface-2 shadow-card"
    />
  );
}

type DeckMessageProps = {
  title: string;
  detail: string;
  icon: ReactNode;
  action?: ReactNode;
};

function DeckMessage({ title, detail, icon, action }: DeckMessageProps) {
  return (
    <div className="mt-5 flex min-h-[min(56dvh,520px)] flex-col items-center justify-center rounded-[28px] border border-border bg-surface px-8 text-center shadow-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
        {icon}
      </div>
      <h2 className="mt-5 font-display text-[28px] leading-tight tracking-tight">
        {title}
      </h2>
      <p className="mt-2 max-w-[25ch] text-sm leading-6 text-muted">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

type EmptyDeckProps = {
  onViewMatches: () => void;
};

export function EmptyDeck({ onViewMatches }: EmptyDeckProps) {
  return (
    <DeckMessage
      title="You're all caught up"
      detail="Take a breath. There will be new faces soon."
      icon={<Sparkles aria-hidden="true" size={24} strokeWidth={1.8} />}
      action={
        <button
          type="button"
          onClick={onViewMatches}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-match-bg transition-transform active:scale-[0.98]"
        >
          <Heart aria-hidden="true" size={16} strokeWidth={1.8} />
          View matches
        </button>
      }
    />
  );
}

type DeckErrorProps = {
  onRetry: () => void;
};

export function DeckError({ onRetry }: DeckErrorProps) {
  return (
    <DeckMessage
      title="We couldn't load profiles"
      detail="Check your connection and give it another try."
      icon={<AlertCircle aria-hidden="true" size={24} strokeWidth={1.8} />}
      action={
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-medium text-text transition-transform active:scale-[0.98]"
        >
          <RefreshCw aria-hidden="true" size={16} strokeWidth={1.8} />
          Try again
        </button>
      }
    />
  );
}
