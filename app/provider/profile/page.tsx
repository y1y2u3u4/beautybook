'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Building, MapPin, Clock, DollarSign, Languages, Award, Loader2, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';

const SPECIALTIES = [
  'Hair Styling', 'Hair Coloring', 'Haircuts', 'Makeup', 'Skincare', 'Facials',
  'Massage', 'Nail Art', 'Manicure', 'Pedicure', 'Waxing', 'Lash Extensions',
  'Brow Shaping', 'Microblading', 'Body Treatments', 'Bridal Services',
];

const LANGUAGES = [
  'English', 'Spanish', 'Chinese', 'Korean', 'Vietnamese', 'Tagalog', 'French', 'Japanese',
];

interface ProviderProfile {
  id: string;
  businessName: string;
  title: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  experience: number;
  specialties: string[];
  languages: string[];
  priceMin: number;
  priceMax: number;
  averageRating: number;
  reviewCount: number;
  verified: boolean;
  businessHours?: any;
}

export default function ProviderProfilePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    businessName: '',
    title: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    experience: 0,
    specialties: [] as string[],
    languages: [] as string[],
    priceMin: 0,
    priceMax: 0,
  });

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

      const response = await fetch('/api/provider/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfile(data.profile);
      setFormData({
        businessName: data.profile.businessName || '',
        title: data.profile.title || '',
        bio: data.profile.bio || '',
        phone: data.profile.phone || '',
        address: data.profile.address || '',
        city: data.profile.city || '',
        state: data.profile.state || '',
        zipCode: data.profile.zipCode || '',
        experience: data.profile.experience || 0,
        specialties: data.profile.specialties || [],
        languages: data.profile.languages || [],
        priceMin: data.profile.priceMin || 0,
        priceMax: data.profile.priceMax || 0,
      });
      setDataSource(data.source || 'unknown');
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' || name === 'priceMin' || name === 'priceMax'
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
            <Link href="/provider/dashboard" className="flex items-center gap-2 text-neutral-600 hover:text-primary-600">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SignedOut>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <User className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sign in required</h3>
            <p className="text-neutral-600 mb-6">Please sign in to manage your provider profile.</p>
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
            <h1 className="text-2xl font-bold text-neutral-900">Edit Profile</h1>
            <p className="text-neutral-600 mt-1">Update your business information</p>
          </div>

          {/* Demo Mode */}
          {dataSource === 'mock' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> Changes may not persist.
              </p>
            </div>
          )}

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Stats Bar */}
          {profile && (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600">{profile.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-neutral-600">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">{profile.reviewCount}</p>
                  <p className="text-sm text-neutral-600">Reviews</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary-600">
                    {profile.verified ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-neutral-600">Verified</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Business Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Location</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Expertise</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-32 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Specialties
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => handleSpecialtyToggle(specialty)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.specialties.includes(specialty)
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => handleLanguageToggle(language)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.languages.includes(language)
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">Pricing Range</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Minimum Price ($)
                  </label>
                  <input
                    type="number"
                    name="priceMin"
                    value={formData.priceMin}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Maximum Price ($)
                  </label>
                  <input
                    type="number"
                    name="priceMax"
                    value={formData.priceMax}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/provider/dashboard"
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
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
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
