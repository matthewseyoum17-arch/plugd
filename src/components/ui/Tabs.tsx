'use client'

import { useState } from 'react'

type TabsProps = {
  tabs: string[]
  defaultTab?: string
  children: (activeTab: string) => React.ReactNode
}

export function Tabs({ tabs, defaultTab, children }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0])

  return (
    <div>
      <div className="flex gap-1 border-b border-[#222] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              active === tab
                ? 'text-[#00FF94]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
            {active === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00FF94]" />
            )}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  )
}
