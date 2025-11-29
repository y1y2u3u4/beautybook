'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Calendar, User, Menu } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  matchPaths?: string[];
}

const customerNavItems: NavItem[] = [
  { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home', matchPaths: ['/'] },
  { href: '/providers', icon: <Search className="w-5 h-5" />, label: 'Search', matchPaths: ['/providers'] },
  { href: '/customer/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Bookings', matchPaths: ['/customer'] },
  { href: '/customer/profile', icon: <User className="w-5 h-5" />, label: 'Profile', matchPaths: ['/customer/profile'] },
];

const providerNavItems: NavItem[] = [
  { href: '/provider/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard', matchPaths: ['/provider/dashboard'] },
  { href: '/provider/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Appointments', matchPaths: ['/provider/appointments'] },
  { href: '/provider/services', icon: <Menu className="w-5 h-5" />, label: 'Services', matchPaths: ['/provider/services'] },
  { href: '/provider/customers', icon: <User className="w-5 h-5" />, label: 'Customers', matchPaths: ['/provider/customers'] },
];

interface MobileBottomNavProps {
  userType?: 'customer' | 'provider';
}

export default function MobileBottomNav({ userType = 'customer' }: MobileBottomNavProps) {
  const pathname = usePathname();
  const navItems = userType === 'provider' ? providerNavItems : customerNavItems;

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path =>
        path === '/' ? pathname === '/' : pathname?.startsWith(path)
      );
    }
    return pathname === item.href;
  };

  // Don't show on certain pages
  const hiddenPaths = ['/providers/', '/book', '/checkout', '/guide'];
  if (hiddenPaths.some(path => pathname?.includes(path))) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-neutral-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                active
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <div className={`relative ${active ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                )}
              </div>
              <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
