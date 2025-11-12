'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, Clock, ChevronLeft, ChevronRight, Check, Loader2, MapPin, Star, Shield } from 'lucide-react';
import { mockProviders, mockServices, mockReviews } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

const DAYS_TO_SHOW = 14;

export default function MerchantBookingPage({ params }: { params: { providerId: string } }) {
  const provider = mockProviders.find(p => p.id === params.providerId);
  const providerServices = mockServices; // In production, filter by provider
  const providerReviews = mockReviews.filter(r => r.providerId === params.providerId);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select first service if only one available
  useEffect(() => {
    if (providerServices.length === 1 && !selectedService) {
      setSelectedService(providerServices[0].id);
    }
  }, [providerServices, selectedService]);

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">商户不存在</h1>
          <p className="text-neutral-600">无法找到此商户信息</p>
        </div>
      </div>
    );
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
    ? providerServices.find(s => s.id === selectedService)
    : null;

  const canProceed = selectedService && selectedDate && selectedTime;

  const handleBooking = async () => {
    if (!canProceed || !selectedServiceData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Calculate end time based on service duration
      const [timeValue, period] = selectedTime!.split(' ');
      const [hours, minutes] = timeValue.split(':').map(Number);
      let startHour = hours;
      if (period === 'PM' && hours !== 12) startHour += 12;
      if (period === 'AM' && hours === 12) startHour = 0;

      const startDate = new Date(selectedDate);
      startDate.setHours(startHour, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + selectedServiceData.duration);

      const endHour = endDate.getHours();
      const endMinute = endDate.getMinutes();
      const endPeriod = endHour >= 12 ? 'PM' : 'AM';
      const endDisplayHour = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour;
      const endTime = `${endDisplayHour}:${endMinute.toString().padStart(2, '0')} ${endPeriod}`;

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: provider.id,
          serviceId: selectedService,
          date: selectedDate.toISOString(),
          startTime: selectedTime,
          endTime: endTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Provider Header - Cleaner, more branded */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 shadow-xl">
              <Image
                src={provider.avatar}
                alt={provider.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold text-neutral-900">{provider.name}</h1>
                {provider.verified && (
                  <div className="bg-primary-100 p-1.5 rounded-full" title="Verified Provider">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                )}
              </div>

              <p className="text-lg text-neutral-600 mb-3">{provider.title}</p>

              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-neutral-900">{provider.rating}</span>
                  <span className="text-neutral-500">({provider.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-600">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location.city}, {provider.location.state}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-600">
                  <span>{provider.experience} years experience</span>
                </div>
              </div>

              {provider.bio && (
                <p className="text-neutral-600 mt-4 max-w-2xl">{provider.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Service */}
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-xl flex items-center justify-center font-semibold shadow-glow">
                  1
                </div>
                <h3 className="text-xl font-bold text-neutral-900">选择服务</h3>
              </div>

              <div className="space-y-3">
                {providerServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`relative border-2 rounded-xl p-4 text-left transition-all w-full ${
                      selectedService === service.id
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-neutral-200 hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    {selectedService === service.id && (
                      <div className="absolute top-4 right-4 w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-full flex items-center justify-center shadow-glow">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <h4 className="font-semibold text-neutral-900 mb-1 pr-10">{service.name}</h4>
                    <p className="text-sm text-neutral-600 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} 分钟</span>
                      </div>
                      <span className="font-bold text-lg gradient-text">{formatCurrency(service.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Date */}
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold shadow-glow ${
                  selectedService
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                    : 'bg-neutral-200 text-neutral-400'
                }`}>
                  2
                </div>
                <h3 className="text-xl font-bold text-neutral-900">选择日期</h3>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevWeek}
                  disabled={currentWeekStart === 0}
                  className="p-2 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-neutral-600">
                  {visibleDates[0]?.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextWeek}
                  disabled={currentWeekStart + 7 >= DAYS_TO_SHOW}
                  className="p-2 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-glow'
                          : isToday
                          ? 'border-2 border-primary-600 text-primary-600 font-semibold'
                          : 'border border-neutral-200 hover:border-primary-300 hover:shadow-sm'
                      } ${!selectedService && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold">
                        {date.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Select Time */}
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold shadow-glow ${
                  selectedService && selectedDate
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white'
                    : 'bg-neutral-200 text-neutral-400'
                }`}>
                  3
                </div>
                <h3 className="text-xl font-bold text-neutral-900">选择时间</h3>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  const isAvailable = Math.random() > 0.3; // Mock availability

                  return (
                    <button
                      key={time}
                      onClick={() => isAvailable && setSelectedTime(time)}
                      disabled={!selectedService || !selectedDate || !isAvailable}
                      className={`py-3 px-2 rounded-xl font-medium transition-all text-sm ${
                        isSelected
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-glow'
                          : isAvailable
                          ? 'border border-neutral-200 hover:border-primary-300 hover:shadow-sm text-neutral-700'
                          : 'border border-neutral-100 text-neutral-300 cursor-not-allowed line-through'
                      } ${(!selectedService || !selectedDate) && 'opacity-50'}`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="card-glass sticky top-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">预约详情</h3>

              <div className="space-y-4">
                {selectedServiceData ? (
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
                    <p className="text-xs text-neutral-600 mb-1">服务项目</p>
                    <p className="font-bold text-neutral-900">{selectedServiceData.name}</p>
                    <p className="text-sm text-neutral-600 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {selectedServiceData.duration} 分钟
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-neutral-50 rounded-xl text-center">
                    <p className="text-sm text-neutral-500">请选择服务</p>
                  </div>
                )}

                {selectedDate && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      日期
                    </p>
                    <p className="font-semibold text-neutral-900">
                      {selectedDate.toLocaleDateString('zh-CN', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {selectedTime && (
                  <div>
                    <p className="text-xs text-neutral-600 mb-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      时间
                    </p>
                    <p className="font-semibold text-neutral-900">{selectedTime}</p>
                  </div>
                )}

                {selectedServiceData && (
                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">总计</span>
                      <span className="text-3xl font-bold gradient-text">
                        {formatCurrency(selectedServiceData.price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!canProceed || isLoading}
                className={`w-full mt-6 ${
                  canProceed && !isLoading
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-4 rounded-xl font-bold hover:shadow-glow-lg transition-all'
                    : 'bg-neutral-200 text-neutral-400 px-6 py-4 rounded-xl font-medium cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    处理中...
                  </span>
                ) : (
                  '立即预约'
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center mt-3">
                在预约确认前不会收费
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {providerReviews.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">客户评价</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {providerReviews.slice(0, 4).map((review) => (
                <div key={review.id} className="card-glass">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center font-semibold text-primary-700">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{review.userName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-sm">{review.comment}</p>
                  {review.verified && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary-600">
                      <Check className="w-3 h-3" />
                      <span>已验证预约</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-neutral-200 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-neutral-600">
            Powered by <span className="font-semibold gradient-text">BeautyBook</span>
          </p>
        </div>
      </div>
    </div>
  );
}
