import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/providers',
          '/book/',
        ],
        disallow: [
          '/provider/',
          '/customer/',
          '/api/',
          '/test-mode',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/providers',
          '/book/',
        ],
        disallow: [
          '/provider/',
          '/customer/',
          '/api/',
          '/test-mode',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
