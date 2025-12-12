'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, DollarSign, Star, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

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
  imageUrl?: string | null;
}

interface Stats {
  totalCustomers: number;
  totalRevenue: number;
  averageCustomerValue: number;
  averageRating: number;
}

export default function ProviderCustomers() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/provider/customers');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load customers');
        }

        setCustomers(data.customers || []);
        setStats(data.stats || null);
        setDataSource(data.source || '');
      } catch (err: any) {
        console.error('Failed to fetch customers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchCustomers();
    }
  }, [isSignedIn]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

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
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="text-3xl font-bold text-neutral-900 mb-1">
                {stats.totalCustomers}
              </div>
              <div className="text-sm text-neutral-600">Total Customers</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="text-3xl font-bold text-green-600 mb-1">
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-neutral-600">Total Revenue</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ${stats.averageCustomerValue}
              </div>
              <div className="text-sm text-neutral-600">Avg. Customer Value</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {stats.averageRating > 0 ? `${stats.averageRating}` : 'N/A'}
                {stats.averageRating > 0 && <Star className="w-6 h-6 inline ml-1 text-yellow-500 fill-yellow-500" />}
              </div>
              <div className="text-sm text-neutral-600">Avg. Rating</div>
            </div>
          </div>
        )}

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
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="text-neutral-400 mb-4">
              <Mail className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {searchQuery ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-neutral-600">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Your customers will appear here after they book appointments'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {customer.imageUrl ? (
                      <img
                        src={customer.imageUrl}
                        alt={customer.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {customer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Customer since {new Date(customer.joinedDate).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  {customer.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-neutral-900">
                        {customer.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
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
                        ${customer.totalSpent.toLocaleString()}
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
        )}

        {/* Data Source Notice */}
        {dataSource === 'mock' && (
          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">Demo</div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Demo Mode - Customer Management
                </div>
                <p className="text-yellow-800 text-sm">
                  This is sample customer data. Connect to the database to see real customer information, appointment history, and manage relationships.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
