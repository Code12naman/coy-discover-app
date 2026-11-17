"use client";

import { useState } from "react";
import { BottomTabs, type AppTab } from "@/components/BottomTabs";
import { DiscoverScreen } from "@/components/DiscoverScreen";
import { HomeScreen } from "@/components/HomeScreen";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>("discover");

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-bg">
      <main className="min-h-dvh pb-[calc(82px+env(safe-area-inset-bottom))]">
        {activeTab === "discover" ? <DiscoverScreen /> : <HomeScreen />}
      </main>
      <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
