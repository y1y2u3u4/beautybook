'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  Sparkles,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PastAppointment {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerRating: number;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;
  location: string;
}

interface QuickRebookProps {
  pastAppointments: PastAppointment[];
  onClose?: () => void;
}

export default function QuickRebook({ pastAppointments, onClose }: QuickRebookProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleRebook = async (appointment: PastAppointment) => {
    setIsLoading(appointment.id);
    // Navigate to booking page with pre-selected service
    router.push(`/providers/${appointment.providerId}/book?service=${encodeURIComponent(appointment.serviceName)}`);
  };

  if (pastAppointments.length === 0) {
    return null;
  }

  return (
    <div className="card-glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900">Quick Rebook</h3>
            <p className="text-sm text-neutral-500">Book again with one click</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {pastAppointments.slice(0, 3).map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group"
          >
            {/* Provider Avatar */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0">
              <Image
                src={appointment.providerAvatar}
                alt={appointment.providerName}
                fill
                className="object-cover"
              />
            </div>

            {/* Appointment Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-neutral-900 truncate">
                  {appointment.providerName}
                </h4>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-neutral-600">{appointment.providerRating}</span>
                </div>
              </div>
              <p className="text-sm text-neutral-600 truncate">{appointment.serviceName}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {appointment.serviceDuration} min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {appointment.location}
                </span>
              </div>
            </div>

            {/* Price & Rebook Button */}
            <div className="flex flex-col items-end gap-2">
              <span className="font-bold text-neutral-900">
                {formatCurrency(appointment.servicePrice)}
              </span>
              <button
                onClick={() => handleRebook(appointment)}
                disabled={isLoading === appointment.id}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {isLoading === appointment.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Rebook
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {pastAppointments.length > 3 && (
        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-primary-600 hover:text-primary-700 font-medium">
          View all past appointments
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Sample data for demonstration
export const samplePastAppointments: PastAppointment[] = [
  {
    id: '1',
    providerId: 'provider-1',
    providerName: 'Sarah Johnson',
    providerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    providerRating: 4.9,
    serviceName: 'Signature Facial',
    servicePrice: 120,
    serviceDuration: 60,
    date: '2024-01-15',
    location: 'Beverly Hills',
  },
  {
    id: '2',
    providerId: 'provider-2',
    providerName: 'Michael Chen',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    providerRating: 4.8,
    serviceName: 'Deep Tissue Massage',
    servicePrice: 150,
    serviceDuration: 90,
    date: '2024-01-10',
    location: 'Santa Monica',
  },
  {
    id: '3',
    providerId: 'provider-3',
    providerName: 'Emily Davis',
    providerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    providerRating: 5.0,
    serviceName: 'Hair Styling',
    servicePrice: 85,
    serviceDuration: 45,
    date: '2024-01-05',
    location: 'West Hollywood',
  },
];
