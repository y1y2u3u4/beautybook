# BeautyBook 前10个核心功能实施指南
## P0 级功能完整实现方案

---

## 📋 目录

1. [概述](#概述)
2. [技术准备](#技术准备)
3. [功能1: 用户认证系统](#功能1-用户认证系统)
4. [功能2: 完整的预约流程](#功能2-完整的预约流程)
5. [功能3: 用户个人中心](#功能3-用户个人中心)
6. [功能4: 评价提交功能](#功能4-评价提交功能)
7. [功能5: 通知系统](#功能5-通知系统)
8. [功能6: 商户入驻与认证](#功能6-商户入驻与认证)
9. [功能7: 预约管理中心](#功能7-预约管理中心)
10. [功能8: 客户管理系统](#功能8-客户管理系统)
11. [功能9: 营业时间与排班](#功能9-营业时间与排班)
12. [功能10: 商户通知与消息](#功能10-商户通知与消息)
13. [测试与部署](#测试与部署)

---

## 🎯 概述

### 实施目标

在 **8 周内** 完成 BeautyBook 核心业务闭环，实现：
- ✅ 用户可以注册、登录、预约、支付
- ✅ 商户可以入驻、管理预约、管理客户
- ✅ 平台可以运营、收取佣金、监控数据

### 时间规划

```
Week 1-2: 认证 + 支付基础
Week 3-4: 预约流程 + 用户中心
Week 5-6: 商户功能 + CRM
Week 7-8: 通知 + 测试优化
```

### 预期成果

- 📈 注册转化率: +60%
- 💰 预约完成率: +80%
- 👥 用户留存率: +40%
- 🏪 商户运营效率: +70%

---

## 🛠️ 技术准备

### 1. 依赖安装

```bash
# 认证
npm install @clerk/nextjs

# 支付
npm install stripe @stripe/stripe-js

# 通知
npm install @sendgrid/mail twilio

# 文件上传
npm install uploadthing @uploadthing/react

# 表单验证
npm install react-hook-form zod @hookform/resolvers

# 日期处理
npm install date-fns

# 实时通信
npm install socket.io socket.io-client

# 任务队列
npm install bull bullmq ioredis

# 工具库
npm install lodash nanoid
```

### 2. 环境变量配置

```env
# .env.local

# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Stripe 支付
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid 邮件
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@beautybook.com
SENDGRID_FROM_NAME=BeautyBook

# Twilio 短信
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# UploadThing 文件上传
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Redis（任务队列）
REDIS_URL=redis://localhost:6379

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_RATE=0.10
```

### 3. 数据库迁移准备

```bash
# 生成 Prisma Client
npx prisma generate

# 创建迁移
npx prisma migrate dev --name init

# 查看数据库
npx prisma studio
```

---

## 🔐 功能1: 用户认证系统

### 1.1 Clerk 配置

**middleware.ts**
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/providers",
    "/providers/(.*)",
    "/api/webhooks/(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
  ignoredRoutes: [
    "/api/webhooks/clerk",
    "/api/webhooks/stripe",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**app/layout.tsx**
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 1.2 用户同步 Webhook

**app/api/webhooks/clerk/route.ts**
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', { status: 400 });
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    // Create user in database
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        role: 'CUSTOMER',
      },
    });

    console.log(`User created: ${id}`);
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await prisma.user.update({
      where: { clerkId: id },
      data: {
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      },
    });

    console.log(`User updated: ${id}`);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    await prisma.user.delete({
      where: { clerkId: id },
    });

    console.log(`User deleted: ${id}`);
  }

  return new Response('Webhook received', { status: 200 });
}
```

### 1.3 认证页面

**app/sign-in/[[...sign-in]]/page.tsx**
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
          },
        }}
      />
    </div>
  );
}
```

**app/sign-up/[[...sign-up]]/page.tsx**
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
          },
        }}
      />
    </div>
  );
}
```

### 1.4 用户资料管理

**app/profile/page.tsx**
```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await fetch('/api/profile');
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  };

  const handleUpdate = async (formData: any) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      alert('Profile updated successfully!');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || 'User'}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>

        <ProfileForm profile={profile} onSubmit={handleUpdate} />
      </div>
    </div>
  );
}

function ProfileForm({ profile, onSubmit }) {
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    dateOfBirth: profile?.dateOfBirth || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: profile?.zipCode || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field w-full"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="input-field w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="input-field w-full"
          placeholder="123 Main St"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="input-field w-full"
          >
            <option value="">Select...</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
            {/* Add all states */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            className="input-field w-full"
            placeholder="12345"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary">
        Save Changes
      </button>
    </form>
  );
}
```

**app/api/profile/route.ts**
```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { customerProfile: true },
  });

  return NextResponse.json(user?.customerProfile || {});
}

export async function PUT(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const profile = await prisma.customerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
    },
    update: data,
  });

  return NextResponse.json(profile);
}
```

---

## 💳 功能2: 完整的预约流程

### 2.1 Stripe 配置

**lib/stripe.ts**
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

### 2.2 预约确认页面

**app/providers/[id]/book/confirm/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ConfirmBookingPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [booking, setBooking] = useState({
    serviceId: searchParams.get('serviceId'),
    date: searchParams.get('date'),
    time: searchParams.get('time'),
  });

  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [paymentType, setPaymentType] = useState('full'); // 'deposit' or 'full'
  const [notes, setNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    // Load service and provider details
    const [serviceRes, providerRes] = await Promise.all([
      fetch(`/api/services/${booking.serviceId}`),
      fetch(`/api/providers/${params.id}`),
    ]);

    const serviceData = await serviceRes.json();
    const providerData = await providerRes.json();

    setService(serviceData);
    setProvider(providerData);
  };

  const handleCheckout = async () => {
    if (!acceptedTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/bookings/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: params.id,
          serviceId: booking.serviceId,
          date: booking.date,
          time: booking.time,
          paymentType,
          notes,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe error:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!service || !provider) {
    return <div>Loading...</div>;
  }

  const depositAmount = service.price * 0.2; // 20% deposit
  const fullAmount = service.price;
  const amount = paymentType === 'deposit' ? depositAmount : fullAmount;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Confirm Your Booking</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Booking Details */}
        <div className="col-span-2 space-y-6">
          {/* Provider Info */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Provider</h2>
            <div className="flex items-center gap-4">
              <img
                src={provider.user.imageUrl}
                alt={provider.businessName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{provider.businessName}</h3>
                <p className="text-sm text-gray-600">{provider.title}</p>
                <p className="text-sm text-gray-600">
                  {provider.address}, {provider.city}, {provider.state}
                </p>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Service Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">{booking.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{service.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-lg">${service.price}</span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentType === 'full'}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-semibold">Pay Full Amount</p>
                  <p className="text-sm text-gray-600">${fullAmount.toFixed(2)}</p>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="deposit"
                  checked={paymentType === 'deposit'}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-semibold">Pay Deposit (20%)</p>
                  <p className="text-sm text-gray-600">
                    ${depositAmount.toFixed(2)} now, ${(fullAmount - depositAmount).toFixed(2)} at appointment
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Special Requests */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Special Requests</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full h-32"
              placeholder="Any special requests or notes for the provider..."
            />
          </div>

          {/* Terms */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Cancellation Policy</h2>
            <div className="text-sm text-gray-600 space-y-2 mb-4">
              <p>
                • Free cancellation up to 24 hours before the appointment
              </p>
              <p>
                • Cancellations within 24 hours: 50% refund
              </p>
              <p>
                • No-show: No refund
              </p>
            </div>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">
                I agree to the <a href="/terms" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>, and I understand the cancellation policy.
              </span>
            </label>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="col-span-1">
          <div className="card p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service</span>
                <span>${service.price.toFixed(2)}</span>
              </div>

              {paymentType === 'deposit' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deposit (20%)</span>
                    <span>-${(fullAmount - depositAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Due at appointment</span>
                    <span>${(fullAmount - depositAmount).toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Due Now</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !acceptedTerms}
              className="btn-primary w-full"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 创建支付会话 API

**app/api/bookings/create-payment-intent/route.ts**
```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { providerId, serviceId, date, time, paymentType, notes } = await req.json();

  // Get user
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get service details
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { provider: true },
  });

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }

  // Calculate amount
  const fullAmount = service.price;
  const depositAmount = fullAmount * 0.2;
  const amount = paymentType === 'deposit' ? depositAmount : fullAmount;

  // Calculate end time
  const [hours, minutes] = time.split(':');
  const startDate = new Date(date);
  startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + service.duration);

  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

  // Create appointment (pending payment)
  const appointment = await prisma.appointment.create({
    data: {
      customerId: user.id,
      providerId,
      serviceId,
      date: new Date(date),
      startTime: time,
      endTime,
      amount: fullAmount,
      paymentStatus: 'PENDING',
      status: 'SCHEDULED',
      notes,
    },
  });

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.name,
            description: `${service.provider.businessName} - ${date} at ${time}`,
            images: [service.provider.user.imageUrl || ''],
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment.id,
      userId: user.id,
      providerId,
      paymentType,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${appointment.id}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/providers/${providerId}/book?canceled=true`,
  });

  return NextResponse.json({ sessionId: session.id, appointmentId: appointment.id });
}
```

### 2.4 Stripe Webhook 处理

**app/api/webhooks/stripe/route.ts**
```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/notifications';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { appointmentId, paymentType } = session.metadata;

    // Update appointment
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: 'PAID',
        paymentId: session.payment_intent as string,
      },
    });

    // Send confirmation email/SMS
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        provider: { include: { user: true } },
        service: true,
      },
    });

    if (appointment) {
      await sendBookingConfirmation(appointment);
    }

    console.log(`Payment successful for appointment ${appointmentId}`);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    // Find appointment by payment intent
    const appointment = await prisma.appointment.findFirst({
      where: { paymentId: paymentIntent.id },
    });

    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });
    }

    console.log(`Payment failed for payment intent ${paymentIntent.id}`);
  }

  return NextResponse.json({ received: true });
}
```

### 2.5 预约成功页面

**app/bookings/[id]/success/page.tsx**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Calendar, MapPin, Clock } from 'lucide-react';

export default function BookingSuccessPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    const res = await fetch(`/api/bookings/${params.id}`);
    const data = await res.json();
    setBooking(data);
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your appointment has been successfully booked
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="card p-8 mb-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <img
              src={booking.provider.user.imageUrl}
              alt={booking.provider.businessName}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{booking.provider.businessName}</h2>
              <p className="text-gray-600">{booking.service.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-gray-600">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-600">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-gray-600">
                  {booking.provider.address}
                  <br />
                  {booking.provider.city}, {booking.provider.state} {booking.provider.zipCode}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-gray-600">{booking.service.duration} minutes</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Paid</span>
              <span>${booking.amount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Booking ID: {booking.id}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                A confirmation email has been sent to your email address
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                You'll receive a reminder 24 hours before your appointment
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                You can manage your booking from your dashboard
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="btn-primary flex-1 text-center">
            Go to Dashboard
          </Link>
          <Link href="/providers" className="btn-secondary flex-1 text-center">
            Browse More Services
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 👤 功能3: 用户个人中心

### 3.1 个人中心布局

**app/dashboard/layout.tsx**
```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Heart, Star, CreditCard, User, Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  const navigation = [
    { name: 'My Appointments', href: '/dashboard', icon: Calendar },
    { name: 'Saved Providers', href: '/dashboard/favorites', icon: Heart },
    { name: 'My Reviews', href: '/dashboard/reviews', icon: Star },
    { name: 'Payment Methods', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="card p-6">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || 'User'}
                  className="w-24 h-24 rounded-full mb-3"
                />
                <h2 className="text-xl font-semibold text-center">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={20} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

### 3.2 我的预约

**app/dashboard/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function MyAppointmentsPage() {
  const [tab, setTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [tab]);

  const loadAppointments = async () => {
    setLoading(true);
    const res = await fetch(`/api/bookings?status=${tab}`);
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    const res = await fetch(`/api/bookings/${id}/cancel`, {
      method: 'POST',
    });

    if (res.ok) {
      loadAppointments();
      alert('Appointment cancelled successfully');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            tab === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            tab === 'past'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setTab('cancelled')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            tab === 'cancelled'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div>Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No {tab} appointments
          </h3>
          <p className="text-gray-600 mb-6">
            {tab === 'upcoming'
              ? "You don't have any upcoming appointments"
              : tab === 'past'
              ? "You don't have any past appointments"
              : "You don't have any cancelled appointments"}
          </p>
          {tab === 'upcoming' && (
            <Link href="/providers" className="btn-primary inline-block">
              Book an Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment, onCancel }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const canCancel = () => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const hoursUntil = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil > 24 && appointment.status !== 'CANCELLED';
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-6">
        {/* Provider Image */}
        <img
          src={appointment.provider.user.imageUrl}
          alt={appointment.provider.businessName}
          className="w-24 h-24 rounded-lg object-cover"
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                {appointment.provider.businessName}
              </h3>
              <p className="text-gray-600">{appointment.service.name}</p>
            </div>

            {/* Status Badge */}
            <span
              className={`badge ${
                appointment.status === 'COMPLETED'
                  ? 'badge-green'
                  : appointment.status === 'CANCELLED'
                  ? 'badge-red'
                  : appointment.status === 'CONFIRMED'
                  ? 'badge-blue'
                  : 'badge-yellow'
              }`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={16} />
              {new Date(appointment.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              {appointment.startTime} - {appointment.endTime}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} />
              {appointment.provider.city}, {appointment.provider.state}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-semibold">${appointment.amount.toFixed(2)}</p>
            </div>

            <div className="flex gap-2">
              {appointment.status === 'COMPLETED' && !appointment.review && (
                <Link
                  href={`/bookings/${appointment.id}/review`}
                  className="btn-secondary"
                >
                  Write Review
                </Link>
              )}

              {canCancel() && (
                <button
                  onClick={() => onCancel(appointment.id)}
                  className="btn-secondary text-red-600 hover:bg-red-50"
                >
                  Cancel Booking
                </button>
              )}

              <Link
                href={`/bookings/${appointment.id}`}
                className="btn-primary"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 收藏的商家

**app/dashboard/favorites/page.tsx**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Heart, Star, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const res = await fetch('/api/favorites');
    const data = await res.json();
    setFavorites(data);
    setLoading(false);
  };

  const handleRemoveFavorite = async (providerId: string) => {
    const res = await fetch(`/api/favorites/${providerId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setFavorites(favorites.filter((f) => f.provider.id !== providerId));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Saved Providers</h1>

      {favorites.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No saved providers yet
          </h3>
          <p className="text-gray-600 mb-6">
            Save your favorite providers for easy booking later
          </p>
          <Link href="/providers" className="btn-primary inline-block">
            Browse Providers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {favorites.map((favorite) => (
            <ProviderCard
              key={favorite.id}
              provider={favorite.provider}
              onRemove={() => handleRemoveFavorite(favorite.provider.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderCard({ provider, onRemove }) {
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <img
          src={provider.user.imageUrl}
          alt={provider.businessName}
          className="w-20 h-20 rounded-full"
        />
        <button
          onClick={onRemove}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-1">{provider.businessName}</h3>
      <p className="text-sm text-gray-600 mb-3">{provider.title}</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{provider.averageRating.toFixed(1)}</span>
          <span className="text-sm text-gray-600">({provider.reviewCount})</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          {provider.city}, {provider.state}
        </div>
      </div>

      <Link href={`/providers/${provider.id}`} className="btn-primary w-full text-center">
        View Profile
      </Link>
    </div>
  );
}
```

---

由于响应长度限制，我将继续创建剩余功能的实现代码。让我继续完成这个文档...
