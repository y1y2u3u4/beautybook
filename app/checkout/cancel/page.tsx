'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';

function CheckoutCancelContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointment_id');

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-neutral-500" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            Payment Cancelled
          </h1>
          <p className="text-neutral-600 mb-8">
            Your payment was not completed. Your appointment is still pending.
          </p>

          {/* What to do next */}
          <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-neutral-900 mb-3">What would you like to do?</h3>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2"></span>
                <span>Try the payment again with a different card</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2"></span>
                <span>Contact us if you experienced any issues</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mt-2"></span>
                <span>Keep your appointment and pay later</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {appointmentId && (
              <Link
                href={`/checkout/${appointmentId}`}
                className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Try Again
              </Link>
            )}

            <Link
              href="/customer/appointments"
              className="flex items-center justify-center gap-2 w-full border-2 border-neutral-200 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Appointments
            </Link>
          </div>

          {/* Help Link */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <a
              href="mailto:support@beautybook.com"
              className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600"
            >
              <HelpCircle className="w-4 h-4" />
              Need help? Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}
