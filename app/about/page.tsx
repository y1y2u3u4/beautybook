import Link from 'next/link';
import { Heart, Shield, Clock, Users, Star, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/providers" className="text-neutral-600 hover:text-primary-600">
                Find Providers
              </Link>
              <Link href="/register" className="text-neutral-600 hover:text-primary-600">
                Join as Provider
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About BeautyBook
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            We&apos;re on a mission to connect beauty professionals with clients,
            making it easier than ever to discover, book, and enjoy premium beauty services.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-6">Our Mission</h2>
              <p className="text-lg text-neutral-600 mb-4">
                BeautyBook was founded with a simple goal: to revolutionize how people
                discover and book beauty services. We believe everyone deserves access
                to talented beauty professionals who can help them look and feel their best.
              </p>
              <p className="text-lg text-neutral-600 mb-4">
                For beauty professionals, we provide powerful tools to manage their business,
                reach new clients, and grow their brand. For clients, we offer a seamless
                booking experience with verified reviews and transparent pricing.
              </p>
              <p className="text-lg text-neutral-600">
                Together, we&apos;re building a community where beauty thrives.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-neutral-600">Happy Clients</div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-neutral-600">Beauty Pros</div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
                <div className="text-neutral-600">Cities</div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">4.9</div>
                <div className="text-neutral-600">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Client First</h3>
              <p className="text-neutral-600">
                Every decision we make starts with how it will benefit our clients
                and the beauty professionals who serve them.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Trust & Safety</h3>
              <p className="text-neutral-600">
                We verify all providers, protect your payments, and ensure
                every interaction on our platform is safe and secure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Excellence</h3>
              <p className="text-neutral-600">
                We partner only with skilled, passionate beauty professionals
                who are committed to delivering exceptional service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-neutral-900 text-center mb-12">
            Why Choose BeautyBook?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Clock className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">Easy Booking</h3>
              <p className="text-sm text-neutral-600">
                Book appointments 24/7 with just a few clicks. No phone calls needed.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Users className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">Verified Pros</h3>
              <p className="text-sm text-neutral-600">
                Every provider is vetted for skills, experience, and professionalism.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <Star className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">Real Reviews</h3>
              <p className="text-sm text-neutral-600">
                Read honest reviews from verified clients before you book.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <MapPin className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-neutral-900 mb-2">Local Experts</h3>
              <p className="text-sm text-neutral-600">
                Find talented beauty professionals right in your neighborhood.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of happy clients and talented beauty professionals on BeautyBook.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/providers"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              Find a Provider
            </Link>
            <Link
              href="/register"
              className="inline-block bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-400 transition-colors border-2 border-primary-400"
            >
              Become a Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Get in Touch</h2>
            <p className="text-lg text-neutral-600 mb-8">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="mailto:support@beautybook.com"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                support@beautybook.com
              </a>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <a
                href="mailto:providers@beautybook.com"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                providers@beautybook.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">BeautyBook</h2>
              <p className="text-neutral-400 mt-2">Connecting beauty, one booking at a time.</p>
            </div>
            <div className="flex gap-8">
              <Link href="/providers" className="text-neutral-400 hover:text-white">
                Find Providers
              </Link>
              <Link href="/register" className="text-neutral-400 hover:text-white">
                Join as Provider
              </Link>
              <Link href="/about" className="text-neutral-400 hover:text-white">
                About
              </Link>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; {new Date().getFullYear()} BeautyBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
