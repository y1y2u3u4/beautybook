/**
 * Mock Database for local development and testing
 * Used when the real database is not available
 */

// Mock Users
export const mockUsers = [
  {
    id: 'user_001',
    clerkId: 'user_test_customer_001',
    email: 'customer@test.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'CUSTOMER' as const,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user_002',
    clerkId: 'user_test_customer_002',
    email: 'mike@test.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    role: 'CUSTOMER' as const,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'user_provider_001',
    clerkId: 'user_test_provider_001',
    email: 'emma@beautysalon.com',
    firstName: 'Emma',
    lastName: 'Davis',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    role: 'PROVIDER' as const,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user_provider_002',
    clerkId: 'user_test_provider_002',
    email: 'james@hairmaster.com',
    firstName: 'James',
    lastName: 'Chen',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    role: 'PROVIDER' as const,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user_provider_003',
    clerkId: 'user_test_provider_003',
    email: 'lisa@nailart.com',
    firstName: 'Lisa',
    lastName: 'Martinez',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    role: 'PROVIDER' as const,
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Provider Profiles
export const mockProviders = [
  {
    id: 'provider_001',
    userId: 'user_provider_001',
    businessName: 'Glow Beauty Studio',
    title: 'Licensed Esthetician & Makeup Artist',
    bio: 'With over 10 years of experience in skincare and beauty, I specialize in creating personalized facial treatments and stunning makeup looks. My passion is helping clients feel confident and beautiful in their own skin.',
    phone: '+1-555-1001',
    verified: true,
    address: '100 Beauty Lane',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90012',
    latitude: 34.0522,
    longitude: -118.2437,
    experience: 10,
    languages: ['English', 'Spanish'],
    specialties: ['Facial Treatment', 'Makeup Artistry', 'Skincare Consultation'],
    priceMin: 50,
    priceMax: 250,
    insuranceAccepted: ['BlueCross', 'Aetna'],
    averageRating: 4.9,
    reviewCount: 127,
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '20:00' },
      friday: { open: '09:00', close: '20:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: null,
    },
    user: mockUsers.find(u => u.id === 'user_provider_001'),
  },
  {
    id: 'provider_002',
    userId: 'user_provider_002',
    businessName: 'James Hair Master',
    title: 'Master Hair Stylist',
    bio: 'Award-winning hair stylist with expertise in cutting, coloring, and styling. I believe that great hair can transform not just your look, but your confidence. Let me help you discover your perfect style.',
    phone: '+1-555-1002',
    verified: true,
    address: '200 Style Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90015',
    latitude: 34.0407,
    longitude: -118.2468,
    experience: 15,
    languages: ['English', 'Mandarin'],
    specialties: ['Hair Cutting', 'Hair Coloring', 'Hair Styling', 'Balayage'],
    priceMin: 40,
    priceMax: 300,
    insuranceAccepted: [],
    averageRating: 4.8,
    reviewCount: 89,
    businessHours: {
      monday: null,
      tuesday: { open: '10:00', close: '19:00' },
      wednesday: { open: '10:00', close: '19:00' },
      thursday: { open: '10:00', close: '19:00' },
      friday: { open: '10:00', close: '20:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '11:00', close: '16:00' },
    },
    user: mockUsers.find(u => u.id === 'user_provider_002'),
  },
  {
    id: 'provider_003',
    userId: 'user_provider_003',
    businessName: 'Nail Art Paradise',
    title: 'Certified Nail Technician',
    bio: 'Passionate nail artist specializing in creative nail designs, gel extensions, and luxurious manicure/pedicure services. Every nail is a tiny canvas waiting to be transformed into art!',
    phone: '+1-555-1003',
    verified: true,
    address: '300 Nail Avenue',
    city: 'Santa Monica',
    state: 'CA',
    zipCode: '90401',
    latitude: 34.0195,
    longitude: -118.4912,
    experience: 8,
    languages: ['English', 'Spanish', 'Portuguese'],
    specialties: ['Manicure', 'Pedicure', 'Nail Art', 'Gel Extensions'],
    priceMin: 25,
    priceMax: 150,
    insuranceAccepted: [],
    averageRating: 4.7,
    reviewCount: 156,
    businessHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '19:00' },
      saturday: { open: '10:00', close: '17:00' },
      sunday: { open: '11:00', close: '16:00' },
    },
    user: mockUsers.find(u => u.id === 'user_provider_003'),
  },
];

// Mock Services
export const mockServices = [
  // Provider 1 services (Beauty Studio)
  {
    id: 'service_001',
    providerId: 'provider_001',
    name: 'Classic Facial',
    description: 'A relaxing facial treatment that cleanses, exfoliates, and hydrates your skin. Perfect for maintaining healthy, glowing skin.',
    duration: 60,
    price: 85,
    category: 'Facial',
    active: true,
  },
  {
    id: 'service_002',
    providerId: 'provider_001',
    name: 'Anti-Aging Facial',
    description: 'Advanced facial treatment targeting fine lines and wrinkles using premium anti-aging products and techniques.',
    duration: 90,
    price: 150,
    category: 'Facial',
    active: true,
  },
  {
    id: 'service_003',
    providerId: 'provider_001',
    name: 'Bridal Makeup',
    description: 'Complete bridal makeup service including consultation, trial, and day-of application. Look stunning on your special day!',
    duration: 120,
    price: 250,
    category: 'Makeup',
    active: true,
  },
  {
    id: 'service_004',
    providerId: 'provider_001',
    name: 'Evening Makeup',
    description: 'Glamorous makeup application perfect for special events, parties, or a night out.',
    duration: 60,
    price: 95,
    category: 'Makeup',
    active: true,
  },
  // Provider 2 services (Hair Master)
  {
    id: 'service_005',
    providerId: 'provider_002',
    name: 'Haircut & Style',
    description: 'Professional haircut including consultation, wash, cut, and style. Tailored to your face shape and lifestyle.',
    duration: 45,
    price: 65,
    category: 'Hair Cutting',
    active: true,
  },
  {
    id: 'service_006',
    providerId: 'provider_002',
    name: 'Full Color',
    description: 'Complete hair coloring service including consultation, application, and styling. Achieve your dream hair color!',
    duration: 120,
    price: 150,
    category: 'Hair Coloring',
    active: true,
  },
  {
    id: 'service_007',
    providerId: 'provider_002',
    name: 'Balayage',
    description: 'Hand-painted highlighting technique for a natural, sun-kissed look. Low maintenance and beautifully blended.',
    duration: 180,
    price: 250,
    category: 'Hair Coloring',
    active: true,
  },
  {
    id: 'service_008',
    providerId: 'provider_002',
    name: 'Blowout',
    description: 'Professional blow-dry and styling service. Perfect for events or when you want to look your best.',
    duration: 30,
    price: 45,
    category: 'Hair Styling',
    active: true,
  },
  // Provider 3 services (Nail Art)
  {
    id: 'service_009',
    providerId: 'provider_003',
    name: 'Classic Manicure',
    description: 'Traditional manicure including nail shaping, cuticle care, hand massage, and polish application.',
    duration: 30,
    price: 30,
    category: 'Manicure',
    active: true,
  },
  {
    id: 'service_010',
    providerId: 'provider_003',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish manicure that stays chip-free for up to 2 weeks. Includes cuticle care and hand massage.',
    duration: 45,
    price: 50,
    category: 'Manicure',
    active: true,
  },
  {
    id: 'service_011',
    providerId: 'provider_003',
    name: 'Spa Pedicure',
    description: 'Luxurious pedicure experience including foot soak, exfoliation, mask, massage, and polish.',
    duration: 60,
    price: 65,
    category: 'Pedicure',
    active: true,
  },
  {
    id: 'service_012',
    providerId: 'provider_003',
    name: 'Nail Art Design',
    description: 'Custom nail art designs. From simple accents to elaborate designs, express your personality through your nails!',
    duration: 60,
    price: 40,
    category: 'Nail Art',
    active: true,
  },
];

// Mock Reviews
export const mockReviews = [
  {
    id: 'review_001',
    customerId: 'user_001',
    providerId: 'provider_001',
    rating: 5,
    comment: 'Emma is amazing! My skin has never looked better after her facial treatment. Highly recommend!',
    verified: true,
    helpful: 23,
    createdAt: new Date('2024-11-15'),
    customer: mockUsers.find(u => u.id === 'user_001'),
  },
  {
    id: 'review_002',
    customerId: 'user_002',
    providerId: 'provider_001',
    rating: 5,
    comment: 'Best makeup artist in LA! She did my wedding makeup and I looked absolutely stunning.',
    verified: true,
    helpful: 45,
    createdAt: new Date('2024-10-20'),
    customer: mockUsers.find(u => u.id === 'user_002'),
  },
  {
    id: 'review_003',
    customerId: 'user_001',
    providerId: 'provider_002',
    rating: 5,
    comment: 'James is a true hair master. He understood exactly what I wanted and delivered beyond my expectations.',
    verified: true,
    helpful: 18,
    createdAt: new Date('2024-11-01'),
    customer: mockUsers.find(u => u.id === 'user_001'),
  },
  {
    id: 'review_004',
    customerId: 'user_002',
    providerId: 'provider_002',
    rating: 4,
    comment: 'Great haircut! The salon is very clean and professional. Will definitely come back.',
    verified: true,
    helpful: 12,
    createdAt: new Date('2024-09-25'),
    customer: mockUsers.find(u => u.id === 'user_002'),
  },
  {
    id: 'review_005',
    customerId: 'user_001',
    providerId: 'provider_003',
    rating: 5,
    comment: 'Lisa is so talented! The nail art she created was exactly what I envisioned. Love it!',
    verified: true,
    helpful: 31,
    createdAt: new Date('2024-11-10'),
    customer: mockUsers.find(u => u.id === 'user_001'),
  },
  {
    id: 'review_006',
    customerId: 'user_002',
    providerId: 'provider_003',
    rating: 4,
    comment: 'Great pedicure experience. Very relaxing and my nails look perfect.',
    verified: true,
    helpful: 8,
    createdAt: new Date('2024-10-05'),
    customer: mockUsers.find(u => u.id === 'user_002'),
  },
];

// Mock Appointments
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);

export const mockAppointments = [
  {
    id: 'appt_001',
    customerId: 'user_001',
    providerId: 'provider_001',
    serviceId: 'service_001',
    date: tomorrow,
    startTime: '10:00',
    endTime: '11:00',
    status: 'CONFIRMED' as const,
    amount: 85,
    paymentStatus: 'PENDING' as const,
    cancellationPolicy: 'STANDARD' as const,
    customer: mockUsers.find(u => u.id === 'user_001'),
    provider: mockProviders.find(p => p.id === 'provider_001'),
    service: mockServices.find(s => s.id === 'service_001'),
  },
  {
    id: 'appt_002',
    customerId: 'user_002',
    providerId: 'provider_002',
    serviceId: 'service_005',
    date: tomorrow,
    startTime: '14:00',
    endTime: '14:45',
    status: 'SCHEDULED' as const,
    amount: 65,
    paymentStatus: 'PENDING' as const,
    cancellationPolicy: 'MODERATE' as const,
    customer: mockUsers.find(u => u.id === 'user_002'),
    provider: mockProviders.find(p => p.id === 'provider_002'),
    service: mockServices.find(s => s.id === 'service_005'),
  },
  {
    id: 'appt_003',
    customerId: 'user_001',
    providerId: 'provider_003',
    serviceId: 'service_010',
    date: nextWeek,
    startTime: '11:00',
    endTime: '11:45',
    status: 'SCHEDULED' as const,
    amount: 50,
    paymentStatus: 'PENDING' as const,
    cancellationPolicy: 'FLEXIBLE' as const,
    customer: mockUsers.find(u => u.id === 'user_001'),
    provider: mockProviders.find(p => p.id === 'provider_003'),
    service: mockServices.find(s => s.id === 'service_010'),
  },
  {
    id: 'appt_004',
    customerId: 'user_001',
    providerId: 'provider_001',
    serviceId: 'service_001',
    date: lastWeek,
    startTime: '14:00',
    endTime: '15:00',
    status: 'COMPLETED' as const,
    amount: 85,
    paymentStatus: 'PAID' as const,
    cancellationPolicy: 'STANDARD' as const,
    customer: mockUsers.find(u => u.id === 'user_001'),
    provider: mockProviders.find(p => p.id === 'provider_001'),
    service: mockServices.find(s => s.id === 'service_001'),
  },
];

// Mock Education
export const mockEducation = [
  { id: 'edu_001', providerId: 'provider_001', degree: 'Esthetician License', institution: 'California Board of Barbering and Cosmetology', year: 2013 },
  { id: 'edu_002', providerId: 'provider_001', degree: 'Makeup Artistry Certification', institution: 'MAC Pro Training', year: 2015 },
  { id: 'edu_003', providerId: 'provider_002', degree: 'Master Barber License', institution: 'Paul Mitchell Schools', year: 2008 },
  { id: 'edu_004', providerId: 'provider_002', degree: 'Advanced Color Specialist', institution: 'L\'Oréal Professionnel', year: 2012 },
  { id: 'edu_005', providerId: 'provider_003', degree: 'Nail Technician License', institution: 'California Board of Barbering and Cosmetology', year: 2015 },
];

// Mock Certifications
export const mockCertifications = [
  { id: 'cert_001', providerId: 'provider_001', name: 'Advanced Facial Techniques', issuer: 'Dermalogica', year: 2020 },
  { id: 'cert_002', providerId: 'provider_001', name: 'Bridal Makeup Specialist', issuer: 'Bobbi Brown', year: 2018 },
  { id: 'cert_003', providerId: 'provider_002', name: 'Balayage Master', issuer: 'Wella Professionals', year: 2019 },
  { id: 'cert_004', providerId: 'provider_003', name: 'Gel Nail Art Certification', issuer: 'OPI Academy', year: 2021 },
];

// Mock Availability (for each provider)
export const mockAvailability = [
  // Provider 1
  { id: 'avail_001', providerId: 'provider_001', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_002', providerId: 'provider_001', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_003', providerId: 'provider_001', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_004', providerId: 'provider_001', dayOfWeek: 4, startTime: '09:00', endTime: '20:00', active: true },
  { id: 'avail_005', providerId: 'provider_001', dayOfWeek: 5, startTime: '09:00', endTime: '20:00', active: true },
  { id: 'avail_006', providerId: 'provider_001', dayOfWeek: 6, startTime: '10:00', endTime: '16:00', active: true },
  // Provider 2
  { id: 'avail_007', providerId: 'provider_002', dayOfWeek: 2, startTime: '10:00', endTime: '19:00', active: true },
  { id: 'avail_008', providerId: 'provider_002', dayOfWeek: 3, startTime: '10:00', endTime: '19:00', active: true },
  { id: 'avail_009', providerId: 'provider_002', dayOfWeek: 4, startTime: '10:00', endTime: '19:00', active: true },
  { id: 'avail_010', providerId: 'provider_002', dayOfWeek: 5, startTime: '10:00', endTime: '20:00', active: true },
  { id: 'avail_011', providerId: 'provider_002', dayOfWeek: 6, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_012', providerId: 'provider_002', dayOfWeek: 0, startTime: '11:00', endTime: '16:00', active: true },
  // Provider 3
  { id: 'avail_013', providerId: 'provider_003', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_014', providerId: 'provider_003', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_015', providerId: 'provider_003', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_016', providerId: 'provider_003', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', active: true },
  { id: 'avail_017', providerId: 'provider_003', dayOfWeek: 5, startTime: '09:00', endTime: '19:00', active: true },
  { id: 'avail_018', providerId: 'provider_003', dayOfWeek: 6, startTime: '10:00', endTime: '17:00', active: true },
];

// Helper function to check if mock mode should be used
export function shouldUseMockData(): boolean {
  return process.env.USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development';
}

// Get provider with all related data
export function getMockProviderWithDetails(providerId: string) {
  const provider = mockProviders.find(p => p.id === providerId);
  if (!provider) return null;

  return {
    ...provider,
    services: mockServices.filter(s => s.providerId === providerId),
    reviews: mockReviews.filter(r => r.providerId === providerId),
    education: mockEducation.filter(e => e.providerId === providerId),
    certifications: mockCertifications.filter(c => c.providerId === providerId),
    availability: mockAvailability.filter(a => a.providerId === providerId),
  };
}

// Get mock time slots for a provider on a date
export function getMockTimeSlots(providerId: string, date: Date, serviceDuration: number = 60) {
  const dayOfWeek = date.getDay();
  const availability = mockAvailability.find(
    a => a.providerId === providerId && a.dayOfWeek === dayOfWeek && a.active
  );

  if (!availability) {
    return { available: false, message: 'Provider is not available on this day', slots: [] };
  }

  const slots: { time: string; available: boolean }[] = [];
  const [startHour, startMin] = availability.startTime.split(':').map(Number);
  const [endHour, endMin] = availability.endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Get existing appointments for this provider on this date
  const existingAppts = mockAppointments.filter(
    a => a.providerId === providerId &&
    a.date.toDateString() === date.toDateString() &&
    (a.status === 'SCHEDULED' || a.status === 'CONFIRMED')
  );

  for (let mins = startMinutes; mins + serviceDuration <= endMinutes; mins += 30) {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const slotEndMins = mins + serviceDuration;

    // Check conflicts with existing appointments
    const isConflict = existingAppts.some(appt => {
      const [apptStartH, apptStartM] = appt.startTime.split(':').map(Number);
      const [apptEndH, apptEndM] = appt.endTime.split(':').map(Number);
      const apptStartMins = apptStartH * 60 + apptStartM;
      const apptEndMins = apptEndH * 60 + apptEndM;
      return mins < apptEndMins && slotEndMins > apptStartMins;
    });

    // Check if slot is in the past
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const isPast = isToday && mins <= currentMins;

    slots.push({
      time: timeStr,
      available: !isConflict && !isPast,
    });
  }

  return {
    available: true,
    date: date.toISOString().split('T')[0],
    providerId,
    businessHours: {
      start: availability.startTime,
      end: availability.endTime,
    },
    slots,
  };
}
