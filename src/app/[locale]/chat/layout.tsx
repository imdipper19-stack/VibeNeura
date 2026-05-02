'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { BottomTabBar } from '@/components/layout/bottom-tab-bar';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <MobileNav />
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((v) => !v)} />
      <main className="relative flex flex-1 flex-col overflow-hidden pb-14 md:pb-0">{children}</main>
      <BottomTabBar />
    </div>
  );
}
