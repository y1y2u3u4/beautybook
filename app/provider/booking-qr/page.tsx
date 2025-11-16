'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Settings,
  BarChart3,
  Users,
  ArrowLeft,
  Link2,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import QRCodeGenerator from '@/components/provider/QRCodeGenerator';
import BookingLinkCard from '@/components/provider/BookingLinkCard';

interface ProviderProfile {
  id: string;
  businessName: string;
  bookingSlug: string | null;
  qrCodeEnabled: boolean;
  publicBookingEnabled: boolean;
}

export default function BookingQRPage() {
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrCodeEnabled, setQrCodeEnabled] = useState(true);
  const [publicBookingEnabled, setPublicBookingEnabled] = useState(true);

  useEffect(() => {
    fetchProviderProfile();
  }, []);

  const fetchProviderProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch provider profile');
      }

      const data = await response.json();
      setProvider(data);
      setQrCodeEnabled(data.qrCodeEnabled ?? true);
      setPublicBookingEnabled(data.publicBookingEnabled ?? true);
    } catch (error) {
      console.error('Error fetching provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = async (newSlug: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/provider/booking-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingSlug: newSlug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update slug');
      }

      const data = await response.json();
      setProvider(data);
      alert('Booking slug updated successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update slug');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/provider/booking-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCodeEnabled,
          publicBookingEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setProvider(data);
      alert('Settings updated successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const bookingUrl = provider?.bookingSlug
    ? `${window.location.origin}/book/${provider.bookingSlug}`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Provider Profile Not Found</h2>
          <p className="text-neutral-600 mb-6">Please complete your provider profile first.</p>
          <Link href="/provider/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!provider.bookingSlug) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="card text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Set Up Your Booking Page</h2>
            <p className="text-neutral-600 mb-8">
              You need to create a custom URL for your booking page before you can generate a QR code.
            </p>
            <button
              onClick={() => handleSlugChange(provider.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'))}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Booking Page'}
            </button>
          </div>
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
          <h1 className="text-3xl font-bold text-neutral-900">Booking QR Code & Link</h1>
          <p className="text-neutral-600 mt-2">
            Share your booking page with customers using a QR code or direct link
          </p>
        </div>

        {/* Settings Card */}
        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Booking Settings</h3>
              <p className="text-sm text-neutral-600">Control your public booking availability</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {publicBookingEnabled ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-neutral-400" />
                  )}
                  <h4 className="font-semibold text-neutral-900">Public Booking</h4>
                </div>
                <p className="text-sm text-neutral-600 ml-8">
                  Allow customers to book appointments through your public booking page
                </p>
              </div>
              <button
                onClick={() => {
                  setPublicBookingEnabled(!publicBookingEnabled);
                  // Auto-save will happen when settings are updated
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  publicBookingEnabled ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    publicBookingEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <QrCode className={`w-5 h-5 ${qrCodeEnabled ? 'text-primary-600' : 'text-neutral-400'}`} />
                  <h4 className="font-semibold text-neutral-900">QR Code Access</h4>
                </div>
                <p className="text-sm text-neutral-600 ml-8">
                  Enable QR code for quick access to your booking page
                </p>
              </div>
              <button
                onClick={() => {
                  setQrCodeEnabled(!qrCodeEnabled);
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  qrCodeEnabled ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    qrCodeEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {(qrCodeEnabled !== provider.qrCodeEnabled || publicBookingEnabled !== provider.publicBookingEnabled) && (
              <button
                onClick={handleSettingsUpdate}
                disabled={saving}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        {publicBookingEnabled && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Link Card */}
            <BookingLinkCard
              url={bookingUrl}
              slug={provider.bookingSlug}
              onSlugChange={handleSlugChange}
            />

            {/* QR Code Generator */}
            {qrCodeEnabled && (
              <QRCodeGenerator
                url={bookingUrl}
                businessName={provider.businessName}
              />
            )}
          </div>
        )}

        {/* Stats Card (Future Enhancement) */}
        {publicBookingEnabled && (
          <div className="card mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Booking Statistics</h3>
                <p className="text-sm text-neutral-600">Track your booking page performance</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Link2 className="w-5 h-5 text-primary-600" />
                  <p className="text-sm text-neutral-600">Page Views</p>
                </div>
                <p className="text-3xl font-bold text-neutral-900">—</p>
                <p className="text-xs text-neutral-500 mt-1">Coming soon</p>
              </div>

              <div className="p-6 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-neutral-600">QR Scans</p>
                </div>
                <p className="text-3xl font-bold text-neutral-900">—</p>
                <p className="text-xs text-neutral-500 mt-1">Coming soon</p>
              </div>

              <div className="p-6 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <QrCode className="w-5 h-5 text-orange-600" />
                  <p className="text-sm text-neutral-600">Bookings Made</p>
                </div>
                <p className="text-3xl font-bold text-neutral-900">—</p>
                <p className="text-xs text-neutral-500 mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* Disabled State Message */}
        {!publicBookingEnabled && (
          <div className="card mt-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeOff className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Public Booking is Disabled</h3>
            <p className="text-neutral-600">
              Enable public booking in the settings above to share your booking page and QR code with customers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
