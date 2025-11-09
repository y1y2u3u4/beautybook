'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Bell,
  MessageSquare,
  Clock,
  Settings,
  BarChart3,
  Star,
  Home,
} from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Home className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BeautyBook Demo
                </h1>
                <p className="text-sm text-gray-600">Interactive Feature Demonstration</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold">Glamour Beauty Studio</p>
                <p className="text-xs text-gray-600">Provider Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-2">Welcome to BeautyBook! 🎉</h2>
          <p className="text-purple-100 mb-4">
            Explore all the features with pre-loaded test data. Click on any card below to see the feature in action.
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>4 Test Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>8 Appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>4 Staff Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>7 Services</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 7: Appointment Management */}
          <Link href="/demo/appointments">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Appointment Management</h3>
                  <p className="text-xs text-gray-600">Feature 7</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Day/week/month calendar views with appointment operations
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-semibold">View Demo →</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  8 Appointments
                </span>
              </div>
            </div>
          </Link>

          {/* Feature 8: Customer Management (CRM) */}
          <Link href="/demo/customers">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Customer Management</h3>
                  <p className="text-xs text-gray-600">Feature 8</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                CRM with RFM analysis and customer segmentation
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-600 font-semibold">View Demo →</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  4 Customers
                </span>
              </div>
            </div>
          </Link>

          {/* Feature 9: Business Hours & Scheduling */}
          <Link href="/demo/scheduling">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Hours & Scheduling</h3>
                  <p className="text-xs text-gray-600">Feature 9</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Business hours configuration and staff scheduling
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-semibold">View Demo →</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  23 Schedules
                </span>
              </div>
            </div>
          </Link>

          {/* Feature 10: Notifications */}
          <Link href="/demo/notifications">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Notifications Center</h3>
                  <p className="text-xs text-gray-600">Feature 10</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Real-time notifications with filtering and management
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 font-semibold">View Demo →</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  3 Unread
                </span>
              </div>
            </div>
          </Link>

          {/* Message Templates */}
          <Link href="/demo/message-templates">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Message Templates</h3>
                  <p className="text-xs text-gray-600">Feature 10</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Customizable email/SMS templates with variables
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-pink-600 font-semibold">View Demo →</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  5 Templates
                </span>
              </div>
            </div>
          </Link>

          {/* Reviews Management */}
          <Link href="/demo/reviews">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Reviews Management</h3>
                  <p className="text-xs text-gray-600">Feature 4</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Customer reviews with multi-dimensional ratings
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-600 font-semibold">View Demo →</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  4.8
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">$560</div>
            <div className="text-xs text-gray-500 mt-1">From 8 appointments</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-1">VIP Customers</div>
            <div className="text-2xl font-bold text-purple-600">1</div>
            <div className="text-xs text-gray-500 mt-1">Out of 4 customers</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-1">Avg. Rating</div>
            <div className="text-2xl font-bold text-yellow-600">4.8</div>
            <div className="text-xs text-gray-500 mt-1">From 4 reviews</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 mb-1">Active Staff</div>
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-xs text-gray-500 mt-1">All certified</div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">ℹ️</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">About This Demo</h4>
              <p className="text-blue-800 text-sm mb-3">
                This demo uses pre-loaded mock data stored in <code className="bg-blue-100 px-1 rounded">lib/mock-data.ts</code>.
                All interactions are simulated and changes are stored in browser memory only.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div>✓ Interactive appointment calendar</div>
                <div>✓ Customer RFM analysis</div>
                <div>✓ Staff scheduling grid</div>
                <div>✓ Real-time notifications</div>
                <div>✓ Message template editor</div>
                <div>✓ Review management</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Settings size={20} />
            Technical Implementation
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-purple-600">Frontend</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Next.js 14 App Router</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• React Hooks</li>
                <li>• date-fns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Data</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Mock data in memory</li>
                <li>• 4 test customers</li>
                <li>• 8 appointments</li>
                <li>• 4 staff members</li>
                <li>• 7 services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Features</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Calendar views (day/week/month)</li>
                <li>• RFM customer segmentation</li>
                <li>• Staff scheduling</li>
                <li>• Notification center</li>
                <li>• Template management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
