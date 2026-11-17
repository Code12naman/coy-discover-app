"use client";

import { Compass, House } from "lucide-react";

export type AppTab = "home" | "discover";

type BottomTabsProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
  const tabs: Array<{
    id: AppTab;
    label: string;
    Icon: typeof House;
  }> = [
    { id: "home", label: "Home", Icon: House },
    { id: "discover", label: "Discover", Icon: Compass },
  ];

  return (
    <nav
      aria-label="Main navigation"
      className="tabbar-surface fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] justify-around border-t border-border px-8 pb-[calc(10px+env(safe-area-inset-bottom))] pt-3"
    >
      {tabs.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(id)}
            className={`flex min-h-[48px] min-w-[92px] flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors ${
              active ? "text-primary" : "text-muted hover:text-text"
            }`}
          >
            <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
