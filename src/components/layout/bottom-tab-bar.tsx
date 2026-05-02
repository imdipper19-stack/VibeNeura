'use client';

import { MessageSquare, CreditCard, Settings, Cpu } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { key: 'chat', icon: MessageSquare, labelRu: 'Чат', labelEn: 'Chat', path: '/chat' },
  { key: 'billing', icon: CreditCard, labelRu: 'Оплата', labelEn: 'Billing', path: '/billing' },
  { key: 'settings', icon: Settings, labelRu: 'Настройки', labelEn: 'Settings', path: '/settings' },
];

export function BottomTabBar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = params.locale as string;

  const currentTab = TABS.find(t => pathname.includes(t.path))?.key ?? 'chat';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0d1515]/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-stretch justify-around">
        {TABS.map(tab => {
          const active = currentTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(`/${locale}${tab.path}`)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors',
                active ? 'text-primary' : 'text-on-surface-variant/50 active:text-on-surface-variant',
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'drop-shadow-[0_0_6px_rgba(0,251,251,0.5)]')} />
              <span className="text-[10px] font-medium">{locale === 'ru' ? tab.labelRu : tab.labelEn}</span>
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
