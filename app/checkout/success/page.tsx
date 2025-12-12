'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  useEffect(() => {
    // Simulate loading appointment details
    const timer = setTimeout(() => {
      setLoading(false);
      // In a real app, you would fetch the appointment details here
    }, 1500);

    return () => clearTimeout(timer);
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            Your appointment has been confirmed.
          </p>

          {/* Confirmation Number */}
          <div className="bg-neutral-50 rounded-xl p-4 mb-6 inline-block">
            <p className="text-sm text-neutral-500 mb-1">Confirmation Number</p>
            <p className="text-xl font-mono font-bold text-neutral-900">
              {appointmentId?.slice(0, 8).toUpperCase() || 'BB-DEMO123'}
            </p>
          </div>

          {/* What's Next */}
          <div className="text-left bg-primary-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-neutral-900 mb-3">What&apos;s Next?</h3>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <span>Check your email for a confirmation with all the details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <span>You&apos;ll receive a reminder 24 hours before your appointment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <span>Arrive 5-10 minutes early for the best experience</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/customer/appointments"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              View My Appointments
            </Link>
            <Link
              href="/providers"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              Book Another Service
            </Link>
          </div>
        </div>

        {/* Add to Calendar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <h3 className="font-semibold text-neutral-900 mb-4">Add to Calendar</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors">
              Google Calendar
            </button>
            <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors">
              Apple Calendar
            </button>
            <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-medium text-neutral-700 transition-colors">
              Outlook
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-neutral-600">
            Need help?{' '}
            <a href="mailto:support@beautybook.com" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
