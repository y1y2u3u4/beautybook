'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, Star, Shield, MapPin, Clock, Sparkles, Heart, Award } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set('search', service);
    if (location) params.set('location', location);
    router.push(`/providers?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header with Glass Effect */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text">BeautyBook</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/providers" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                Find Providers
              </Link>
              <Link href="/about" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                About
              </Link>
              <Link href="/login" className="text-neutral-700 hover:text-primary-600 font-medium transition-colors">
                Sign In
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient Background */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary-300/30 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-6 border border-primary-200">
              <Star className="w-4 h-4 text-primary-600 fill-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Trusted by 10,000+ Beauty Enthusiasts</span>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
              Discover Your Perfect
              <span className="gradient-text block mt-2">Beauty Professional</span>
            </h2>

            <p className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed">
              Book appointments with verified specialists, read authentic reviews,
              <br className="hidden md:block" />
              and experience beauty services you&apos;ll love.
            </p>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="card-glass max-w-3xl mx-auto p-4 animate-slide-up">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center bg-white rounded-2xl px-5 py-4 border-2 border-neutral-200 focus-within:border-primary-400 transition-all">
                  <Search className="w-6 h-6 text-primary-500 mr-3" />
                  <input
                    type="text"
                    placeholder="Facial, Massage, Hair Styling..."
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="flex-1 outline-none text-neutral-700 text-lg bg-transparent"
                  />
                </div>
                <div className="flex-1 flex items-center bg-white rounded-2xl px-5 py-4 border-2 border-neutral-200 focus-within:border-primary-400 transition-all">
                  <MapPin className="w-6 h-6 text-secondary-500 mr-3" />
                  <input
                    type="text"
                    placeholder="Los Angeles, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 outline-none text-neutral-700 text-lg bg-transparent"
                  />
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap text-lg px-10">
                  <Search className="w-5 h-5 inline mr-2" />
                  Search
                </button>
              </div>
            </form>

            {/* Popular Services */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <span className="text-sm text-neutral-500 font-medium">Popular:</span>
              {['Facial Treatment', 'Hair Styling', 'Massage Therapy', 'Manicure & Pedicure', 'Makeup Artistry'].map((service) => (
                <Link
                  key={service}
                  href={`/providers?service=${service.toLowerCase()}`}
                  className="px-5 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-neutral-700
                           hover:bg-gradient-to-r hover:from-primary-500 hover:to-secondary-500 hover:text-white
                           border-2 border-neutral-200 hover:border-transparent transition-all duration-300 transform hover:scale-105"
                >
                  {service}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mb-4">
              <Heart className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Why Choose Us</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Experience Beauty Booking
              <span className="gradient-text block">Like Never Before</span>
            </h3>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We make finding and booking your next beauty treatment effortless and enjoyable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-glass text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl mb-6 shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-3 text-neutral-900">Verified Professionals</h4>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Every provider is thoroughly verified with credentials, licenses, and insurance displayed transparently.
              </p>
            </div>

            <div className="card-glass text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-3xl mb-6 shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-3 text-neutral-900">Authentic Reviews</h4>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Read real reviews from verified customers to make confident, informed decisions about your care.
              </p>
            </div>

            <div className="card-glass text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-500 to-primary-500 rounded-3xl mb-6 shadow-glow group-hover:shadow-glow-lg transition-shadow">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-3 text-neutral-900">Instant Booking</h4>
              <p className="text-neutral-600 leading-relaxed text-lg">
                View real-time availability and book appointments 24/7 with instant confirmation and reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-4 border border-primary-200">
              <Award className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">Simple Process</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Book Your Appointment
              <span className="gradient-text block">In 3 Easy Steps</span>
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-300"></div>

            <div className="relative">
              <div className="card-glass relative overflow-hidden group">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-glow">
                    1
                  </div>
                  <div className="pt-8">
                    <Search className="w-14 h-14 text-primary-600 mb-6" />
                    <h4 className="text-2xl font-bold mb-3 text-neutral-900">Search & Filter</h4>
                    <p className="text-neutral-600 leading-relaxed text-lg">
                      Browse specialists by service, location, ratings, and real-time availability to find your perfect match.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-glass relative overflow-hidden group">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-500/10 rounded-full blur-2xl group-hover:bg-secondary-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-glow">
                    2
                  </div>
                  <div className="pt-8">
                    <Clock className="w-14 h-14 text-secondary-600 mb-6" />
                    <h4 className="text-2xl font-bold mb-3 text-neutral-900">Choose Time</h4>
                    <p className="text-neutral-600 leading-relaxed text-lg">
                      View real-time availability and select a convenient time slot that perfectly fits your schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-glass relative overflow-hidden group">
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl group-hover:bg-accent-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-glow">
                    3
                  </div>
                  <div className="pt-8">
                    <Calendar className="w-14 h-14 text-accent-600 mb-6" />
                    <h4 className="text-2xl font-bold mb-3 text-neutral-900">Book & Relax</h4>
                    <p className="text-neutral-600 leading-relaxed text-lg">
                      Confirm your booking and receive instant confirmation with automatic reminders via email and SMS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 opacity-95"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <Sparkles className="w-16 h-16 text-white/80 mx-auto mb-6 animate-float" />
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Experience <br className="hidden md:block" />
            Effortless Beauty Booking?
          </h3>
          <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed">
            Join thousands of satisfied customers who trust BeautyBook for their beauty and wellness needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/providers" className="inline-block bg-white text-primary-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-neutral-50 transition-all duration-300 transform hover:scale-105 shadow-xl">
              Browse Providers
            </Link>
            <Link href="/register" className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              Join as Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-white font-bold text-xl">BeautyBook</h5>
              </div>
              <p className="text-sm leading-relaxed">
                Your trusted platform for discovering and booking the best beauty and wellness services.
              </p>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4 text-lg">For Customers</h6>
              <ul className="space-y-3 text-sm">
                <li><Link href="/providers" className="hover:text-white transition-colors">Find Providers</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4 text-lg">For Providers</h6>
              <ul className="space-y-3 text-sm">
                <li><Link href="/join" className="hover:text-white transition-colors">Join BeautyBook</Link></li>
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="text-white font-semibold mb-4 text-lg">Company</h6>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-sm text-center">
            <p>&copy; 2024 BeautyBook. All rights reserved. Made with <Heart className="w-4 h-4 inline text-primary-500" /> for beauty enthusiasts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
