import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Calendar, Clock, MapPin, User, Mail } from 'lucide-react';

export default function AppointmentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-neutral-600">
            Your appointment has been successfully booked. You&apos;ll receive a confirmation email shortly.
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="card-glass p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Check Your Email</h3>
                <p className="text-neutral-600">
                  We&apos;ve sent a confirmation email with all the details of your appointment.
                  You&apos;ll also receive a reminder 24 hours before your appointment.
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Added to Calendar</h3>
                <p className="text-neutral-600">
                  Your appointment has been added to your calendar. You can also add it to
                  Google Calendar from your appointment details page.
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 mb-1">Cancellation Policy</h3>
                <p className="text-neutral-600">
                  You can cancel or reschedule your appointment up to 24 hours in advance
                  for a full refund. Visit your appointments page to manage your booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/appointments"
            className="flex-1 btn-primary text-center"
          >
            View My Appointments
          </Link>
          <Link
            href="/providers"
            className="flex-1 btn-secondary text-center"
          >
            Book Another Service
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">What Happens Next?</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                1
              </div>
              <p className="text-neutral-700">
                Your provider will receive a notification about your booking
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                2
              </div>
              <p className="text-neutral-700">
                You&apos;ll receive an email with appointment details and provider contact information
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                3
              </div>
              <p className="text-neutral-700">
                We&apos;ll send you a reminder 24 hours before your appointment
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                4
              </div>
              <p className="text-neutral-700">
                After your appointment, you can leave a review to help others
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-neutral-600">
            Need help? <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
