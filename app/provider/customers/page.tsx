'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, DollarSign, Star, MessageSquare } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  totalSpent: number;
  lastVisit: string;
  averageRating: number;
  joinedDate: string;
}

export default function ProviderCustomers() {
  const { testUser, isTestMode, isLoading } = useTestUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && (!isTestMode || testUser?.role !== 'PROVIDER')) {
      router.push('/test-mode');
    }
  }, [isLoading, isTestMode, testUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!testUser || testUser.role !== 'PROVIDER') {
    return null;
  }

  const customers: Customer[] = [
    {
      id: '1',
      name: 'Jessica Smith',
      email: 'jessica.smith@example.com',
      phone: '(555) 123-4567',
      totalAppointments: 8,
      totalSpent: 1200,
      lastVisit: '2024-01-15',
      averageRating: 5.0,
      joinedDate: '2023-06-15',
    },
    {
      id: '2',
      name: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '(555) 234-5678',
      totalAppointments: 12,
      totalSpent: 2400,
      lastVisit: '2024-01-18',
      averageRating: 5.0,
      joinedDate: '2023-03-20',
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      phone: '(555) 345-6789',
      totalAppointments: 5,
      totalSpent: 750,
      lastVisit: '2024-01-10',
      averageRating: 4.5,
      joinedDate: '2023-09-08',
    },
    {
      id: '4',
      name: 'David Martinez',
      email: 'david.m@example.com',
      phone: '(555) 456-7890',
      totalAppointments: 15,
      totalSpent: 3000,
      lastVisit: '2024-01-20',
      averageRating: 5.0,
      joinedDate: '2023-01-10',
    },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Customer Management</h1>
              <p className="text-neutral-600 mt-1">View and manage your customer base</p>
            </div>
            <Link
              href="/provider/dashboard"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-neutral-900 mb-1">
              {customers.length}
            </div>
            <div className="text-sm text-neutral-600">Total Customers</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(0)}
            </div>
            <div className="text-sm text-neutral-600">Avg. Customer Value</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {(customers.reduce((sum, c) => sum + c.averageRating, 0) / customers.length).toFixed(1)}⭐
            </div>
            <div className="text-sm text-neutral-600">Avg. Rating</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Customers List */}
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Customer since {new Date(customer.joinedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-neutral-900">
                    {customer.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 bg-neutral-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Appointments</div>
                    <div className="font-semibold text-neutral-900">
                      {customer.totalAppointments}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Total Spent</div>
                    <div className="font-semibold text-green-600">
                      ${customer.totalSpent}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-xs text-neutral-600">Last Visit</div>
                    <div className="font-semibold text-neutral-900">
                      {new Date(customer.lastVisit).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  View History
                </button>
                <button className="flex-1 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Customer Management
              </div>
              <p className="text-yellow-800 text-sm">
                This is sample customer data. In production, you&apos;ll see real customer information, appointment history, and be able to send messages and manage relationships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
