import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Static routes
  const routes = [
    '',
    '/providers',
    '/register',
    '/test-mode',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Provider dashboard routes (lower priority, these are behind auth)
  const providerRoutes = [
    '/provider/dashboard',
    '/provider/appointments',
    '/provider/services',
    '/provider/customers',
    '/provider/staff',
    '/provider/analytics',
    '/provider/booking-qr',
    '/provider/marketing/coupons',
    '/provider/marketing/referrals',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Customer routes
  const customerRoutes = [
    '/customer/appointments',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // TODO: Add dynamic routes for providers and booking pages
  // This should fetch from database in production:
  // const providers = await prisma.providerProfile.findMany({
  //   where: { publicBookingEnabled: true, bookingSlug: { not: null } },
  //   select: { bookingSlug: true, updatedAt: true }
  // });
  // const providerBookingPages = providers.map(p => ({
  //   url: `${baseUrl}/book/${p.bookingSlug}`,
  //   lastModified: p.updatedAt,
  //   changeFrequency: 'daily' as const,
  //   priority: 0.9,
  // }));

  return [...routes, ...providerRoutes, ...customerRoutes];
}
