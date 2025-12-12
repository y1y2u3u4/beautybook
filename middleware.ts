import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 定义公开路由（不需要登录即可访问）
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/providers(.*)',
  '/api/providers(.*)',
  '/api/webhooks(.*)',
]);

// 定义需要保护的路由
const isProtectedRoute = createRouteMatcher([
  '/customer(.*)',
  '/provider(.*)',
  '/api/appointments',
  '/api/staff(.*)',
  '/api/analytics(.*)',
  '/api/portfolios(.*)',
  '/api/campaigns(.*)',
  '/api/inventory(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 如果是受保护的路由，要求登录
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
