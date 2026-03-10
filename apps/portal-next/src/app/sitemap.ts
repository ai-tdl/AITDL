// || ॐ श्री गणेशाय नमः ||
// Organization: AITDL · Creator: Jawahar R. Mallah
// Dynamic Sitemap Generator · Next.js 15

import { MetadataRoute } from 'next'

const BASE_URL = 'https://aitdl.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const segments = [
    '',
    '/retail',
    '/erp',
    '/education',
    '/teacher',
    '/student',
    '/home',
    '/partner',
    '/ngo',
    '/ecom',
    '/explore',
    '/contact',
    '/blog',
  ]

  const tools = [
    '/student/tools/ganitsutram',
    '/student/tools/autocorrect',
  ]

  const routes = [...segments, ...tools].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
