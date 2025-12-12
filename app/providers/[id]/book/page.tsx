'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface Provider {
  id: string;
  businessName: string;
  title: string;
  city: string;
  state: string;
  user?: {
    imageUrl?: string;
  };
  services?: Service[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const DAYS_TO_SHOW = 14;

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch provider data
  useEffect(() => {
    fetchProviderData();
  }, [params.id]);

  // Fetch availability when date or service changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate, selectedService]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/providers/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch provider');
      }

      setProvider(data.provider);
      setServices(data.provider?.services || []);
    } catch (err: any) {
      console.error('Failed to fetch provider:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      setLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/availability?providerId=${params.id}&date=${dateStr}&serviceId=${selectedService}`
      );
      const data = await response.json();

      if (response.ok && data.slots) {
        setTimeSlots(data.slots);
      } else {
        setTimeSlots([]);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!canProceed) return;

    try {
      setBooking(true);
      setBookingError(null);

      // First sync user to database
      await fetch('/api/users/sync', { method: 'POST' });

      // Create appointment
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: params.id,
          serviceId: selectedService,
          date: selectedDate.toISOString().split('T')[0],
          startTime: selectedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setBookingSuccess(true);

      // Redirect to confirmation after 2 seconds
      setTimeout(() => {
        router.push('/customer/appointments');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to book appointment:', err);
      setBookingError(err.message);
    } finally {
      setBooking(false);
    }
  };

  // Generate dates
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  const visibleDates = dates.slice(currentWeekStart, currentWeekStart + 7);

  const handlePrevWeek = () => {
    if (currentWeekStart > 0) {
      setCurrentWeekStart(currentWeekStart - 7);
    }
  };

  const handleNextWeek = () => {
    if (currentWeekStart + 7 < DAYS_TO_SHOW) {
      setCurrentWeekStart(currentWeekStart + 7);
    }
  };

  const isDateSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const selectedServiceData = selectedService
    ? services.find(s => s.id === selectedService)
    : null;

  const canProceed = selectedService && selectedDate && selectedTime;

  // Convert 24h time to 12h format for display
  const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-neutral-600">Loading booking page...</span>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Provider Not Found</h2>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Link href="/providers" className="btn-primary">
            Back to Providers
          </Link>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed!</h2>
          <p className="text-neutral-600 mb-4">
            Your appointment has been scheduled successfully.
          </p>
          <p className="text-sm text-neutral-500">Redirecting to your appointments...</p>
        </div>
      </div>
    );
  }

  const avatarUrl = provider.user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.businessName}`;

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href={`/providers/${params.id}`}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to provider
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Info */}
            <div className="card">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100">
                  <Image
                    src={avatarUrl}
                    alt={provider.businessName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">{provider.businessName}</h2>
                  <p className="text-neutral-600">{provider.title}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {provider.city}, {provider.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 1: Select Service */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Select Service</h3>
              </div>

              {services.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No services available</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service.id);
                        setSelectedTime(null);
                      }}
                      className={`relative border-2 rounded-xl p-4 text-left transition-all ${
                        selectedService === service.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      {selectedService === service.id && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <h4 className="font-semibold text-neutral-900 mb-1">{service.name}</h4>
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                        <span className="font-semibold text-primary-600">{formatCurrency(service.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Select Date */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  selectedService ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
                }`}>
                  2
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Select Date</h3>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevWeek}
                  disabled={currentWeekStart === 0}
                  className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextWeek}
                  disabled={currentWeekStart + 7 >= DAYS_TO_SHOW}
                  className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {visibleDates.map((date) => {
                  const isSelected = isDateSelected(date);
                  const isToday = date.toDateString() === today.toDateString();

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      disabled={!selectedService}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : isToday
                          ? 'border-2 border-primary-600 text-primary-600'
                          : 'border border-neutral-200 hover:border-primary-300'
                      } ${!selectedService && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold">
                        {date.getDate()}
                      </div>
                      <div className="text-xs">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Select Time */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  selectedService && selectedDate ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
                }`}>
                  3
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Select Time</h3>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="ml-2 text-neutral-600">Loading available times...</span>
                </div>
              ) : timeSlots.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  {selectedService && selectedDate
                    ? 'No available times for this date. Please select another date.'
                    : 'Please select a service and date first'}
                </p>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;

                    return (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-3 px-4 rounded-xl font-medium transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : slot.available
                            ? 'border border-neutral-200 hover:border-primary-300 text-neutral-700'
                            : 'border border-neutral-100 text-neutral-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {formatTimeSlot(slot.time)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Booking Summary</h3>

              <div className="space-y-4">
                {selectedServiceData && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Service</p>
                    <p className="font-semibold text-neutral-900">{selectedServiceData.name}</p>
                    <p className="text-sm text-neutral-600 mt-1">
                      {selectedServiceData.duration} minutes
                    </p>
                  </div>
                )}

                {selectedDate && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Date</p>
                    <p className="font-semibold text-neutral-900">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {selectedTime && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Time</p>
                    <p className="font-semibold text-neutral-900">{formatTimeSlot(selectedTime)}</p>
                  </div>
                )}

                {selectedServiceData && (
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Total</span>
                      <span className="text-2xl font-bold text-neutral-900">
                        {formatCurrency(selectedServiceData.price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {bookingError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {bookingError}
                </div>
              )}

              <button
                onClick={handleBookAppointment}
                disabled={!canProceed || booking}
                className={`w-full mt-6 ${
                  canProceed && !booking
                    ? 'btn-primary'
                    : 'bg-neutral-200 text-neutral-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed'
                }`}
              >
                {booking ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </span>
                ) : isSignedIn ? (
                  'Confirm Booking'
                ) : (
                  'Sign In to Book'
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                {isSignedIn
                  ? "You won't be charged until your appointment is confirmed"
                  : 'Please sign in to complete your booking'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
