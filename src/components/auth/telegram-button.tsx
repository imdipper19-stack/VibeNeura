'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Send } from 'lucide-react';

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
  }
}

export function TelegramButton({ botUsername, label }: { botUsername?: string; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;

    window.onTelegramAuth = (user) => {
      const creds: Record<string, string> = { callbackUrl: '/ru/chat' };
      Object.entries(user).forEach(([k, v]) => {
        if (v !== undefined && v !== null) creds[k] = String(v);
      });
      signIn('telegram', creds);
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.onload = () => setLoaded(true);
    containerRef.current.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [botUsername]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="flex min-h-[46px] w-full justify-center">
        {!loaded && (
          <div className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#2AABEE]/90 px-4 py-3.5 text-sm font-semibold text-white">
            <Send className="h-4 w-4" />
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
