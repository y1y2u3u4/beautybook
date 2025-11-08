# BeautyBook 前10个核心功能实施指南 (Part 2)
## 功能4-10详细实现

---

## ⭐ 功能4: 评价提交功能

### 4.1 评价提交页面

**app/bookings/[id]/review/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Upload, X } from 'lucide-react';

export default function WriteReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 评分
  const [ratings, setRatings] = useState({
    professionalSkills: 5,
    serviceAttitude: 5,
    environment: 5,
    valueForMoney: 5,
    satisfaction: 5,
  });

  // 评论
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [anonymous, setAnonymous] = useState(false);

  const tags = [
    '效果显著', '很专业', '环境好', '物有所值', '会再来',
    '准时', '细心', '技术好', '服务周到', '值得推荐'
  ];

  useEffect(() => {
    loadAppointment();
  }, []);

  const loadAppointment = async () => {
    const res = await fetch(`/api/bookings/${params.id}`);
    const data = await res.json();
    setAppointment(data);
    setLoading(false);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    // Upload to UploadThing or your storage
    // For now, just preview locally
    const previews = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    );
    setPhotos([...photos, ...previews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (comment.trim().length < 10) {
      alert('Please write at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 5;

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: params.id,
          providerId: appointment.providerId,
          rating: Math.round(overallRating),
          ratings,
          comment,
          photos,
          tags: selectedTags,
          anonymous,
        }),
      });

      if (res.ok) {
        alert('Review submitted successfully!');
        router.push('/dashboard/reviews');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Write a Review</h1>

      {/* Appointment Info */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={appointment.provider.user.imageUrl}
            alt={appointment.provider.businessName}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">{appointment.provider.businessName}</h2>
            <p className="text-gray-600">{appointment.service.name}</p>
            <p className="text-sm text-gray-500">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.startTime}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Multi-Dimensional Ratings */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Rate Your Experience</h3>

          <div className="space-y-4">
            {[
              { key: 'professionalSkills', label: 'Professional Skills' },
              { key: 'serviceAttitude', label: 'Service Attitude' },
              { key: 'environment', label: 'Environment & Hygiene' },
              { key: 'valueForMoney', label: 'Value for Money' },
              { key: 'satisfaction', label: 'Overall Satisfaction' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings({ ...ratings, [item.key]: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= ratings[item.key]
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Rating Display */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Overall Rating</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {(Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)}
                </span>
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Written Review */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Your Review</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input-field w-full h-40"
            placeholder="Share your experience... (minimum 10 characters)"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            {comment.length} characters (minimum 10)
          </p>
        </div>

        {/* Photo Upload */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4">Add Photos (Optional)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload before and after photos to help others
          </p>

          <div className="grid grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {photos.length < 6 && (
              <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Anonymous Option */}
        <div className="card p-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mr-3"
            />
            <div>
              <p className="font-medium">Post Anonymously</p>
              <p className="text-sm text-gray-600">
                Your name will be hidden from public view
              </p>
            </div>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### 4.2 评价API

**app/api/reviews/route.ts**
```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { appointmentId, providerId, rating, ratings, comment, photos, tags, anonymous } = data;

  // Get user
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify appointment belongs to user and is completed
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.customerId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (appointment.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Cannot review incomplete appointment' }, { status: 400 });
  }

  // Check if review already exists
  const existingReview = await prisma.review.findFirst({
    where: {
      customerId: user.id,
      providerId,
      appointmentId,
    },
  });

  if (existingReview) {
    return NextResponse.json({ error: 'Review already exists' }, { status: 400 });
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      customerId: user.id,
      providerId,
      appointmentId,
      rating,
      ratings,
      comment,
      photos,
      tags,
      anonymous,
      verified: true, // Auto-verify since linked to appointment
    },
  });

  // Update provider average rating
  const allReviews = await prisma.review.findMany({
    where: { providerId },
  });

  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      averageRating: avgRating,
      reviewCount: allReviews.length,
    },
  });

  // Give user reward points (if implemented)
  // await rewardPoints(user.id, 100);

  return NextResponse.json(review, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json({ error: 'Provider ID required' }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { providerId },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}
```

---

## 🔔 功能5: 通知系统

### 5.1 通知服务

**lib/notifications.ts**
```typescript
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface NotificationData {
  email?: string;
  phone?: string;
  userName: string;
  providerName: string;
  serviceName: string;
  date: string;
  time: string;
  amount?: number;
  bookingId?: string;
  cancellationUrl?: string;
}

// Email Templates
export async function sendBookingConfirmation(appointment: any) {
  const customer = appointment.customer;
  const provider = appointment.provider;
  const service = appointment.service;

  const emailData = {
    email: customer.email,
    userName: `${customer.firstName} ${customer.lastName}`,
    providerName: provider.businessName,
    serviceName: service.name,
    date: new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: appointment.startTime,
    amount: appointment.amount,
    bookingId: appointment.id,
  };

  // Send Email
  await sendEmail({
    to: customer.email,
    subject: 'Booking Confirmed - BeautyBook',
    template: 'booking-confirmation',
    data: emailData,
  });

  // Send SMS
  if (customer.customerProfile?.phone) {
    await sendSMS({
      to: customer.customerProfile.phone,
      message: `Hi ${customer.firstName}! Your appointment with ${provider.businessName} for ${service.name} on ${emailData.date} at ${appointment.startTime} has been confirmed. Booking ID: ${appointment.id}`,
    });
  }
}

export async function sendBookingReminder(appointment: any, hoursBefore: number) {
  const customer = appointment.customer;
  const provider = appointment.provider;
  const service = appointment.service;

  const message =
    hoursBefore === 24
      ? `Reminder: You have an appointment tomorrow at ${appointment.startTime} with ${provider.businessName}. ${provider.address}, ${provider.city}. See you there!`
      : `Your appointment with ${provider.businessName} is in ${hoursBefore} hour(s) at ${appointment.startTime}. ${provider.address}, ${provider.city}.`;

  // Send Email
  await sendEmail({
    to: customer.email,
    subject: `Reminder: Appointment ${hoursBefore}h away`,
    template: 'appointment-reminder',
    data: {
      userName: `${customer.firstName} ${customer.lastName}`,
      providerName: provider.businessName,
      serviceName: service.name,
      date: new Date(appointment.date).toLocaleDateString(),
      time: appointment.startTime,
      address: `${provider.address}, ${provider.city}, ${provider.state}`,
      hoursBefore,
    },
  });

  // Send SMS
  if (customer.customerProfile?.phone) {
    await sendSMS({
      to: customer.customerProfile.phone,
      message,
    });
  }
}

export async function sendReviewRequest(appointment: any) {
  const customer = appointment.customer;
  const provider = appointment.provider;

  await sendEmail({
    to: customer.email,
    subject: 'How was your appointment? Leave a review',
    template: 'review-request',
    data: {
      userName: `${customer.firstName} ${customer.lastName}`,
      providerName: provider.businessName,
      serviceName: appointment.service.name,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${appointment.id}/review`,
    },
  });
}

// Email sending helper
async function sendEmail({ to, subject, template, data }: any) {
  try {
    const html = generateEmailHTML(template, data);

    await sgMail.send({
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!,
      },
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// SMS sending helper
async function sendSMS({ to, message }: { to: string; message: string }) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

// Email HTML generator (simplified - use a proper template engine)
function generateEmailHTML(template: string, data: any): string {
  const templates = {
    'booking-confirmation': `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ec4899; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Great news! Your appointment has been confirmed.</p>

              <div class="info-box">
                <h3>Appointment Details</h3>
                <p><strong>Provider:</strong> ${data.providerName}</p>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Time:</strong> ${data.time}</p>
                <p><strong>Amount:</strong> $${data.amount?.toFixed(2)}</p>
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
              </div>

              <p>We'll send you a reminder 24 hours before your appointment.</p>

              <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${data.bookingId}" class="button">
                View Booking Details
              </a>

              <p>Need to make changes? You can reschedule or cancel up to 24 hours before your appointment.</p>
            </div>
            <div class="footer">
              <p>BeautyBook - Your Beauty, Our Priority</p>
              <p>Questions? Contact us at support@beautybook.com</p>
            </div>
          </div>
        </body>
      </html>
    `,

    'appointment-reminder': `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Appointment Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>This is a friendly reminder about your upcoming appointment ${data.hoursBefore === 24 ? 'tomorrow' : 'today'}.</p>

              <div class="info-box">
                <p><strong>Provider:</strong> ${data.providerName}</p>
                <p><strong>Service:</strong> ${data.serviceName}</p>
                <p><strong>Date & Time:</strong> ${data.date} at ${data.time}</p>
                <p><strong>Location:</strong> ${data.address}</p>
              </div>

              <p>Please arrive 10 minutes early. See you there! 😊</p>
            </div>
          </div>
        </body>
      </html>
    `,

    'review-request': `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="container">
            <div class="header">
              <h1>⭐ How was your experience?</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Thank you for choosing ${data.providerName} for your ${data.serviceName}!</p>
              <p>We'd love to hear about your experience. Your feedback helps other customers make informed decisions.</p>

              <a href="${data.reviewUrl}" class="button">
                Write a Review
              </a>

              <p><small>As a thank you, you'll earn 100 reward points for your review!</small></p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  return templates[template] || '';
}
```

### 5.2 通知任务队列

**lib/jobs/notification-jobs.ts**
```typescript
import Bull from 'bull';
import { prisma } from '@/lib/prisma';
import {
  sendBookingConfirmation,
  sendBookingReminder,
  sendReviewRequest,
} from '@/lib/notifications';

// Create queue
const notificationQueue = new Bull('notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Process notification jobs
notificationQueue.process(async (job) => {
  const { type, appointmentId } = job.data;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customer: { include: { customerProfile: true } },
      provider: { include: { user: true } },
      service: true,
    },
  });

  if (!appointment) {
    throw new Error(`Appointment ${appointmentId} not found`);
  }

  switch (type) {
    case 'booking-confirmation':
      await sendBookingConfirmation(appointment);
      break;

    case 'reminder-24h':
      await sendBookingReminder(appointment, 24);
      break;

    case 'reminder-2h':
      await sendBookingReminder(appointment, 2);
      break;

    case 'review-request':
      await sendReviewRequest(appointment);
      break;

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
});

// Schedule notifications
export async function scheduleBookingNotifications(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) return;

  const appointmentDate = new Date(appointment.date);
  const [hours, minutes] = appointment.startTime.split(':');
  appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Confirmation (immediate)
  await notificationQueue.add(
    { type: 'booking-confirmation', appointmentId },
    { attempts: 3, backoff: 5000 }
  );

  // 24-hour reminder
  const reminder24h = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
  if (reminder24h > new Date()) {
    await notificationQueue.add(
      { type: 'reminder-24h', appointmentId },
      { delay: reminder24h.getTime() - Date.now(), attempts: 3 }
    );
  }

  // 2-hour reminder
  const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
  if (reminder2h > new Date()) {
    await notificationQueue.add(
      { type: 'reminder-2h', appointmentId },
      { delay: reminder2h.getTime() - Date.now(), attempts: 3 }
    );
  }

  // Review request (2 hours after appointment)
  const reviewRequest = new Date(
    appointmentDate.getTime() +
      (appointment.service.duration + 120) * 60 * 1000
  );
  await notificationQueue.add(
    { type: 'review-request', appointmentId },
    { delay: reviewRequest.getTime() - Date.now(), attempts: 3 }
  );
}

export { notificationQueue };
```

---

## 🏪 功能6: 商户入驻与认证

### 6.1 商户注册页面

**app/provider/onboarding/page.tsx**
```typescript
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Upload, Check } from 'lucide-react';

export default function ProviderOnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    businessName: '',
    title: '',
    bio: '',
    phone: '',

    // Location
    address: '',
    city: '',
    state: '',
    zipCode: '',

    // Professional Info
    experience: 0,
    languages: [],
    specialties: [],

    // Pricing
    priceMin: '',
    priceMax: '',

    // Documents
    businessLicense: null,
    certifications: [],

    // Bank Account
    bankAccountNumber: '',
    routingNumber: '',
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/provider/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Application submitted! We will review and get back to you within 2-3 business days.');
        router.push('/provider/pending');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information' },
    { number: 2, title: 'Professional Details' },
    { number: 3, title: 'Verification Documents' },
    { number: 4, title: 'Payment Setup' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step > s.number
                        ? 'bg-green-500 text-white'
                        : step === s.number
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > s.number ? <Check size={20} /> : s.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        step > s.number ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <p className="text-sm mt-2 text-center">{s.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="card p-8">
          {step === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
          {step === 2 && <Step2Professional formData={formData} setFormData={setFormData} />}
          {step === 3 && <Step3Documents formData={formData} setFormData={setFormData} />}
          {step === 4 && <Step4Payment formData={formData} setFormData={setFormData} />}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                Previous
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary ml-auto"
              >
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary ml-auto">
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components (simplified for brevity)
function Step1BasicInfo({ formData, setFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Business Name *</label>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="input-field w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Professional Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="input-field w-full"
          placeholder="e.g., Licensed Aesthetician, Master Hair Stylist"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio *</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="input-field w-full h-32"
          placeholder="Tell us about your expertise and experience..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Years of Experience *</label>
          <input
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
            className="input-field w-full"
            min="0"
            required
          />
        </div>
      </div>

      {/* Address fields... */}
    </div>
  );
}

function Step2Professional({ formData, setFormData }) {
  // Specialties, languages, pricing
  return <div>Step 2 Content</div>;
}

function Step3Documents({ formData, setFormData }) {
  // Document uploads
  return <div>Step 3 Content</div>;
}

function Step4Payment({ formData, setFormData }) {
  // Bank account info
  return <div>Step 4 Content</div>;
}
```

---

由于响应长度限制，我将创建一个汇总文档和实施检查清单：
