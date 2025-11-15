import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Join BeautyBook as a Provider
          </h1>
          <p className="text-xl text-neutral-600">
            Grow your business and connect with thousands of clients
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Why Join BeautyBook?
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Reach More Clients</h3>
                <p className="text-neutral-600">Get discovered by thousands of potential clients in your area</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Easy Scheduling</h3>
                <p className="text-neutral-600">Automated booking system saves you time and reduces no-shows</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Secure Payments</h3>
                <p className="text-neutral-600">Get paid automatically with our integrated payment system</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Business Insights</h3>
                <p className="text-neutral-600">Track your performance with detailed analytics and reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon / Test Mode Notice */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 text-center text-white">
          <div className="mb-6">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold mb-4">
              Currently in Development
            </div>
            <h2 className="text-3xl font-bold mb-4">Registration Opening Soon!</h2>
            <p className="text-lg text-primary-100 mb-6">
              We&apos;re putting the finishing touches on our provider registration system.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">For Testing & Development</h3>
            <p className="text-primary-100 mb-4">
              Use the following test accounts to explore provider features:
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <div className="bg-white/10 rounded-lg px-4 py-3">
                <div className="font-mono text-sm">
                  <strong>Provider 1:</strong> provider1@test.com
                </div>
                <div className="text-xs text-primary-200 mt-1">Sarah Johnson - Radiant Skin Clinic</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-3">
                <div className="font-mono text-sm">
                  <strong>Provider 2:</strong> provider2@test.com
                </div>
                <div className="text-xs text-primary-200 mt-1">Emily Rodriguez - Hair Studio</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/test-mode"
              className="inline-block bg-yellow-400 text-neutral-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              🧪 进入测试模式
            </Link>
            <Link
              href="/providers"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              Browse Providers
            </Link>
            <Link
              href="/"
              className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 text-neutral-600">
          <p>
            Questions about becoming a provider?{' '}
            <a href="mailto:providers@beautybook.com" className="text-primary-600 hover:text-primary-700 font-semibold">
              Contact our team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
