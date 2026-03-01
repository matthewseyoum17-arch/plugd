"use client";

import { useState } from "react";

type TabsProps = {
  tabs: string[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
};

export function Tabs({ tabs, defaultTab, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]);

  return (
    <div>
      <div className="flex gap-2 border-b border-glass-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-3 text-sm font-button font-medium transition-colors relative ${
              active === tab
                ? "text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
            {active === tab && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-neon shadow-[0_0_8px_rgba(0,255,157,0.4)]" />
            )}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
