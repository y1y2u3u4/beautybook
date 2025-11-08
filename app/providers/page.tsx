import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import ProviderCard from '@/components/ProviderCard';
import FilterSidebar from '@/components/FilterSidebar';
import { mockProviders } from '@/lib/mock-data';

export default function ProvidersPage() {
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
              <Link href="/login" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
            </nav>
            <Link href="/register" className="btn-primary px-6 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-3">
            <div className="flex-1 flex items-center border border-neutral-300 rounded-xl px-4 py-3 bg-white">
              <Search className="w-5 h-5 text-neutral-400 mr-3" />
              <input
                type="text"
                placeholder="Service, specialist name, or condition"
                className="flex-1 outline-none text-neutral-700"
                defaultValue=""
              />
            </div>
            <div className="flex-1 flex items-center border border-neutral-300 rounded-xl px-4 py-3 bg-white">
              <MapPin className="w-5 h-5 text-neutral-400 mr-3" />
              <input
                type="text"
                placeholder="City, state, or ZIP code"
                className="flex-1 outline-none text-neutral-700"
              />
            </div>
            <button className="btn-primary whitespace-nowrap px-8">
              Search
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
                  {mockProviders.length} providers match your search
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-4">
                <button className="lg:hidden btn-secondary px-4 py-2 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <select className="input-field py-2 text-sm">
                  <option>Recommended</option>
                  <option>Highest Rated</option>
                  <option>Most Reviewed</option>
                  <option>Nearest</option>
                  <option>Soonest Available</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Provider Cards */}
            <div className="space-y-4">
              {mockProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            {/* Pagination */}
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
          </main>
        </div>
      </div>
    </div>
  );
}
