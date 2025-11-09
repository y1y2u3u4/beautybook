import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Clock, Shield, CheckCircle, Award, Languages, GraduationCap, Calendar } from 'lucide-react';
import { mockProviders, mockReviews, mockServices } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import ReviewCard from '@/components/ReviewCard';

export default function ProviderDetailPage({ params }: { params: { id: string } }) {
  const provider = mockProviders.find(p => p.id === params.id);
  const providerReviews = mockReviews.filter(r => r.providerId === params.id);

  if (!provider) {
    return <div>Provider not found</div>;
  }

  const ratingDistribution = [
    { stars: 5, count: 280, percentage: 82 },
    { stars: 4, count: 45, percentage: 13 },
    { stars: 3, count: 12, percentage: 4 },
    { stars: 2, count: 3, percentage: 1 },
    { stars: 1, count: 2, percentage: 0 },
  ];

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
              <Link href="/login" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Provider Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-neutral-100">
                <Image
                  src={provider.coverImage || provider.images?.[0] || '/placeholder.jpg'}
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
                  <p className="text-lg text-neutral-600 mt-2">{provider.description}</p>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg">
                        <Star className="w-5 h-5 fill-primary-600 text-primary-600" />
                        <span className="font-bold text-lg text-neutral-900">{provider.averageRating}</span>
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
                      <span>{provider.city}, {provider.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{provider.experience} years experience</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {provider.specialty.map((spec) => (
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

            {/* Specialties & Services */}
            <section className="card">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Services Offered</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {mockServices.map((service) => (
                  <div key={service.id} className="border border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-neutral-900">{service.name}</h3>
                      <span className="font-semibold text-primary-600">{formatCurrency(service.price)}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{service.description}</p>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} minutes</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Certifications */}
            <section className="card">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Credentials</h2>

              <div className="space-y-6">
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

            {/* Reviews */}
            <section className="card">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Patient Reviews</h2>

              {/* Rating Summary */}
              <div className="bg-neutral-50 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-neutral-900">{provider.averageRating}</div>
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
                    {ratingDistribution.map((dist) => (
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
              <div>
                {providerReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              <button className="btn-secondary w-full mt-6">
                Load More Reviews
              </button>
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Book Appointment</h3>

              <div className="mb-6">
                <p className="text-sm text-neutral-600 mb-2">Price Range</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(provider.priceRange.min)} - {formatCurrency(provider.priceRange.max)}
                </p>
              </div>

              {provider.nextAvailable && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Next Available</span>
                  </div>
                  <p className="text-green-700 mt-1">
                    {provider.nextAvailable.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {provider.insuranceAccepted.length > 0 && (
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

              <Link href={`/providers/${provider.id}/book`} className="btn-primary w-full text-center">
                Check Availability
              </Link>

              <div className="mt-4 pt-4 border-t border-neutral-200">
                <button className="btn-secondary w-full">
                  Save Provider
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
