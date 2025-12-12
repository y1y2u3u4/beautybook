'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Shield, CheckCircle, Award, Languages, GraduationCap, Calendar, Loader2, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ReviewCard from '@/components/ReviewCard';
import { SignedIn, SignedOut, UserButton, useAuth } from '@clerk/nextjs';
import { Review as ReviewType } from '@/lib/types';

interface Provider {
  id: string;
  businessName: string;
  title: string;
  bio: string;
  phone: string;
  verified: boolean;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  experience: number;
  languages: string[];
  specialties: string[];
  priceMin: number;
  priceMax: number;
  insuranceAccepted: string[];
  averageRating: number;
  reviewCount: number;
  user?: {
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
  };
  services?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
}

interface APIReview {
  id: string;
  providerId?: string;
  rating: number;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt?: string;
  date?: string;
  userName?: string;
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

// Transform API review to the format expected by ReviewCard
function transformReview(review: APIReview, providerId: string): ReviewType {
  const userName = review.userName ||
    (review.customer ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() : 'Anonymous');

  return {
    id: review.id,
    providerId: review.providerId || providerId,
    userId: review.customer?.id || 'unknown',
    userName: userName || 'Anonymous',
    rating: review.rating,
    comment: review.comment,
    date: new Date(review.createdAt || review.date || new Date()),
    verified: review.verified,
    helpful: review.helpful || 0,
  };
}

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    fetchProviderData();
  }, [params.id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/providers/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch provider');
      }

      setProvider(data.provider);
      // Transform API reviews to match ReviewCard expected format
      const transformedReviews = (data.reviews || []).map((r: APIReview) =>
        transformReview(r, params.id)
      );
      setReviews(transformedReviews);
      setRatingDistribution(data.ratingDistribution || {});
      setDataSource(data.source || 'unknown');
    } catch (err: any) {
      console.error('Failed to fetch provider:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-in';
      return;
    }

    try {
      if (isFavorite) {
        await fetch(`/api/favorites?providerId=${params.id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: params.id }),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to update favorite:', err);
    }
  };

  // Calculate rating distribution percentages
  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  const ratingBars = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: ratingDistribution[stars] || 0,
    percentage: totalReviews > 0 ? ((ratingDistribution[stars] || 0) / totalReviews) * 100 : 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading provider details...</span>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Provider Not Found</h2>
          <p className="text-neutral-600 mb-4">{error || 'The provider you are looking for does not exist.'}</p>
          <Link href="/providers" className="btn-primary">
            Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  const avatarUrl = provider.user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.businessName}`;

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
              <Link href="/about" className="text-neutral-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              <SignedOut>
                <Link href="/sign-in" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  Sign In
                </Link>
              </SignedOut>
            </nav>
            <div className="flex items-center gap-4">
              <SignedIn>
                <Link href="/customer/appointments" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  My Appointments
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Link href="/sign-up" className="btn-primary px-6 py-2">
                  Get Started
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Data Source Badge */}
      {dataSource === 'mock' && (
        <div className="bg-amber-50 border-b border-amber-200 py-2 text-center">
          <span className="text-amber-700 text-sm">Demo Data - This is sample data for demonstration</span>
        </div>
      )}

      {/* Provider Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-neutral-100">
                <Image
                  src={avatarUrl}
                  alt={provider.businessName}
                  fill
                  className="object-cover"
                />
                {provider.verified && (
                  <div className="absolute bottom-3 right-3 bg-primary-600 text-white p-2 rounded-full">
                    <Shield className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-900">{provider.businessName}</h1>
                  <p className="text-lg text-neutral-600 mt-2">{provider.title}</p>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg">
                        <Star className="w-5 h-5 fill-primary-600 text-primary-600" />
                        <span className="font-bold text-lg text-neutral-900">{provider.averageRating.toFixed(1)}</span>
                      </div>
                      <span className="text-neutral-600">({provider.reviewCount} reviews)</span>
                    </div>

                    {provider.verified && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Verified Provider</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-neutral-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{provider.address}, {provider.city}, {provider.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{provider.experience} years experience</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {provider.specialties.map((spec) => (
                  <span key={spec} className="badge badge-info text-base px-4 py-2">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="card">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">About</h2>
              <p className="text-neutral-700 leading-relaxed">{provider.bio}</p>
            </section>

            {/* Services */}
            {provider.services && provider.services.length > 0 && (
              <section className="card">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Services Offered</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.services.map((service) => (
                    <div key={service.id} className="border border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-neutral-900">{service.name}</h3>
                        <span className="font-semibold text-primary-600">{formatCurrency(service.price)}</span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} minutes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education & Certifications */}
            {((provider.education && provider.education.length > 0) ||
              (provider.certifications && provider.certifications.length > 0)) && (
              <section className="card">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Credentials</h2>

                <div className="space-y-6">
                  {provider.education && provider.education.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <GraduationCap className="w-5 h-5 text-primary-600" />
                        <h3 className="font-semibold text-neutral-900">Education</h3>
                      </div>
                      <div className="space-y-3">
                        {provider.education.map((edu, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-neutral-900">{edu.degree}</p>
                              <p className="text-neutral-600">{edu.institution}</p>
                            </div>
                            <span className="text-neutral-500">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.certifications && provider.certifications.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-primary-600" />
                        <h3 className="font-semibold text-neutral-900">Certifications</h3>
                      </div>
                      <div className="space-y-3">
                        {provider.certifications.map((cert, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-neutral-900">{cert.name}</p>
                              <p className="text-neutral-600">{cert.issuer}</p>
                            </div>
                            <span className="text-neutral-500">{cert.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.languages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Languages className="w-5 h-5 text-primary-600" />
                        <h3 className="font-semibold text-neutral-900">Languages</h3>
                      </div>
                      <p className="text-neutral-700">{provider.languages.join(', ')}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="card">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Patient Reviews</h2>

              {/* Rating Summary */}
              <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-neutral-900">{provider.averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(provider.averageRating)
                              ? 'fill-primary-600 text-primary-600'
                              : 'text-neutral-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">{provider.reviewCount} reviews</p>
                  </div>

                  <div className="flex-1">
                    {ratingBars.map((dist) => (
                      <div key={dist.stars} className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-neutral-600 w-8">{dist.stars} ★</span>
                        <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600"
                            style={{ width: `${dist.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-neutral-600 w-12">{dist.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">No reviews yet</p>
              )}

              {reviews.length > 5 && (
                <button className="btn-secondary w-full mt-6">
                  Load More Reviews
                </button>
              )}
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Book Appointment</h3>

              <div className="mb-6">
                <p className="text-sm text-neutral-600 mb-2">Price Range</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(provider.priceMin)} - {formatCurrency(provider.priceMax)}
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-green-800">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Available Now</span>
                </div>
                <p className="text-green-700 mt-1">
                  Click below to check available times
                </p>
              </div>

              {provider.insuranceAccepted && provider.insuranceAccepted.length > 0 && (
                <div className="mb-6">
                  <p className="font-semibold text-neutral-900 mb-2">Insurance Accepted</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.insuranceAccepted.map((insurance) => (
                      <span key={insurance} className="badge badge-info text-sm">
                        {insurance}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Link href={`/providers/${provider.id}/book`} className="btn-primary w-full text-center block">
                Check Availability
              </Link>

              <div className="mt-4 pt-4 border-t border-neutral-200">
                <button
                  onClick={handleSaveProvider}
                  className={`btn-secondary w-full flex items-center justify-center gap-2 ${isFavorite ? 'bg-pink-50 border-pink-300 text-pink-600' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save Provider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
