import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Block the Overpass proxy from being crawled -- machine-readable data, not user content
      disallow: ['/api/'],
    },
    // TODO Phase 6 DNS cutover: change to https://offyego.ie/sitemap.xml
    sitemap: 'https://offyego.vercel.app/sitemap.xml',
  };
}
