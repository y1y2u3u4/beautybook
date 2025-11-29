'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Search,
  Calendar,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Bell,
  Star,
  Users,
  BarChart3,
  Clock,
} from 'lucide-react';

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const customerMenuItems: MenuItem[] = [
  { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
  { href: '/providers', icon: <Search className="w-5 h-5" />, label: 'Find Providers' },
  { href: '/customer/appointments', icon: <Calendar className="w-5 h-5" />, label: 'My Appointments' },
  { href: '/customer/favorites', icon: <Star className="w-5 h-5" />, label: 'Favorites' },
  { href: '/customer/rewards', icon: <Sparkles className="w-5 h-5" />, label: 'Rewards', badge: 'NEW' },
];

const providerMenuItems: MenuItem[] = [
  { href: '/provider/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { href: '/provider/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Appointments' },
  { href: '/provider/services', icon: <Settings className="w-5 h-5" />, label: 'Services' },
  { href: '/provider/staff', icon: <Users className="w-5 h-5" />, label: 'Staff' },
  { href: '/provider/customers', icon: <User className="w-5 h-5" />, label: 'Customers' },
  { href: '/provider/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
  { href: '/provider/calendar-sync', icon: <Clock className="w-5 h-5" />, label: 'Calendar Sync' },
];

interface MobileMenuProps {
  userType?: 'customer' | 'provider';
  userName?: string;
  userAvatar?: string;
}

export default function MobileMenu({ userType = 'customer', userName, userAvatar }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = userType === 'provider' ? providerMenuItems : customerMenuItems;

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-neutral-100 rounded-xl transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-neutral-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[101] transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-neutral-900">BeautyBook</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-neutral-700" />
          </button>
        </div>

        {/* User Info */}
        {userName && (
          <div className="p-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{userName}</p>
                <p className="text-sm text-neutral-500 capitalize">{userType} Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 mx-2 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-primary-500' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span className={isActive ? 'font-semibold' : 'font-medium'}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer Links */}
        <div className="border-t border-neutral-100 p-2">
          <Link
            href="/guide"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-neutral-400" />
            <span className="font-medium">Help & Guide</span>
          </Link>
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-neutral-400" />
            <span className="font-medium">Notifications</span>
          </Link>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
