'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Star, MapPin, DollarSign, Loader2, AlertCircle, Trash2, Calendar } from 'lucide-react';

interface Provider {
  id: string;
  businessName: string;
  title: string;
  address: string;
  city: string;
  state: string;
  averageRating: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  specialties: string[];
  user: {
    imageUrl: string | null;
  };
}

interface Favorite {
  id: string;
  providerId: string;
  createdAt: string;
  provider: Provider | null;
}

export default function CustomerFavorites() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/favorites');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load favorites');
        }

        setFavorites(data.favorites || []);
        setDataSource(data.source || '');
      } catch (err: any) {
        console.error('Failed to fetch favorites:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchFavorites();
    }
  }, [isSignedIn]);

  const handleRemoveFavorite = async (providerId: string) => {
    if (dataSource === 'mock') {
      // For demo mode, just remove from local state
      setFavorites(prev => prev.filter(f => f.providerId !== providerId));
      return;
    }

    try {
      setRemovingId(providerId);

      const response = await fetch(`/api/favorites?providerId=${providerId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove favorite');
      }

      // Remove from local state
      setFavorites(prev => prev.filter(f => f.providerId !== providerId));
    } catch (err: any) {
      console.error('Failed to remove favorite:', err);
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">My Favorites</h1>
              <p className="text-neutral-600 mt-1">Your saved beauty providers</p>
            </div>
            <Link
              href="/customer/dashboard"
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

        {/* Stats */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{favorites.length}</div>
              <div className="text-sm text-neutral-600">Saved Providers</div>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
            <div className="text-neutral-400 mb-4">
              <Heart className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Save providers you love for quick access later
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Browse Providers
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Provider Image/Placeholder */}
                <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 relative">
                  {favorite.provider?.user?.imageUrl ? (
                    <img
                      src={favorite.provider.user.imageUrl}
                      alt={favorite.provider.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl text-white/50 font-bold">
                        {favorite.provider?.businessName?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFavorite(favorite.providerId)}
                    disabled={removingId === favorite.providerId}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    {removingId === favorite.providerId ? (
                      <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
                    ) : (
                      <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    )}
                  </button>
                </div>

                <div className="p-5">
                  {favorite.provider ? (
                    <>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">
                        {favorite.provider.businessName}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        {favorite.provider.title}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-neutral-900">
                            {favorite.provider.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-neutral-500">
                          ({favorite.provider.reviewCount} reviews)
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {favorite.provider.city}, {favorite.provider.state}
                        </span>
                      </div>

                      {/* Price Range */}
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span>
                          ${favorite.provider.priceMin} - ${favorite.provider.priceMax}
                        </span>
                      </div>

                      {/* Specialties */}
                      {favorite.provider.specialties && favorite.provider.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {favorite.provider.specialties.slice(0, 3).map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/providers/${favorite.providerId}`}
                          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-center hover:bg-primary-700 transition-colors text-sm"
                        >
                          View Profile
                        </Link>
                        <Link
                          href={`/book/${favorite.providerId}`}
                          className="flex-1 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-semibold text-center hover:bg-neutral-300 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-4 h-4" />
                          Book Now
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-neutral-500">Provider information unavailable</p>
                      <button
                        onClick={() => handleRemoveFavorite(favorite.providerId)}
                        className="mt-3 text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1 mx-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data Source Notice */}
        {dataSource === 'mock' && favorites.length > 0 && (
          <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">Demo</div>
              <div>
                <div className="font-bold text-yellow-900 mb-1">
                  Demo Mode - Favorites
                </div>
                <p className="text-yellow-800 text-sm">
                  This is sample favorites data. Connect to the database to save and manage your real favorites list.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
