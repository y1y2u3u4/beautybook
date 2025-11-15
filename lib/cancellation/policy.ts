import { CancellationPolicy } from '@prisma/client';

export interface CancellationFeeResult {
  canCancel: boolean;
  feePercentage: number;
  feeAmount: number;
  reason: string;
}

/**
 * Calculate cancellation fee based on policy and time until appointment
 */
export function calculateCancellationFee(
  policy: CancellationPolicy,
  appointmentDateTime: Date,
  appointmentAmount: number,
  customHoursBefore?: number,
  customFeePercentage?: number
): CancellationFeeResult {
  const now = new Date();
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Check if appointment is in the past
  if (hoursUntilAppointment < 0) {
    return {
      canCancel: false,
      feePercentage: 100,
      feeAmount: appointmentAmount,
      reason: 'Appointment has already passed',
    };
  }

  let requiredHours: number;
  let feePercentage: number;

  // Use custom rules if provided
  if (customHoursBefore !== undefined && customFeePercentage !== undefined) {
    requiredHours = customHoursBefore;
    feePercentage = customFeePercentage;
  } else {
    // Use standard policy
    switch (policy) {
      case 'FLEXIBLE':
        requiredHours = 0;
        feePercentage = 0;
        break;

      case 'MODERATE':
        requiredHours = 12;
        feePercentage = hoursUntilAppointment >= 12 ? 0 : 50;
        break;

      case 'STANDARD':
        requiredHours = 24;
        feePercentage = hoursUntilAppointment >= 24 ? 0 : 50;
        break;

      case 'STRICT':
        requiredHours = 48;
        if (hoursUntilAppointment >= 48) {
          feePercentage = 0;
        } else if (hoursUntilAppointment >= 24) {
          feePercentage = 50;
        } else {
          feePercentage = 100;
        }
        break;

      default:
        requiredHours = 24;
        feePercentage = 50;
    }
  }

  const feeAmount = (appointmentAmount * feePercentage) / 100;

  let reason: string;
  if (feePercentage === 0) {
    reason = 'Free cancellation';
  } else if (feePercentage === 100) {
    reason = `Full charge - less than ${requiredHours} hours notice`;
  } else {
    reason = `${feePercentage}% charge - less than ${requiredHours} hours notice`;
  }

  return {
    canCancel: true,
    feePercentage,
    feeAmount,
    reason,
  };
}

/**
 * Get policy description for display
 */
export function getPolicyDescription(policy: CancellationPolicy): {
  title: string;
  rules: string[];
} {
  switch (policy) {
    case 'FLEXIBLE':
      return {
        title: 'Flexible Cancellation',
        rules: [
          '✅ Cancel anytime with no fee',
          '✅ Full refund guaranteed',
        ],
      };

    case 'MODERATE':
      return {
        title: 'Moderate Cancellation',
        rules: [
          '✅ Free cancellation up to 12 hours before appointment',
          '⚠️ 50% fee if cancelled within 12 hours',
          '❌ 100% fee for no-shows',
        ],
      };

    case 'STANDARD':
      return {
        title: 'Standard Cancellation',
        rules: [
          '✅ Free cancellation up to 24 hours before appointment',
          '⚠️ 50% fee if cancelled within 24 hours',
          '❌ 100% fee for no-shows',
        ],
      };

    case 'STRICT':
      return {
        title: 'Strict Cancellation',
        rules: [
          '✅ Free cancellation up to 48 hours before appointment',
          '⚠️ 50% fee if cancelled 24-48 hours before',
          '❌ 100% fee if cancelled within 24 hours',
          '❌ 100% fee for no-shows',
        ],
      };

    default:
      return {
        title: 'Cancellation Policy',
        rules: ['Please contact provider for details'],
      };
  }
}
