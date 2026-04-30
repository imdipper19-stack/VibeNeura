import type { MetadataRoute } from 'next';

const BASE = 'https://vibeneura.online';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ru', 'en'];
  const routes = ['', '/login', '/billing', '/privacy', '/terms'];

  return locales.flatMap(locale =>
    routes.map(route => ({
      url: `${BASE}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
      priority: route === '' ? 1.0 : 0.5,
    }))
  );
}
