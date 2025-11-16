'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, User, Mail, Phone, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const DAYS_TO_SHOW = 14;

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Provider {
  id: string;
  businessName: string;
  title: string;
  bio: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  imageUrl?: string;
  averageRating: number;
  reviewCount: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

export default function PublicBookingPage({ params }: { params: { providerSlug: string } }) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [step, setStep] = useState(1); // 1: Service, 2: Date/Time, 3: Contact Info, 4: Confirmation

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/providers/public/${params.providerSlug}`);

      if (!response.ok) {
        throw new Error('Provider not found');
      }

      const data = await response.json();
      setProvider(data.provider);
      setServices(data.services);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.providerSlug]);

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

  // Generate time slots (9 AM - 6 PM, 30 min intervals)
  const timeSlots: string[] = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const timeString = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
      timeSlots.push(timeString);
    }
  }

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

  const handleContinueToDateTime = () => {
    if (selectedService) {
      setStep(2);
    }
  };

  const handleContinueToContactInfo = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerInfo.firstName || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/booking/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerSlug: params.providerSlug,
          serviceId: selectedService,
          date: selectedDate.toISOString(),
          time: selectedTime,
          customerInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      setStep(4); // Show confirmation
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Provider Not Found</h2>
          <p className="text-neutral-600 mb-6">{error || 'The provider you are looking for does not exist.'}</p>
          <Link href="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (step === 4) {
    // Confirmation page
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">BeautyBook</h1>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Booking Request Submitted!</h2>
            <p className="text-neutral-600 mb-8">
              We&apos;ve sent a confirmation email to <strong>{customerInfo.email}</strong>.
              The provider will review your request and confirm your appointment shortly.
            </p>

            <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-neutral-900 mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-neutral-600">Provider</p>
                  <p className="font-medium text-neutral-900">{provider.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Service</p>
                  <p className="font-medium text-neutral-900">{selectedServiceData?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Date & Time</p>
                  <p className="font-medium text-neutral-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })} at {selectedTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total</p>
                  <p className="font-medium text-neutral-900">{formatCurrency(selectedServiceData?.price || 0)}</p>
                </div>
              </div>
            </div>

            <Link href="/" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Provider Info */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                  {provider.imageUrl ? (
                    <Image
                      src={provider.imageUrl}
                      alt={provider.businessName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
                      {provider.businessName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-neutral-900">{provider.businessName}</h2>
                  <p className="text-neutral-600">{provider.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-neutral-500">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.city}, {provider.state}</span>
                  </div>
                  {provider.averageRating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium text-neutral-900">
                        ⭐ {provider.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        ({provider.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
              }`}>
                1
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-600' : 'bg-neutral-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
              }`}>
                2
              </div>
              <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary-600' : 'bg-neutral-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step >= 3 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
              }`}>
                3
              </div>
            </div>

            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="card">
                <h3 className="text-xl font-bold text-neutral-900 mb-6">Select a Service</h3>

                {services.length === 0 ? (
                  <p className="text-neutral-600 text-center py-8">No services available at this time.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
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
                        <h4 className="font-semibold text-neutral-900 mb-1 pr-8">{service.name}</h4>
                        <p className="text-sm text-neutral-600 mb-3">{service.description}</p>
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

                <button
                  onClick={handleContinueToDateTime}
                  disabled={!selectedService}
                  className={`w-full mt-6 ${
                    selectedService
                      ? 'btn-primary'
                      : 'bg-neutral-200 text-neutral-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed'
                  }`}
                >
                  Continue to Date & Time
                </button>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <>
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-neutral-900">Select Date</h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Change Service
                    </button>
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
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : isToday
                              ? 'border-2 border-primary-600 text-primary-600'
                              : 'border border-neutral-200 hover:border-primary-300'
                          }`}
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

                <div className="card">
                  <h3 className="text-xl font-bold text-neutral-900 mb-6">Select Time</h3>

                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots.map((time) => {
                      const isSelected = selectedTime === time;
                      const isAvailable = Math.random() > 0.3; // Mock availability - replace with real data

                      return (
                        <button
                          key={time}
                          onClick={() => isAvailable && setSelectedTime(time)}
                          disabled={!isAvailable}
                          className={`py-3 px-4 rounded-xl font-medium transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white'
                              : isAvailable
                              ? 'border border-neutral-200 hover:border-primary-300 text-neutral-700'
                              : 'border border-neutral-100 text-neutral-300 cursor-not-allowed'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleContinueToContactInfo}
                    disabled={!selectedDate || !selectedTime}
                    className={`w-full mt-6 ${
                      selectedDate && selectedTime
                        ? 'btn-primary'
                        : 'bg-neutral-200 text-neutral-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed'
                    }`}
                  >
                    Continue to Contact Info
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-neutral-900">Your Information</h3>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Change Date/Time
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600"
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600"
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600"
                      rows={4}
                      placeholder="Any special requests or information for the provider..."
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting || !customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone}
                  className={`w-full mt-6 ${
                    !submitting && customerInfo.firstName && customerInfo.lastName && customerInfo.email && customerInfo.phone
                      ? 'btn-primary'
                      : 'bg-neutral-200 text-neutral-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>

                <p className="text-xs text-neutral-500 text-center mt-4">
                  By submitting, you agree to receive appointment confirmations and reminders via email and SMS
                </p>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
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

                {selectedDate && step >= 2 && (
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

                {selectedTime && step >= 2 && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Time</p>
                    <p className="font-semibold text-neutral-900">{selectedTime}</p>
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

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Your appointment will be confirmed by the provider. You&apos;ll receive a confirmation email once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
