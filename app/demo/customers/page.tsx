'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, ArrowLeft, Star, DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import { getAllCustomersWithStats, mockCustomerStats } from '@/lib/mock-data';

export default function CustomersDemo() {
  const [customers, setCustomers] = useState(getAllCustomersWithStats());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    segment: 'all',
    sortBy: 'recent',
  });

  const filteredCustomers = customers
    .filter((customer) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          customer.name.toLowerCase().includes(search) ||
          customer.email.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .filter((customer) => {
      if (filters.segment !== 'all') {
        return customer.segment === filters.segment;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'revenue':
          return b.totalSpent - a.totalSpent;
        case 'visits':
          return b.totalVisits - a.totalVisits;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Customer Management</h1>
                <p className="text-sm text-gray-600">View and manage your customer relationships</p>
              </div>
            </div>
            <button className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Customers"
            value={mockCustomerStats.totalCustomers}
            icon={<Calendar className="text-blue-600" size={20} />}
            trend="+12%"
            trendUp
            color="blue"
          />
          <StatCard
            title="VIP Customers"
            value={mockCustomerStats.vipCustomers}
            icon={<Star className="text-yellow-600" size={20} />}
            color="yellow"
          />
          <StatCard
            title="Total Revenue"
            value={`$${mockCustomerStats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="text-green-600" size={20} />}
            trend="+8%"
            trendUp
            color="green"
          />
          <StatCard
            title="Avg Customer Value"
            value={`$${mockCustomerStats.avgCustomerValue.toFixed(0)}`}
            icon={<TrendingUp className="text-purple-600" size={20} />}
            trend="+5%"
            trendUp
            color="purple"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.segment}
              onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Customers</option>
              <option value="VIP">VIP Customers</option>
              <option value="NEW">New Customers</option>
              <option value="AT_RISK">At Risk</option>
              <option value="CHURNED">Churned</option>
              <option value="REGULAR">Regular</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Most Recent</option>
              <option value="revenue">Highest Revenue</option>
              <option value="visits">Most Visits</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <button className="btn-secondary flex items-center gap-2">
              <Filter size={18} />
              More
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Segment</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">RFM</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Total Visits</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Total Spent</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Last Visit</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp, color = 'primary' }) {
  const colors = {
    primary: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend && (
          <span className={`text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function CustomerRow({ customer }) {
  const segmentBadges = {
    VIP: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    NEW: 'bg-green-100 text-green-800 border-green-300',
    AT_RISK: 'bg-orange-100 text-orange-800 border-orange-300',
    CHURNED: 'bg-red-100 text-red-800 border-red-300',
    REGULAR: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <img
            src={customer.imageUrl || '/default-avatar.png'}
            alt={customer.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900">{customer.name}</p>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${segmentBadges[customer.segment]}`}>
          {customer.segment}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex gap-1">
          <RFMBadge score={customer.rfm.recency} label="R" color="green" />
          <RFMBadge score={customer.rfm.frequency} label="F" color="blue" />
          <RFMBadge score={customer.rfm.monetary} label="M" color="orange" />
        </div>
      </td>
      <td className="py-4 px-6 font-semibold">{customer.totalVisits}</td>
      <td className="py-4 px-6 font-semibold text-green-600">${customer.totalSpent.toFixed(2)}</td>
      <td className="py-4 px-6 text-sm text-gray-600">
        {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
      </td>
      <td className="py-4 px-6">
        <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
          View Details →
        </button>
      </td>
    </tr>
  );
}

function RFMBadge({ score, label, color }) {
  const colors = {
    green: score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-green-400' : 'bg-gray-300',
    blue: score >= 4 ? 'bg-blue-500' : score >= 3 ? 'bg-blue-400' : 'bg-gray-300',
    orange: score >= 4 ? 'bg-orange-500' : score >= 3 ? 'bg-orange-400' : 'bg-gray-300',
  };

  return (
    <div
      className={`w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold ${colors[color]}`}
      title={`${label}: ${score}/5`}
    >
      {score}
    </div>
  );
}
