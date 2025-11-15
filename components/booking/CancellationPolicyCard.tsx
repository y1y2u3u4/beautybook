'use client';

import { Shield, Info } from 'lucide-react';
import { CancellationPolicy } from '@prisma/client';
import { getPolicyDescription } from '@/lib/cancellation/policy';

interface CancellationPolicyCardProps {
  policy: CancellationPolicy;
  depositRequired?: boolean;
  depositAmount?: number;
  className?: string;
}

export default function CancellationPolicyCard({
  policy,
  depositRequired = false,
  depositAmount = 0,
  className = '',
}: CancellationPolicyCardProps) {
  const policyInfo = getPolicyDescription(policy);

  const getPolicyColor = () => {
    switch (policy) {
      case 'FLEXIBLE':
        return 'bg-green-50 border-green-200';
      case 'MODERATE':
        return 'bg-blue-50 border-blue-200';
      case 'STANDARD':
        return 'bg-amber-50 border-amber-200';
      case 'STRICT':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <div className={`card border-2 ${getPolicyColor()} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-primary-600" />
        <h3 className="text-xl font-bold text-neutral-900">
          {policyInfo.title}
        </h3>
      </div>

      <ul className="space-y-2 mb-4">
        {policyInfo.rules.map((rule, index) => (
          <li key={index} className="text-neutral-700 flex items-start gap-2">
            <span className="text-lg leading-none">{rule.split(' ')[0]}</span>
            <span>{rule.substring(rule.indexOf(' ') + 1)}</span>
          </li>
        ))}
      </ul>

      {depositRequired && depositAmount > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-900 mb-1">
                Deposit Required
              </p>
              <p className="text-sm text-neutral-600">
                A deposit of <span className="font-bold">${depositAmount.toFixed(2)}</span> is
                required to secure your appointment. This will be deducted from your total amount.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-neutral-500">
        <p>
          By booking this appointment, you agree to the cancellation policy above.
          Cancellation fees may apply based on when you cancel.
        </p>
      </div>
    </div>
  );
}
