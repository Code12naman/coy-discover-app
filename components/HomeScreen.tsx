import { Sparkles } from "lucide-react";

export function HomeScreen() {
  return (
    <section className="px-6 pt-10">
      <p className="font-display text-3xl tracking-tight">Home</p>
      <div className="mt-8 flex min-h-[58vh] flex-col items-center justify-center rounded-[28px] border border-border bg-surface px-8 text-center shadow-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Sparkles aria-hidden="true" size={24} strokeWidth={1.8} />
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">
          A little space to settle in.
        </p>
      </div>
    </section>
  );
}
