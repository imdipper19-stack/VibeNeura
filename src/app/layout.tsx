import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'vibeneura — Premium AI aggregator',
  description: 'Access GPT, Claude, Llama and more without a VPN. All top AI models in one place.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://vibeneura.online'),
  openGraph: {
    title: 'vibeneura — Premium AI aggregator',
    description: 'Access GPT, Claude, Llama and more without a VPN.',
    url: 'https://vibeneura.online',
    siteName: 'vibeneura',
    type: 'website',
    locale: 'ru_RU',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vibeneura — все топовые ИИ в одном окне',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'vibeneura — Premium AI aggregator',
    description: 'Access GPT, Claude, Llama and more without a VPN.',
  },
  appleWebApp: {
    capable: true,
    title: 'vibeneura',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0E16',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`dark ${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else if (theme === 'system') {
                    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.remove('dark', 'light');
                    document.documentElement.classList.add(isDark ? 'dark' : 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108993121','ym');
              ym(108993121,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
            `,
          }}
        />
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/108993121" style={{position:'absolute',left:'-9999px'}} alt="" /></div>
        </noscript>
      </head>
      <body className="min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Vibeneura',
                  legalName: 'ОсОО «Глобал Бридж»',
                  url: 'https://vibeneura.online',
                  logo: 'https://vibeneura.online/favicon.svg',
                  email: 'vibeneura@internet.ru',
                  foundingDate: '2025',
                },
                {
                  '@type': 'WebApplication',
                  name: 'Vibeneura',
                  url: 'https://vibeneura.online',
                  applicationCategory: 'UtilitiesApplication',
                  operatingSystem: 'Any',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'RUB',
                  },
                  description: 'Premium AI aggregator: GPT, Claude and more without a VPN.',
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'Нужен ли VPN для доступа к Vibeneura?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Нет. Все запросы проксируются через наш сервер. Vibeneura работает из любой точки мира без VPN.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Какие ИИ-модели доступны?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Бесплатно: Claude Haiku 4.5. Premium: Claude Opus 4.7, Claude Sonnet 4.6, GPT 5.5.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Как устроена оплата?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Два варианта: пакеты токенов (от 99 ₽, не сгорают) или PRO Pass (безлимит на 7/14/30 дней).',
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
