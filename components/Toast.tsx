"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3600);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] left-1/2 z-40 flex w-[min(calc(100%-32px),398px)] -translate-x-1/2 items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text shadow-card"
    >
      <AlertCircle
        aria-hidden="true"
        size={17}
        className="shrink-0 text-primary"
      />
      <span>{message}</span>
    </div>
  );
}
