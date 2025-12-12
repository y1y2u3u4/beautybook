'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SignedIn, SignedOut, useAuth } from '@clerk/nextjs';
import { Loader2, CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentInfo {
  paymentStatus: string;
  depositRequired: boolean;
  depositAmount: number | null;
  depositPaid: boolean;
  amount: number;
  service: {
    name: string;
    price: number;
  };
  provider: {
    businessName: string;
  };
  source: string;
}

export default function CheckoutPage({ params }: { params: { appointmentId: string } }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState<'full' | 'deposit'>('full');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchPaymentInfo();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, params.appointmentId]);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payments/checkout?appointmentId=${params.appointmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment info');
      }

      setPaymentInfo(data);

      // Default to deposit if required and not paid
      if (data.depositRequired && !data.depositPaid) {
        setPaymentType('deposit');
      }
    } catch (err: any) {
      console.error('Failed to fetch payment info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: params.appointmentId,
          paymentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout or demo checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Failed to proceed to payment:', err);
      setError(err.message);
      setProcessing(false);
    }
  };

  // Calculate payment amount based on type
  const getPaymentAmount = () => {
    if (!paymentInfo) return 0;

    if (paymentType === 'deposit' && paymentInfo.depositAmount) {
      return paymentInfo.depositAmount;
    }

    return paymentInfo.amount;
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-3xl mx-auto px-4 py-12">
        <SignedOut>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign In Required</h2>
            <p className="text-neutral-600 mb-6">
              Please sign in to complete your payment.
            </p>
            <Link
              href="/sign-in"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          {error && !paymentInfo ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Error</h2>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Link
                href="/customer/appointments"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Back to Appointments
              </Link>
            </div>
          ) : paymentInfo?.paymentStatus === 'PAID' ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Already Paid</h2>
              <p className="text-neutral-600 mb-6">
                This appointment has already been paid for.
              </p>
              <Link
                href="/customer/appointments"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                View Appointments
              </Link>
            </div>
          ) : paymentInfo ? (
            <div className="space-y-8">
              {/* Checkout Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Complete Your Payment</h2>
                <p className="text-neutral-600">Secure checkout for your appointment</p>

                {paymentInfo.source === 'mock' && (
                  <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                    Demo Mode - Database Unavailable
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-neutral-900">{paymentInfo.service.name}</p>
                      <p className="text-sm text-neutral-600">{paymentInfo.provider.businessName}</p>
                    </div>
                    <p className="font-semibold text-neutral-900">
                      {formatCurrency(paymentInfo.service.price)}
                    </p>
                  </div>

                  {/* Payment Type Selection */}
                  {paymentInfo.depositRequired && !paymentInfo.depositPaid && paymentInfo.depositAmount && (
                    <div className="pt-4 border-t border-neutral-200">
                      <p className="text-sm font-medium text-neutral-700 mb-3">Payment Option</p>
                      <div className="space-y-3">
                        <label
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            paymentType === 'deposit'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentType"
                              value="deposit"
                              checked={paymentType === 'deposit'}
                              onChange={() => setPaymentType('deposit')}
                              className="w-4 h-4 text-primary-600"
                            />
                            <div>
                              <p className="font-medium text-neutral-900">Pay Deposit Only</p>
                              <p className="text-sm text-neutral-600">
                                Pay remaining balance at appointment
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(paymentInfo.depositAmount)}
                          </span>
                        </label>

                        <label
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                            paymentType === 'full'
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-neutral-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentType"
                              value="full"
                              checked={paymentType === 'full'}
                              onChange={() => setPaymentType('full')}
                              className="w-4 h-4 text-primary-600"
                            />
                            <div>
                              <p className="font-medium text-neutral-900">Pay Full Amount</p>
                              <p className="text-sm text-neutral-600">
                                Pay the full amount now
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(paymentInfo.amount)}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-neutral-900">
                        {paymentType === 'deposit' ? 'Deposit Amount' : 'Total'}
                      </span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(getPaymentAmount())}
                      </span>
                    </div>
                    {paymentType === 'deposit' && paymentInfo.depositAmount && (
                      <p className="text-sm text-neutral-500 mt-1 text-right">
                        Remaining balance: {formatCurrency(paymentInfo.amount - paymentInfo.depositAmount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment</h3>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}

                {/* Security badges */}
                <div className="flex items-center gap-4 mb-6 text-sm text-neutral-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Powered by Stripe</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatCurrency(getPaymentAmount())}`
                  )}
                </button>

                <p className="text-xs text-neutral-500 text-center mt-4">
                  By completing this payment, you agree to our Terms of Service and Cancellation Policy.
                </p>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-neutral-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-neutral-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-900">Cancellation Policy</p>
                    <p className="text-sm text-neutral-600 mt-1">
                      Cancel up to 24 hours before your appointment for a full refund.
                      Cancellations within 24 hours may be subject to a cancellation fee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </SignedIn>
      </div>
    </div>
  );
}
