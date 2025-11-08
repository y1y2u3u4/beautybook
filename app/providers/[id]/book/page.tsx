'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { mockProviders, mockServices } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

const DAYS_TO_SHOW = 14;

export default function BookingPage({ params }: { params: { id: string } }) {
  const provider = mockProviders.find(p => p.id === params.id);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  if (!provider) {
    return <div>Provider not found</div>;
  }

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
    ? mockServices.find(s => s.id === selectedService)
    : null;

  const canProceed = selectedService && selectedDate && selectedTime;

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
                    src={provider.avatar}
                    alt={provider.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">{provider.name}</h2>
                  <p className="text-neutral-600">{provider.title}</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {provider.location.city}, {provider.location.state}
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

              <div className="grid md:grid-cols-2 gap-4">
                {mockServices.map((service) => (
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
                    <h4 className="font-semibold text-neutral-900 mb-1">{service.name}</h4>
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
                      onClick={() => setSelectedDate(date)}
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

              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  const isAvailable = Math.random() > 0.3; // Mock availability

                  return (
                    <button
                      key={time}
                      onClick={() => isAvailable && setSelectedTime(time)}
                      disabled={!selectedService || !selectedDate || !isAvailable}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : isAvailable
                          ? 'border border-neutral-200 hover:border-primary-300 text-neutral-700'
                          : 'border border-neutral-100 text-neutral-300 cursor-not-allowed'
                      } ${(!selectedService || !selectedDate) && 'opacity-50'}`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
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

              <button
                disabled={!canProceed}
                className={`w-full mt-6 ${
                  canProceed
                    ? 'btn-primary'
                    : 'bg-neutral-200 text-neutral-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed'
                }`}
              >
                Continue to Checkout
              </button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                You won&apos;t be charged until your appointment is confirmed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
