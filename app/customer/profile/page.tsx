'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, Settings, Shield, Bell, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  role?: string;
  isProvider?: boolean;
  providerProfile?: {
    id: string;
    businessName: string;
  };
  createdAt?: string;
}

export default function CustomerProfilePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfile(data.user);
      setFirstName(data.user.firstName || '');
      setLastName(data.user.lastName || '');
      setDataSource(data.source || 'unknown');
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(profile?.firstName || '');
    setLastName(profile?.lastName || '');
    setIsEditing(false);
    setError(null);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/providers" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Find Providers
              </Link>
              <Link href="/customer/appointments" className="text-neutral-600 hover:text-primary-600 transition-colors">
                My Appointments
              </Link>
              <Link href="/customer/profile" className="text-primary-600 font-medium">
                Profile
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="btn-primary px-6 py-2">
                  Sign In
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <User className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sign in to view your profile</h3>
            <p className="text-neutral-600 mb-6">Please sign in to access your profile settings.</p>
            <Link
              href="/sign-in"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
            <p className="text-neutral-600 mt-1">Manage your account settings and preferences</p>
          </div>

          {/* Demo Mode */}
          {dataSource === 'mock' || dataSource === 'clerk' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Profile changes may not persist.
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Personal Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {profile?.imageUrl || clerkUser?.imageUrl ? (
                    <img
                      src={profile?.imageUrl || clerkUser?.imageUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      ) : (
                        <p className="text-neutral-900">{profile?.firstName || 'Not set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      ) : (
                        <p className="text-neutral-900">{profile?.lastName || 'Not set'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      <p className="text-neutral-900">{profile?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || 'Not set'}</p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Email is managed through your sign-in provider
                    </p>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-neutral-100 text-neutral-700 px-6 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Account Information</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900">Account Type</p>
                      <p className="text-sm text-neutral-600">
                        {profile?.isProvider ? 'Provider Account' : 'Customer Account'}
                      </p>
                    </div>
                  </div>
                  {!profile?.isProvider && (
                    <Link
                      href="/register"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Become a Provider
                    </Link>
                  )}
                </div>

                {profile?.createdAt && (
                  <div className="flex items-center gap-3 py-3 border-b border-neutral-100">
                    <Calendar className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900">Member Since</p>
                      <p className="text-sm text-neutral-600">
                        {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {profile?.isProvider && profile.providerProfile && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-900">Provider Dashboard</p>
                        <p className="text-sm text-neutral-600">{profile.providerProfile.businessName}</p>
                      </div>
                    </div>
                    <Link
                      href="/provider/dashboard"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Links</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/customer/appointments"
                  className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">My Appointments</p>
                    <p className="text-sm text-neutral-600">View and manage bookings</p>
                  </div>
                </Link>

                <Link
                  href="/providers"
                  className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <User className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-neutral-900">Find Providers</p>
                    <p className="text-sm text-neutral-600">Browse beauty professionals</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
