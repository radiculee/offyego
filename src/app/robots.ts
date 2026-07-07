import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Block the Overpass proxy from being crawled -- machine-readable data, not user content
      disallow: ['/api/'],
    },
    sitemap: 'https://offyego.ie/sitemap.xml',
  };
}
