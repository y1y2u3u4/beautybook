'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs';

const SPECIALTIES = [
  'Hair Styling',
  'Hair Coloring',
  'Haircuts',
  'Makeup',
  'Skincare',
  'Facials',
  'Massage',
  'Nail Art',
  'Manicure',
  'Pedicure',
  'Waxing',
  'Lash Extensions',
  'Brow Shaping',
  'Microblading',
  'Body Treatments',
  'Bridal Services',
];

const LANGUAGES = [
  'English',
  'Spanish',
  'Chinese',
  'Korean',
  'Vietnamese',
  'Tagalog',
  'French',
  'Japanese',
];

interface FormData {
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
}

export default function RegisterPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [hasProviderProfile, setHasProviderProfile] = useState(false);
  const [dataSource, setDataSource] = useState<'database' | 'mock' | null>(null);

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    title: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    experience: 0,
    specialties: [],
    languages: ['English'],
    priceMin: 50,
    priceMax: 200,
  });

  // Check if user already has provider profile
  useEffect(() => {
    const checkStatus = async () => {
      if (!isSignedIn) {
        setCheckingStatus(false);
        return;
      }

      try {
        const response = await fetch('/api/providers/register');
        const data = await response.json();

        setDataSource(data.source || 'unknown');

        if (data.hasProviderProfile) {
          setHasProviderProfile(true);
        }
      } catch (err) {
        console.error('Failed to check registration status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isSignedIn]);

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

  const validateStep = (currentStep: number): boolean => {
    setError('');

    switch (currentStep) {
      case 1:
        if (!formData.businessName.trim()) {
          setError('Business name is required');
          return false;
        }
        if (!formData.title.trim()) {
          setError('Professional title is required');
          return false;
        }
        if (!formData.bio.trim() || formData.bio.length < 50) {
          setError('Bio must be at least 50 characters');
          return false;
        }
        if (!formData.phone.trim()) {
          setError('Phone number is required');
          return false;
        }
        return true;

      case 2:
        if (!formData.address.trim()) {
          setError('Address is required');
          return false;
        }
        if (!formData.city.trim()) {
          setError('City is required');
          return false;
        }
        if (!formData.state.trim()) {
          setError('State is required');
          return false;
        }
        if (!formData.zipCode.trim()) {
          setError('ZIP code is required');
          return false;
        }
        return true;

      case 3:
        if (formData.specialties.length === 0) {
          setError('Please select at least one specialty');
          return false;
        }
        if (formData.languages.length === 0) {
          setError('Please select at least one language');
          return false;
        }
        return true;

      case 4:
        if (formData.priceMin <= 0) {
          setError('Minimum price must be greater than 0');
          return false;
        }
        if (formData.priceMax <= formData.priceMin) {
          setError('Maximum price must be greater than minimum price');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success - redirect to provider dashboard
      router.push(data.redirectUrl || '/provider/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  // Already has provider profile
  if (hasProviderProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Already Registered</h2>
          <p className="text-neutral-600 mb-6">
            You already have a provider profile. Visit your dashboard to manage your business.
          </p>
          <Link
            href="/provider/dashboard"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              BeautyBook
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900">Provider Registration</h2>
          <p className="text-neutral-600 mt-2">
            Join our platform and grow your beauty business
          </p>

          {/* Data source indicator */}
          {dataSource === 'mock' && (
            <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
              Demo Mode - Database Unavailable
            </div>
          )}
        </div>

        <SignedOut>
          {/* Not signed in - show sign up prompt */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Create an Account First</h3>
              <p className="text-neutral-600 mb-6">
                You need to sign up or sign in before registering as a provider.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-block bg-neutral-100 text-neutral-700 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          {checkingStatus ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600">Checking registration status...</p>
            </div>
          ) : (
            <>
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          s <= step
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        {s < step ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          s
                        )}
                      </div>
                      {s < 4 && (
                        <div
                          className={`w-full h-1 mx-2 ${
                            s < step ? 'bg-primary-600' : 'bg-neutral-200'
                          }`}
                          style={{ width: '60px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-neutral-600">
                  <span>Business Info</span>
                  <span>Location</span>
                  <span>Expertise</span>
                  <span>Pricing</span>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {/* Step 1: Business Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-4">Business Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g., Radiant Beauty Studio"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Professional Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Licensed Esthetician, Master Stylist"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Bio * <span className="text-neutral-400">(min 50 characters)</span>
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell clients about yourself, your experience, and what makes your services special..."
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-sm text-neutral-500 mt-1">
                        {formData.bio.length}/50 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-4">Business Location</h3>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Main Street, Suite 100"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Los Angeles"
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          State *
                        </label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Select State</option>
                          <option value="CA">California</option>
                          <option value="NY">New York</option>
                          <option value="TX">Texas</option>
                          <option value="FL">Florida</option>
                          <option value="IL">Illinois</option>
                          <option value="PA">Pennsylvania</option>
                          <option value="OH">Ohio</option>
                          <option value="GA">Georgia</option>
                          <option value="NC">North Carolina</option>
                          <option value="MI">Michigan</option>
                          <option value="NJ">New Jersey</option>
                          <option value="VA">Virginia</option>
                          <option value="WA">Washington</option>
                          <option value="AZ">Arizona</option>
                          <option value="MA">Massachusetts</option>
                          <option value="TN">Tennessee</option>
                          <option value="IN">Indiana</option>
                          <option value="MO">Missouri</option>
                          <option value="MD">Maryland</option>
                          <option value="WI">Wisconsin</option>
                          <option value="CO">Colorado</option>
                          <option value="MN">Minnesota</option>
                          <option value="SC">South Carolina</option>
                          <option value="AL">Alabama</option>
                          <option value="LA">Louisiana</option>
                          <option value="KY">Kentucky</option>
                          <option value="OR">Oregon</option>
                          <option value="OK">Oklahoma</option>
                          <option value="CT">Connecticut</option>
                          <option value="UT">Utah</option>
                          <option value="NV">Nevada</option>
                          <option value="AR">Arkansas</option>
                          <option value="IA">Iowa</option>
                          <option value="MS">Mississippi</option>
                          <option value="KS">Kansas</option>
                          <option value="NM">New Mexico</option>
                          <option value="NE">Nebraska</option>
                          <option value="WV">West Virginia</option>
                          <option value="ID">Idaho</option>
                          <option value="HI">Hawaii</option>
                          <option value="NH">New Hampshire</option>
                          <option value="ME">Maine</option>
                          <option value="RI">Rhode Island</option>
                          <option value="MT">Montana</option>
                          <option value="DE">Delaware</option>
                          <option value="SD">South Dakota</option>
                          <option value="ND">North Dakota</option>
                          <option value="AK">Alaska</option>
                          <option value="VT">Vermont</option>
                          <option value="WY">Wyoming</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="90001"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Expertise */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-4">Professional Expertise</h3>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        max="50"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Specialties * <span className="text-neutral-400">(select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALTIES.map((specialty) => (
                          <button
                            key={specialty}
                            type="button"
                            onClick={() => handleSpecialtyToggle(specialty)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
                        Languages Spoken * <span className="text-neutral-400">(select all that apply)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map((language) => (
                          <button
                            key={language}
                            type="button"
                            onClick={() => handleLanguageToggle(language)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
                )}

                {/* Step 4: Pricing */}
                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-4">Pricing Range</h3>

                    <p className="text-neutral-600 mb-4">
                      Set your general price range. You can add specific prices for individual services later.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Minimum Price ($) *
                        </label>
                        <input
                          type="number"
                          name="priceMin"
                          value={formData.priceMin}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Maximum Price ($) *
                        </label>
                        <input
                          type="number"
                          name="priceMax"
                          value={formData.priceMax}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-neutral-50 rounded-lg p-6 mt-6">
                      <h4 className="font-semibold text-neutral-900 mb-4">Registration Summary</h4>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-neutral-600">Business Name:</dt>
                          <dd className="font-medium text-neutral-900">{formData.businessName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-neutral-600">Title:</dt>
                          <dd className="font-medium text-neutral-900">{formData.title}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-neutral-600">Location:</dt>
                          <dd className="font-medium text-neutral-900">{formData.city}, {formData.state}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-neutral-600">Experience:</dt>
                          <dd className="font-medium text-neutral-900">{formData.experience} years</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-neutral-600">Specialties:</dt>
                          <dd className="font-medium text-neutral-900">{formData.specialties.length} selected</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-neutral-600">Price Range:</dt>
                          <dd className="font-medium text-neutral-900">${formData.priceMin} - ${formData.priceMax}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </Link>
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Registering...
                        </span>
                      ) : (
                        'Complete Registration'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </SignedIn>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">More Clients</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">Easy Booking</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">Secure Pay</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700">Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
