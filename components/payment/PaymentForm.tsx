'use client';

import { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  depositAmount?: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing?: boolean;
}

export default function PaymentForm({
  amount,
  depositAmount,
  onPaymentSuccess,
  onPaymentError,
  isProcessing = false,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'full' | 'deposit'>('full');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentAmount = paymentMethod === 'deposit' && depositAmount ? depositAmount : amount;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // In production, this would use Stripe Elements
      // For demo, we'll simulate a payment
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount * 100, // Convert to cents
          paymentType: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      onPaymentSuccess(data.paymentIntentId || 'demo_payment_' + Date.now());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      onPaymentError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      {depositAmount && depositAmount < amount && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-neutral-700">Payment Option</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('full')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMethod === 'full'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="font-semibold text-neutral-900">Pay in Full</div>
              <div className="text-lg font-bold text-primary-600 mt-1">
                ${amount.toFixed(2)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">No additional fees</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('deposit')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMethod === 'deposit'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="font-semibold text-neutral-900">Pay Deposit</div>
              <div className="text-lg font-bold text-primary-600 mt-1">
                ${depositAmount.toFixed(2)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                ${(amount - depositAmount).toFixed(2)} due at appointment
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Card Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Doe"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              className="input-field pl-12"
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              maxLength={4}
              required
              className="input-field"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isProcessing}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ${paymentAmount.toFixed(2)}
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Lock className="w-3 h-3" />
          <span>Your payment is secured with 256-bit encryption</span>
        </div>
      </form>
    </div>
  );
}
