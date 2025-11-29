'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Shield,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { mockProviders, mockServices } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import PaymentForm from '@/components/payment/PaymentForm';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const provider = mockProviders.find(p => p.id === params.id);
  const serviceId = searchParams.get('service');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const service = serviceId ? mockServices.find(s => s.id === serviceId) : null;

  useEffect(() => {
    if (!provider || !service || !date || !time) {
      router.push(`/providers/${params.id}/book`);
    }
  }, [provider, service, date, time, router, params.id]);

  if (!provider || !service || !date || !time) {
    return null;
  }

  const depositAmount = service.price * 0.2; // 20% deposit
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePaymentSuccess = (paymentIntentId: string) => {
    const newBookingId = 'BK' + Date.now().toString(36).toUpperCase();
    setBookingId(newBookingId);
    setIsSuccess(true);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30 flex items-center justify-center p-4">
        <div className="card-glass max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-neutral-600 mb-6">
            Your appointment has been successfully booked.
          </p>

          <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm text-neutral-500 mb-1">Booking ID</div>
            <div className="font-mono font-bold text-neutral-900">{bookingId}</div>
          </div>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 text-neutral-700">
              <Calendar className="w-5 h-5 text-primary-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-700">
              <Clock className="w-5 h-5 text-primary-500" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-700">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span>{provider.location.address}</span>
            </div>
          </div>

          <p className="text-sm text-neutral-500 mb-6">
            A confirmation email has been sent to your email address.
            You will also receive a reminder 24 hours before your appointment.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/customer/appointments"
              className="flex-1 btn-primary text-center"
            >
              View My Appointments
            </Link>
            <Link
              href="/providers"
              className="flex-1 btn-secondary text-center"
            >
              Browse More Providers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">BeautyBook</h1>
            </Link>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href={`/providers/${params.id}/book`}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to booking
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <div className="card-glass">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment Details
              </h2>

              <PaymentForm
                amount={service.price}
                depositAmount={depositAmount}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>

            {/* Cancellation Policy */}
            <div className="card-glass mt-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Cancellation Policy</h3>
              <ul className="text-sm text-neutral-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  Free cancellation up to 48 hours before appointment
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  50% refund for cancellations 24-48 hours before
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  No refund for cancellations within 24 hours
                </li>
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card-glass sticky top-24">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Order Summary</h3>

              {/* Provider Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-neutral-200">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100">
                  <Image
                    src={provider.avatar}
                    alt={provider.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">{provider.name}</h4>
                  <p className="text-sm text-neutral-600">{provider.title}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="py-4 border-b border-neutral-200 space-y-3">
                <div>
                  <p className="text-sm text-neutral-500">Service</p>
                  <p className="font-medium text-neutral-900">{service.name}</p>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">{time} ({service.duration} min)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span className="text-sm">{provider.location.city}, {provider.location.state}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-2">
                <div className="flex justify-between text-neutral-600">
                  <span>Service</span>
                  <span>{formatCurrency(service.price)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Processing fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span className="text-xl">{formatCurrency(service.price)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
