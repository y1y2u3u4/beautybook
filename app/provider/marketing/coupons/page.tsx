'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Tag,
  TrendingUp
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: 'PUBLIC' | 'PRIVATE' | 'REFERRAL' | 'BIRTHDAY';
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxDiscount: number | null;
  minPurchase: number | null;
  startDate: string;
  endDate: string | null;
  active: boolean;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  applicableServices: string[];
  newCustomersOnly: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing/coupons');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const handleToggleActive = async (couponId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/marketing/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/marketing/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}% off`;
    }
    return `$${coupon.discountValue} off`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PUBLIC': return 'bg-green-100 text-green-700';
      case 'PRIVATE': return 'bg-purple-100 text-purple-700';
      case 'REFERRAL': return 'bg-blue-100 text-blue-700';
      case 'BIRTHDAY': return 'bg-pink-100 text-pink-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const activeCoupons = coupons.filter(c => c.active);
  const inactiveCoupons = coupons.filter(c => !c.active);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Discount Coupons</h1>
              <p className="text-neutral-600 mt-2">
                Create and manage discount codes for your customers
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Coupon
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Tag className="w-8 h-8 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {coupons.length}
            </div>
            <div className="text-sm text-neutral-600">Total Coupons</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {activeCoupons.length}
            </div>
            <div className="text-sm text-neutral-600">Active Coupons</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
            </div>
            <div className="text-sm text-neutral-600">Total Uses</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">—</div>
            <div className="text-sm text-neutral-600">Total Discount Given</div>
          </div>
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="card text-center py-12">
            <Tag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No Coupons Yet</h3>
            <p className="text-neutral-600 mb-6">
              Create your first coupon to attract and reward customers
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Your First Coupon
            </button>
          </div>
        ) : (
          <>
            {/* Active Coupons */}
            {activeCoupons.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  Active Coupons ({activeCoupons.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {activeCoupons.map((coupon) => (
                    <div key={coupon.id} className="card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-neutral-900">
                              {coupon.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(coupon.type)}`}>
                              {coupon.type}
                            </span>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-neutral-600 mb-3">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCoupon(coupon)}
                            className="p-2 hover:bg-neutral-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-neutral-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 hover:bg-neutral-100 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Coupon Code */}
                      <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-neutral-600 mb-1">Coupon Code</div>
                            <div className="text-xl font-mono font-bold text-primary-600">
                              {coupon.code}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-neutral-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Discount Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          {coupon.discountType === 'PERCENTAGE' ? (
                            <Percent className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-neutral-500" />
                          )}
                          <div>
                            <div className="text-xs text-neutral-600">Discount</div>
                            <div className="font-semibold text-neutral-900">
                              {formatDiscount(coupon)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-neutral-500" />
                          <div>
                            <div className="text-xs text-neutral-600">Used</div>
                            <div className="font-semibold text-neutral-900">
                              {coupon.usageCount}
                              {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Validity */}
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Valid: {new Date(coupon.startDate).toLocaleDateString()}
                          {coupon.endDate && ` - ${new Date(coupon.endDate).toLocaleDateString()}`}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.active)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Coupons */}
            {inactiveCoupons.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  Inactive Coupons ({inactiveCoupons.length})
                </h2>
                <div className="space-y-4">
                  {inactiveCoupons.map((coupon) => (
                    <div key={coupon.id} className="card opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-neutral-900">{coupon.name}</h3>
                          <p className="text-sm text-neutral-600">Code: {coupon.code}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-neutral-600">
                            {formatDiscount(coupon)}
                          </span>
                          <button
                            onClick={() => handleToggleActive(coupon.id, coupon.active)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-2 hover:bg-neutral-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Create Coupon</h2>
            <p className="text-neutral-600 mb-6">
              Coupon creation form will be implemented here
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
