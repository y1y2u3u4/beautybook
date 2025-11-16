'use client';

import { useTestUser } from '@/hooks/useTestUser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Calendar, Clock, MapPin, User, DollarSign, Phone } from 'lucide-react';

export default function CustomerAppointments() {
  const { testUser, isTestMode } = useTestUser();
  const router = useRouter();

  useEffect(() => {
    if (!isTestMode || testUser?.role !== 'CUSTOMER') {
      router.push('/test-mode');
    }
  }, [isTestMode, testUser, router]);

  if (!testUser || testUser.role !== 'CUSTOMER') {
    return null;
  }

  const myAppointments = [
    {
      id: '1',
      provider: 'Sarah Johnson',
      businessName: 'Radiant Skin Clinic',
      service: 'Hydrating Facial',
      date: '2024-01-25',
      time: '2:00 PM',
      duration: 60,
      price: 150,
      status: 'confirmed',
      address: '123 Beauty Lane, Los Angeles, CA 90001',
      phone: '(310) 555-0123',
    },
    {
      id: '2',
      provider: 'Emily Rodriguez',
      businessName: 'Emily Rodriguez Hair Studio',
      service: 'Balayage',
      date: '2024-01-28',
      time: '10:00 AM',
      duration: 150,
      price: 300,
      status: 'confirmed',
      address: '456 Style Street, New York, NY 10001',
      phone: '(212) 555-0456',
    },
    {
      id: '3',
      provider: 'Sarah Johnson',
      businessName: 'Radiant Skin Clinic',
      service: 'Chemical Peel',
      date: '2024-01-15',
      time: '3:00 PM',
      duration: 45,
      price: 250,
      status: 'completed',
      address: '123 Beauty Lane, Los Angeles, CA 90001',
      phone: '(310) 555-0123',
    },
  ];

  const upcomingAppointments = myAppointments.filter(apt => apt.status === 'confirmed');
  const pastAppointments = myAppointments.filter(apt => apt.status === 'completed');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                My Appointments
              </h1>
              <p className="text-neutral-600 mt-1">
                View and manage your beauty appointments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/providers"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Book New Appointment
              </Link>
              <Link
                href="/"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            Upcoming Appointments ({upcomingAppointments.length})
          </h2>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="text-neutral-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                No upcoming appointments
              </h3>
              <p className="text-neutral-600 mb-6">
                Ready to book your next beauty treatment?
              </p>
              <Link
                href="/providers"
                className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse Providers
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                        {appointment.provider.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900">
                          {appointment.businessName}
                        </h3>
                        <p className="text-neutral-600">with {appointment.provider}</p>
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            Confirmed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 bg-neutral-50 rounded-lg p-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-neutral-700">
                        <Calendar className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold">Date:</span>
                        <span>{new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-700">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold">Time:</span>
                        <span>{appointment.time} ({appointment.duration} min)</span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-700">
                        <User className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold">Service:</span>
                        <span>{appointment.service}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-neutral-700">
                        <MapPin className="w-4 h-4 text-neutral-500 mt-1" />
                        <div>
                          <div className="font-semibold">Location:</div>
                          <div className="text-sm">{appointment.address}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-700">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold">Phone:</span>
                        <span>{appointment.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 text-neutral-700">
                        <DollarSign className="w-4 h-4 text-neutral-500" />
                        <span className="font-semibold">Price:</span>
                        <span className="text-green-600 font-bold">${appointment.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors">
                      Reschedule
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Past Appointments
            </h2>

            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 font-bold text-2xl">
                        {appointment.provider.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">
                              {appointment.businessName}
                            </h3>
                            <p className="text-neutral-600">
                              {appointment.service} • {new Date(appointment.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            Completed
                          </span>
                        </div>

                        <div className="mt-4">
                          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                            Leave a Review
                          </button>
                          <button className="ml-2 bg-neutral-200 text-neutral-700 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-300 transition-colors">
                            Book Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Mode Notice */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🧪</div>
            <div>
              <div className="font-bold text-yellow-900 mb-1">
                Test Mode - Customer Appointments
              </div>
              <p className="text-yellow-800 text-sm">
                These are sample appointments for testing. In a real environment, you would see your actual booked appointments here. Connect to a database to create and manage real appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
