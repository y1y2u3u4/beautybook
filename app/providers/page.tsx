'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ProviderCard from '@/components/ProviderCard';
import FilterSidebar from '@/components/FilterSidebar';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Provider as ProviderCardType } from '@/lib/types';

interface APIProvider {
  id: string;
  businessName: string;
  title: string;
  bio: string;
  address: string;
  city: string;
  state: string;
  verified: boolean;
  averageRating: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  specialties: string[];
  experience: number;
  user?: {
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
  };
  services?: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
}

// Transform API provider to the format expected by ProviderCard
function transformProvider(p: APIProvider): ProviderCardType {
  const avatarUrl = p.user?.imageUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.businessName)}`;

  return {
    id: p.id,
    name: p.businessName,
    title: p.title,
    avatar: avatarUrl,
    specialty: p.specialties || [],
    rating: p.averageRating || 0,
    reviewCount: p.reviewCount || 0,
    experience: p.experience || 0,
    bio: p.bio || '',
    location: {
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      zipCode: '',
    },
    verified: p.verified || false,
    insuranceAccepted: [],
    languages: [],
    education: [],
    certifications: [],
    priceRange: {
      min: p.priceMin || 0,
      max: p.priceMax || 0,
    },
  };
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async (search?: string, location?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (location) {
        // Try to parse as city/state
        const parts = location.split(',').map(p => p.trim());
        if (parts.length >= 1) params.append('city', parts[0]);
        if (parts.length >= 2) params.append('state', parts[1]);
      }

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch providers');
      }

      // Transform API providers to ProviderCard format
      const transformedProviders = (data.providers || []).map(transformProvider);
      setProviders(transformedProviders);
      setDataSource(data.source || 'unknown');
    } catch (err: any) {
      console.error('Failed to fetch providers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProviders(searchQuery, locationQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    switch (sortBy) {
      case 'highest-rated':
        return b.rating - a.rating;
      case 'most-reviewed':
        return b.reviewCount - a.reviewCount;
      case 'price-low':
        return a.priceRange.min - b.priceRange.min;
      case 'price-high':
        return b.priceRange.max - a.priceRange.max;
      case 'experience':
        return b.experience - a.experience;
      default:
        // Recommended: combination of rating and reviews
        return (b.rating * b.reviewCount) - (a.rating * a.reviewCount);
    }
  });

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
              <Link href="/providers" className="text-primary-600 font-medium">
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

      {/* Search Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center border border-neutral-300 rounded-xl px-4 py-3 bg-white focus-within:border-primary-500 transition-colors">
              <Search className="w-5 h-5 text-neutral-400 mr-3" />
              <input
                type="text"
                placeholder="Service, specialist name, or keyword"
                className="flex-1 outline-none text-neutral-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex-1 flex items-center border border-neutral-300 rounded-xl px-4 py-3 bg-white focus-within:border-primary-500 transition-colors">
              <MapPin className="w-5 h-5 text-neutral-400 mr-3" />
              <input
                type="text"
                placeholder="City, state (e.g. Los Angeles, CA)"
                className="flex-1 outline-none text-neutral-700"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              className="btn-primary whitespace-nowrap px-8"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Beauty Professionals in Your Area
                </h2>
                <p className="text-neutral-600 mt-1">
                  {loading ? 'Loading...' : `${providers.length} providers found`}
                  {dataSource === 'mock' && (
                    <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Demo Data
                    </span>
                  )}
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-4">
                <button className="lg:hidden btn-secondary px-4 py-2 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select
                  className="input-field py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="highest-rated">Highest Rated</option>
                  <option value="most-reviewed">Most Reviewed</option>
                  <option value="experience">Most Experienced</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-3 text-neutral-600">Loading providers...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchProviders()}
                  className="mt-4 btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && providers.length === 0 && (
              <div className="bg-neutral-100 rounded-xl p-12 text-center">
                <Search className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">No providers found</h3>
                <p className="text-neutral-500">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Provider Cards */}
            {!loading && !error && providers.length > 0 && (
              <div className="space-y-4">
                {sortedProviders.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && providers.length > 0 && (
              <div className="mt-8 flex justify-center gap-2">
                <button className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50">
                  Previous
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary-600 text-white">
                  1
                </button>
                <button className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50">
                  2
                </button>
                <button className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50">
                  3
                </button>
                <button className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50">
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
