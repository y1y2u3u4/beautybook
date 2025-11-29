'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Clock, TrendingUp, X, Loader2 } from 'lucide-react';

interface SearchSuggestion {
  type: 'service' | 'location' | 'recent' | 'trending';
  text: string;
  icon?: React.ReactNode;
}

const popularServices = [
  'Facial Treatment',
  'Hair Styling',
  'Massage Therapy',
  'Manicure & Pedicure',
  'Makeup Artistry',
  'Hair Coloring',
  'Eyebrow Threading',
  'Skin Care Consultation',
  'Deep Tissue Massage',
  'Bridal Makeup',
];

const popularLocations = [
  'Los Angeles, CA',
  'New York, NY',
  'Chicago, IL',
  'Houston, TX',
  'Miami, FL',
  'San Francisco, CA',
  'Seattle, WA',
  'Boston, MA',
];

const STORAGE_KEY = 'beautybook_recent_searches';

export default function SearchAutocomplete() {
  const router = useRouter();
  const [serviceQuery, setServiceQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [activeInput, setActiveInput] = useState<'service' | 'location' | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveInput(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    const query = activeInput === 'service' ? serviceQuery : locationQuery;
    const items: SearchSuggestion[] = [];

    if (!query) {
      // Show recent and trending when input is empty
      if (activeInput === 'service') {
        recentSearches.slice(0, 3).forEach(text => {
          items.push({ type: 'recent', text, icon: <Clock className="w-4 h-4" /> });
        });
        popularServices.slice(0, 5).forEach(text => {
          items.push({ type: 'trending', text, icon: <TrendingUp className="w-4 h-4" /> });
        });
      } else if (activeInput === 'location') {
        popularLocations.slice(0, 6).forEach(text => {
          items.push({ type: 'location', text, icon: <MapPin className="w-4 h-4" /> });
        });
      }
    } else {
      // Filter based on query
      const lowerQuery = query.toLowerCase();
      if (activeInput === 'service') {
        popularServices
          .filter(s => s.toLowerCase().includes(lowerQuery))
          .slice(0, 6)
          .forEach(text => {
            items.push({ type: 'service', text, icon: <Search className="w-4 h-4" /> });
          });
      } else {
        popularLocations
          .filter(l => l.toLowerCase().includes(lowerQuery))
          .slice(0, 6)
          .forEach(text => {
            items.push({ type: 'location', text, icon: <MapPin className="w-4 h-4" /> });
          });
      }
    }

    setSuggestions(items);
  }, [serviceQuery, locationQuery, activeInput, recentSearches]);

  const saveRecentSearch = (query: string) => {
    try {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const handleSearch = () => {
    if (serviceQuery) {
      saveRecentSearch(serviceQuery);
    }
    setIsLoading(true);
    const params = new URLSearchParams();
    if (serviceQuery) params.set('service', serviceQuery);
    if (locationQuery) params.set('location', locationQuery);
    router.push(`/providers?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (activeInput === 'service') {
      setServiceQuery(suggestion.text);
    } else {
      setLocationQuery(suggestion.text);
    }
    setActiveInput(null);
  };

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto">
      <div className="card-glass p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Service Input */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-white rounded-2xl px-5 py-4 border-2 border-neutral-200 focus-within:border-primary-400 transition-all">
              <Search className="w-6 h-6 text-primary-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                onFocus={() => setActiveInput('service')}
                placeholder="Facial, Massage, Hair Styling..."
                className="flex-1 outline-none text-neutral-700 text-lg bg-transparent"
              />
              {serviceQuery && (
                <button
                  onClick={() => setServiceQuery('')}
                  className="p-1 hover:bg-neutral-100 rounded-full"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              )}
            </div>

            {/* Service Suggestions Dropdown */}
            {activeInput === 'service' && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                {recentSearches.length > 0 && !serviceQuery && (
                  <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-b border-neutral-100">
                    <span className="text-xs font-medium text-neutral-500">Recent Searches</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Clear all
                    </button>
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <span className="text-neutral-400">{suggestion.icon}</span>
                    <span className="text-neutral-700">{suggestion.text}</span>
                    {suggestion.type === 'trending' && (
                      <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Input */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-white rounded-2xl px-5 py-4 border-2 border-neutral-200 focus-within:border-primary-400 transition-all">
              <MapPin className="w-6 h-6 text-secondary-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onFocus={() => setActiveInput('location')}
                placeholder="Los Angeles, CA"
                className="flex-1 outline-none text-neutral-700 text-lg bg-transparent"
              />
              {locationQuery && (
                <button
                  onClick={() => setLocationQuery('')}
                  className="p-1 hover:bg-neutral-100 rounded-full"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              )}
            </div>

            {/* Location Suggestions Dropdown */}
            {activeInput === 'location' && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100">
                  <span className="text-xs font-medium text-neutral-500">Popular Locations</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <span className="text-neutral-400">{suggestion.icon}</span>
                    <span className="text-neutral-700">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="btn-primary whitespace-nowrap text-lg px-10 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
