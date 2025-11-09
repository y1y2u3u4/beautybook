/**
 * Mock Data for BeautyBook Platform
 * This file contains comprehensive test data for all features
 */

// ==================== Users & Profiles ====================

export const mockUsers = [
  {
    id: 'user-1',
    clerkId: 'clerk_user1',
    email: 'sarah.johnson@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    imageUrl: 'https://i.pravatar.cc/150?img=1',
    role: 'CUSTOMER',
    createdAt: '2024-01-15T10:00:00Z',
    customerProfile: {
      id: 'cp-1',
      phone: '+1 (555) 123-4567',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      preferences: {
        notifications: { email: true, sms: true },
      },
      tags: ['VIP', 'Regular'],
      notes: 'Prefers morning appointments',
    },
  },
  {
    id: 'user-2',
    clerkId: 'clerk_user2',
    email: 'emily.chen@example.com',
    firstName: 'Emily',
    lastName: 'Chen',
    imageUrl: 'https://i.pravatar.cc/150?img=5',
    role: 'CUSTOMER',
    createdAt: '2024-02-20T14:30:00Z',
    customerProfile: {
      id: 'cp-2',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      tags: ['New Customer'],
    },
  },
  {
    id: 'user-3',
    clerkId: 'clerk_user3',
    email: 'michael.brown@example.com',
    firstName: 'Michael',
    lastName: 'Brown',
    imageUrl: 'https://i.pravatar.cc/150?img=12',
    role: 'CUSTOMER',
    createdAt: '2023-08-10T09:15:00Z',
    customerProfile: {
      id: 'cp-3',
      phone: '+1 (555) 345-6789',
      address: '789 Elm St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      tags: ['At Risk'],
    },
  },
  {
    id: 'user-4',
    clerkId: 'clerk_user4',
    email: 'jessica.white@example.com',
    firstName: 'Jessica',
    lastName: 'White',
    imageUrl: 'https://i.pravatar.cc/150?img=9',
    role: 'CUSTOMER',
    createdAt: '2024-03-01T11:00:00Z',
    customerProfile: {
      id: 'cp-4',
      phone: '+1 (555) 456-7890',
      tags: ['Regular'],
    },
  },
  {
    id: 'user-5',
    clerkId: 'clerk_provider1',
    email: 'owner@glamourstudio.com',
    firstName: 'Lisa',
    lastName: 'Anderson',
    imageUrl: 'https://i.pravatar.cc/150?img=20',
    role: 'PROVIDER',
    createdAt: '2023-06-01T08:00:00Z',
  },
];

// ==================== Providers ====================

export const mockProviders = [
  {
    id: 'provider-1',
    userId: 'user-5',
    businessName: 'Glamour Beauty Studio',
    name: 'Glamour Beauty Studio',
    description: 'Premier beauty salon offering the finest hair, nail, and skincare services in San Francisco.',
    title: 'Premier beauty salon offering the finest hair, nail, and skincare services in San Francisco.',
    category: 'SALON',
    address: '555 Beauty Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    phone: '+1 (555) 999-8888',
    email: 'info@glamourstudio.com',
    website: 'https://glamourstudio.com',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800',
    ],
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    avatar: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    averageRating: 4.8,
    rating: 4.8,
    reviewCount: 156,
    verified: true,
    featured: true,
    status: 'ACTIVE',
    operatingHours: {
      Monday: { open: '09:00', close: '19:00' },
      Tuesday: { open: '09:00', close: '19:00' },
      Wednesday: { open: '09:00', close: '19:00' },
      Thursday: { open: '09:00', close: '20:00' },
      Friday: { open: '09:00', close: '20:00' },
      Saturday: { open: '10:00', close: '18:00' },
      Sunday: { open: '10:00', close: '17:00' },
    },
    amenities: ['WiFi', 'Parking', 'Wheelchair Accessible', 'Credit Cards', 'Online Booking'],
    specialties: ['Hair Coloring', 'Balayage', 'Keratin Treatment', 'Nail Art', 'Facial'],
    specialty: ['Hair Coloring', 'Balayage', 'Keratin Treatment', 'Nail Art', 'Facial'],
    experience: 15,
    bio: 'Glamour Beauty Studio has been serving the San Francisco community for over 15 years. Our team of expert stylists and beauty professionals are dedicated to making you look and feel your best. We specialize in the latest hair coloring techniques, including balayage and ombre, as well as premium nail art and rejuvenating facial treatments. Our mission is to provide exceptional service in a luxurious, welcoming environment.',
    location: {
      address: '555 Beauty Lane',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
    insuranceAccepted: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealthcare'],
    languages: ['English', 'Spanish', 'Mandarin'],
    education: [
      {
        degree: 'Cosmetology License',
        institution: 'San Francisco Beauty Academy',
        year: 2008,
      },
      {
        degree: 'Advanced Hair Coloring Certification',
        institution: 'Vidal Sassoon Academy',
        year: 2010,
      },
    ],
    certifications: [
      {
        name: 'Master Colorist Certification',
        issuer: 'Redken Professional',
        year: 2015,
      },
      {
        name: 'Keratin Treatment Specialist',
        issuer: 'Brazilian Blowout',
        year: 2018,
      },
      {
        name: 'Certified Esthetician',
        issuer: 'California Board of Barbering and Cosmetology',
        year: 2012,
      },
    ],
    nextAvailable: new Date('2024-11-20T10:00:00'),
    priceRange: {
      min: 45,
      max: 250,
    },
  },
];

// ==================== Services ====================

export const mockServices = [
  {
    id: 'service-1',
    providerId: 'provider-1',
    name: 'Classic Haircut',
    description: 'Professional haircut with wash and style',
    category: 'HAIR',
    duration: 45,
    price: 65,
    images: ['https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'],
    active: true,
  },
  {
    id: 'service-2',
    providerId: 'provider-1',
    name: 'Balayage Hair Color',
    description: 'Hand-painted highlights for a natural sun-kissed look',
    category: 'HAIR',
    duration: 180,
    price: 250,
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'],
    active: true,
  },
  {
    id: 'service-3',
    providerId: 'provider-1',
    name: 'Deluxe Manicure',
    description: 'Luxurious manicure with hand massage and polish',
    category: 'NAILS',
    duration: 60,
    price: 45,
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'],
    active: true,
  },
  {
    id: 'service-4',
    providerId: 'provider-1',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish manicure',
    category: 'NAILS',
    duration: 75,
    price: 55,
    images: ['https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400'],
    active: true,
  },
  {
    id: 'service-5',
    providerId: 'provider-1',
    name: 'Deep Cleansing Facial',
    description: 'Purifying facial treatment for all skin types',
    category: 'FACIAL',
    duration: 90,
    price: 120,
    images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'],
    active: true,
  },
  {
    id: 'service-6',
    providerId: 'provider-1',
    name: 'Keratin Treatment',
    description: 'Smoothing treatment for frizz-free hair',
    category: 'HAIR',
    duration: 240,
    price: 350,
    active: true,
  },
  {
    id: 'service-7',
    providerId: 'provider-1',
    name: 'Luxury Spa Pedicure',
    description: 'Complete foot treatment with massage and polish',
    category: 'NAILS',
    duration: 90,
    price: 75,
    active: true,
  },
];

// ==================== Staff ====================

export const mockStaff = [
  {
    id: 'staff-1',
    providerId: 'provider-1',
    name: 'Maria Rodriguez',
    role: 'Senior Stylist',
    email: 'maria@glamourstudio.com',
    phone: '+1 (555) 111-2222',
    specialties: ['Hair Coloring', 'Balayage', 'Keratin Treatment'],
    imageUrl: 'https://i.pravatar.cc/150?img=10',
    rating: 4.9,
    yearsOfExperience: 8,
    bio: 'Specialized in color techniques and hair transformations.',
    active: true,
  },
  {
    id: 'staff-2',
    providerId: 'provider-1',
    name: 'David Kim',
    role: 'Master Stylist',
    email: 'david@glamourstudio.com',
    phone: '+1 (555) 222-3333',
    specialties: ['Precision Cuts', 'Men\'s Grooming'],
    imageUrl: 'https://i.pravatar.cc/150?img=13',
    rating: 4.8,
    yearsOfExperience: 10,
    bio: 'Expert in classic and modern cutting techniques.',
    active: true,
  },
  {
    id: 'staff-3',
    providerId: 'provider-1',
    name: 'Sophie Laurent',
    role: 'Nail Technician',
    email: 'sophie@glamourstudio.com',
    phone: '+1 (555) 333-4444',
    specialties: ['Nail Art', 'Gel Extensions', 'Pedicure'],
    imageUrl: 'https://i.pravatar.cc/150?img=25',
    rating: 4.9,
    yearsOfExperience: 6,
    bio: 'Creative nail artist with attention to detail.',
    active: true,
  },
  {
    id: 'staff-4',
    providerId: 'provider-1',
    name: 'Emma Thompson',
    role: 'Esthetician',
    email: 'emma@glamourstudio.com',
    phone: '+1 (555) 444-5555',
    specialties: ['Facials', 'Skincare', 'Anti-Aging'],
    imageUrl: 'https://i.pravatar.cc/150?img=16',
    rating: 5.0,
    yearsOfExperience: 12,
    bio: 'Certified esthetician passionate about skincare.',
    active: true,
  },
];

// ==================== Appointments ====================

export const mockAppointments = [
  {
    id: 'apt-1',
    customerId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-2',
    staffId: 'staff-1',
    date: '2024-11-15',
    startTime: '10:00',
    endTime: '13:00',
    status: 'CONFIRMED',
    amount: 250,
    paymentStatus: 'PAID',
    paymentId: 'pi_123456789',
    notes: 'Looking for a natural blonde look',
    customer: mockUsers[0],
    service: mockServices[1],
    staff: mockStaff[0],
    createdAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'apt-2',
    customerId: 'user-2',
    providerId: 'provider-1',
    serviceId: 'service-3',
    staffId: 'staff-3',
    date: '2024-11-15',
    startTime: '14:00',
    endTime: '15:00',
    status: 'SCHEDULED',
    amount: 45,
    paymentStatus: 'PENDING',
    customer: mockUsers[1],
    service: mockServices[2],
    staff: mockStaff[2],
    createdAt: '2024-11-10T14:00:00Z',
  },
  {
    id: 'apt-3',
    customerId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-5',
    staffId: 'staff-4',
    date: '2024-11-16',
    startTime: '11:00',
    endTime: '12:30',
    status: 'CONFIRMED',
    amount: 120,
    paymentStatus: 'PAID',
    paymentId: 'pi_987654321',
    customer: mockUsers[0],
    service: mockServices[4],
    staff: mockStaff[3],
    createdAt: '2024-11-08T10:30:00Z',
  },
  {
    id: 'apt-4',
    customerId: 'user-4',
    providerId: 'provider-1',
    serviceId: 'service-1',
    staffId: 'staff-2',
    date: '2024-11-16',
    startTime: '15:00',
    endTime: '15:45',
    status: 'CONFIRMED',
    amount: 65,
    paymentStatus: 'PAID',
    customer: mockUsers[3],
    service: mockServices[0],
    staff: mockStaff[1],
    createdAt: '2024-11-09T16:00:00Z',
  },
  {
    id: 'apt-5',
    customerId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    staffId: 'staff-2',
    date: '2024-10-20',
    startTime: '10:00',
    endTime: '10:45',
    status: 'COMPLETED',
    amount: 65,
    paymentStatus: 'PAID',
    paymentId: 'pi_111111111',
    customer: mockUsers[0],
    service: mockServices[0],
    staff: mockStaff[1],
    actualStartTime: '2024-10-20T10:00:00Z',
    actualEndTime: '2024-10-20T10:45:00Z',
    createdAt: '2024-10-15T12:00:00Z',
  },
  {
    id: 'apt-6',
    customerId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-3',
    staffId: 'staff-3',
    date: '2024-09-15',
    startTime: '14:00',
    endTime: '15:00',
    status: 'COMPLETED',
    amount: 45,
    paymentStatus: 'PAID',
    paymentId: 'pi_222222222',
    customer: mockUsers[0],
    service: mockServices[2],
    staff: mockStaff[2],
    actualStartTime: '2024-09-15T14:00:00Z',
    actualEndTime: '2024-09-15T15:00:00Z',
    createdAt: '2024-09-10T10:00:00Z',
  },
  {
    id: 'apt-7',
    customerId: 'user-2',
    providerId: 'provider-1',
    serviceId: 'service-1',
    staffId: 'staff-2',
    date: '2024-10-25',
    startTime: '16:00',
    endTime: '16:45',
    status: 'COMPLETED',
    amount: 65,
    paymentStatus: 'PAID',
    customer: mockUsers[1],
    service: mockServices[0],
    staff: mockStaff[1],
    actualStartTime: '2024-10-25T16:00:00Z',
    actualEndTime: '2024-10-25T16:50:00Z',
    createdAt: '2024-10-20T11:00:00Z',
  },
  {
    id: 'apt-8',
    customerId: 'user-4',
    providerId: 'provider-1',
    serviceId: 'service-5',
    staffId: 'staff-4',
    date: '2024-08-10',
    startTime: '10:00',
    endTime: '11:30',
    status: 'COMPLETED',
    amount: 120,
    paymentStatus: 'PAID',
    customer: mockUsers[3],
    service: mockServices[4],
    staff: mockStaff[3],
    actualStartTime: '2024-08-10T10:00:00Z',
    actualEndTime: '2024-08-10T11:30:00Z',
    createdAt: '2024-08-01T09:00:00Z',
  },
];

// ==================== Reviews ====================

export const mockReviews = [
  {
    id: 'review-1',
    customerId: 'user-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    providerId: 'provider-1',
    appointmentId: 'apt-5',
    rating: 5,
    ratings: {
      professionalSkills: 5,
      serviceAttitude: 5,
      environment: 5,
      valueForMoney: 4,
      satisfaction: 5,
    },
    comment: 'Absolutely love my new haircut! David is amazing and really listened to what I wanted. The salon is beautiful and the service was top-notch.',
    photos: [],
    tags: ['Great Service', 'Professional', 'Clean'],
    anonymous: false,
    verified: true,
    helpful: 12,
    date: new Date('2024-10-21T15:00:00Z'),
    customer: mockUsers[0],
    service: mockServices[0],
    createdAt: '2024-10-21T15:00:00Z',
  },
  {
    id: 'review-2',
    customerId: 'user-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    providerId: 'provider-1',
    appointmentId: 'apt-6',
    rating: 5,
    ratings: {
      professionalSkills: 5,
      serviceAttitude: 5,
      environment: 5,
      valueForMoney: 5,
      satisfaction: 5,
    },
    comment: 'Sophie did an incredible job on my nails! Very detailed and creative. Highly recommend!',
    photos: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300'],
    tags: ['Nail Art', 'Creative', 'Detailed'],
    anonymous: false,
    verified: true,
    helpful: 8,
    date: new Date('2024-09-16T18:00:00Z'),
    customer: mockUsers[0],
    service: mockServices[2],
    createdAt: '2024-09-16T18:00:00Z',
  },
  {
    id: 'review-3',
    customerId: 'user-2',
    userId: 'user-2',
    userName: 'Emily Chen',
    providerId: 'provider-1',
    appointmentId: 'apt-7',
    rating: 4,
    ratings: {
      professionalSkills: 5,
      serviceAttitude: 4,
      environment: 4,
      valueForMoney: 4,
      satisfaction: 4,
    },
    comment: 'Great haircut, friendly staff. Only minor wait time but overall excellent experience.',
    photos: [],
    tags: ['Friendly', 'Professional'],
    anonymous: false,
    verified: true,
    helpful: 5,
    date: new Date('2024-10-26T12:00:00Z'),
    customer: mockUsers[1],
    service: mockServices[0],
    createdAt: '2024-10-26T12:00:00Z',
  },
  {
    id: 'review-4',
    customerId: 'user-4',
    userId: 'user-4',
    userName: 'Jessica Martinez',
    providerId: 'provider-1',
    appointmentId: 'apt-8',
    rating: 5,
    ratings: {
      professionalSkills: 5,
      serviceAttitude: 5,
      environment: 5,
      valueForMoney: 5,
      satisfaction: 5,
    },
    comment: 'Emma is a skincare wizard! My skin has never looked better. The facial was so relaxing and effective.',
    photos: [],
    tags: ['Relaxing', 'Expert', 'Results'],
    anonymous: false,
    verified: true,
    helpful: 15,
    date: new Date('2024-08-11T14:00:00Z'),
    customer: mockUsers[3],
    service: mockServices[4],
    createdAt: '2024-08-11T14:00:00Z',
  },
];

// ==================== Schedules ====================

export const mockSchedules = [
  // Week of Nov 11-17, 2024
  // Monday
  { id: 'sched-1', staffId: 'staff-1', date: '2024-11-11', startTime: '09:00', endTime: '17:00', staff: mockStaff[0] },
  { id: 'sched-2', staffId: 'staff-2', date: '2024-11-11', startTime: '09:00', endTime: '18:00', staff: mockStaff[1] },
  { id: 'sched-3', staffId: 'staff-3', date: '2024-11-11', startTime: '10:00', endTime: '18:00', staff: mockStaff[2] },
  { id: 'sched-4', staffId: 'staff-4', date: '2024-11-11', startTime: '09:00', endTime: '17:00', staff: mockStaff[3] },

  // Tuesday
  { id: 'sched-5', staffId: 'staff-1', date: '2024-11-12', startTime: '09:00', endTime: '17:00', staff: mockStaff[0] },
  { id: 'sched-6', staffId: 'staff-2', date: '2024-11-12', startTime: '10:00', endTime: '19:00', staff: mockStaff[1] },
  { id: 'sched-7', staffId: 'staff-3', date: '2024-11-12', startTime: '09:00', endTime: '17:00', staff: mockStaff[2] },

  // Wednesday
  { id: 'sched-8', staffId: 'staff-1', date: '2024-11-13', startTime: '09:00', endTime: '18:00', staff: mockStaff[0] },
  { id: 'sched-9', staffId: 'staff-2', date: '2024-11-13', startTime: '09:00', endTime: '18:00', staff: mockStaff[1] },
  { id: 'sched-10', staffId: 'staff-3', date: '2024-11-13', startTime: '10:00', endTime: '19:00', staff: mockStaff[2] },
  { id: 'sched-11', staffId: 'staff-4', date: '2024-11-13', startTime: '09:00', endTime: '17:00', staff: mockStaff[3] },

  // Thursday
  { id: 'sched-12', staffId: 'staff-1', date: '2024-11-14', startTime: '09:00', endTime: '20:00', staff: mockStaff[0] },
  { id: 'sched-13', staffId: 'staff-2', date: '2024-11-14', startTime: '09:00', endTime: '18:00', staff: mockStaff[1] },
  { id: 'sched-14', staffId: 'staff-4', date: '2024-11-14', startTime: '10:00', endTime: '18:00', staff: mockStaff[3] },

  // Friday
  { id: 'sched-15', staffId: 'staff-1', date: '2024-11-15', startTime: '09:00', endTime: '20:00', staff: mockStaff[0] },
  { id: 'sched-16', staffId: 'staff-2', date: '2024-11-15', startTime: '09:00', endTime: '20:00', staff: mockStaff[1] },
  { id: 'sched-17', staffId: 'staff-3', date: '2024-11-15', startTime: '09:00', endTime: '20:00', staff: mockStaff[2] },
  { id: 'sched-18', staffId: 'staff-4', date: '2024-11-15', startTime: '09:00', endTime: '18:00', staff: mockStaff[3] },

  // Saturday
  { id: 'sched-19', staffId: 'staff-1', date: '2024-11-16', startTime: '10:00', endTime: '18:00', staff: mockStaff[0] },
  { id: 'sched-20', staffId: 'staff-2', date: '2024-11-16', startTime: '10:00', endTime: '18:00', staff: mockStaff[1] },
  { id: 'sched-21', staffId: 'staff-3', date: '2024-11-16', startTime: '10:00', endTime: '18:00', staff: mockStaff[2] },

  // Sunday
  { id: 'sched-22', staffId: 'staff-2', date: '2024-11-17', startTime: '10:00', endTime: '17:00', staff: mockStaff[1] },
  { id: 'sched-23', staffId: 'staff-3', date: '2024-11-17', startTime: '11:00', endTime: '17:00', staff: mockStaff[2] },
];

// ==================== Business Hours ====================

export const mockBusinessHours = {
  Monday: { open: '09:00', close: '19:00', breaks: [{ start: '12:00', end: '13:00' }] },
  Tuesday: { open: '09:00', close: '19:00', breaks: [{ start: '12:00', end: '13:00' }] },
  Wednesday: { open: '09:00', close: '19:00', breaks: [{ start: '12:00', end: '13:00' }] },
  Thursday: { open: '09:00', close: '20:00', breaks: [{ start: '12:00', end: '13:00' }] },
  Friday: { open: '09:00', close: '20:00', breaks: [] },
  Saturday: { open: '10:00', close: '18:00', breaks: [] },
  Sunday: { open: '10:00', close: '17:00', breaks: [] },
};

// ==================== Holidays ====================

export const mockHolidays = [
  {
    id: 'holiday-1',
    providerId: 'provider-1',
    name: 'Thanksgiving Day',
    date: '2024-11-28',
  },
  {
    id: 'holiday-2',
    providerId: 'provider-1',
    name: 'Christmas Day',
    date: '2024-12-25',
  },
  {
    id: 'holiday-3',
    providerId: 'provider-1',
    name: "New Year's Day",
    date: '2025-01-01',
  },
];

// ==================== Notifications ====================

export const mockNotifications = [
  {
    id: 'notif-1',
    providerId: 'provider-1',
    type: 'BOOKING_NEW',
    title: 'New Booking Received',
    message: 'Sarah Johnson booked Balayage Hair Color for Nov 15 at 10:00 AM',
    read: false,
    actionUrl: '/provider-dashboard/appointments',
    actionText: 'View Appointment',
    createdAt: '2024-11-01T09:00:00Z',
  },
  {
    id: 'notif-2',
    providerId: 'provider-1',
    type: 'REVIEW_NEW',
    title: 'New Review Posted',
    message: 'Sarah Johnson left a 5-star review for Classic Haircut',
    read: false,
    actionUrl: '/provider-dashboard/reviews',
    actionText: 'View Review',
    createdAt: '2024-10-21T15:00:00Z',
  },
  {
    id: 'notif-3',
    providerId: 'provider-1',
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: 'Received $120 payment from Sarah Johnson for Deep Cleansing Facial',
    read: true,
    actionUrl: '/provider-dashboard/finances',
    actionText: 'View Details',
    createdAt: '2024-11-08T10:30:00Z',
  },
  {
    id: 'notif-4',
    providerId: 'provider-1',
    type: 'BOOKING_REMINDER',
    title: 'Upcoming Appointments',
    message: 'You have 2 appointments scheduled for tomorrow',
    read: true,
    actionUrl: '/provider-dashboard/appointments',
    actionText: 'View Schedule',
    createdAt: '2024-11-14T18:00:00Z',
  },
  {
    id: 'notif-5',
    providerId: 'provider-1',
    type: 'BOOKING_NEW',
    title: 'New Booking Received',
    message: 'Emily Chen booked Deluxe Manicure for Nov 15 at 2:00 PM',
    read: false,
    actionUrl: '/provider-dashboard/appointments',
    actionText: 'View Appointment',
    createdAt: '2024-11-10T14:00:00Z',
  },
  {
    id: 'notif-6',
    providerId: 'provider-1',
    type: 'SYSTEM',
    title: 'System Update',
    message: 'New features have been added to your dashboard. Check them out!',
    read: true,
    actionUrl: '/provider-dashboard',
    actionText: 'Explore',
    createdAt: '2024-11-05T08:00:00Z',
  },
];

// ==================== Message Templates ====================

export const mockMessageTemplates = [
  {
    id: 'template-1',
    providerId: 'provider-1',
    type: 'BOOKING_CONFIRMATION',
    channel: 'EMAIL',
    subject: 'Your Appointment at {businessName} is Confirmed!',
    content: `Hi {customerName},

Your appointment has been confirmed!

Service: {service}
Date: {date}
Time: {time}
Staff: {staffName}

We're located at:
{address}

If you need to reschedule or cancel, please contact us at least 24 hours in advance.

We look forward to seeing you!

Best regards,
{businessName} Team`,
    enabled: true,
  },
  {
    id: 'template-2',
    providerId: 'provider-1',
    type: 'BOOKING_REMINDER',
    channel: 'SMS',
    subject: '',
    content: 'Hi {customerName}! Reminder: Your {service} appointment at {businessName} is tomorrow at {time}. See you soon!',
    enabled: true,
  },
  {
    id: 'template-3',
    providerId: 'provider-1',
    type: 'REVIEW_REQUEST',
    channel: 'EMAIL',
    subject: 'How was your experience at {businessName}?',
    content: `Hi {customerName},

Thank you for choosing {businessName}! We hope you enjoyed your {service} appointment.

We'd love to hear about your experience. Your feedback helps us improve and helps others discover our services.

[Leave a Review]

Thank you for your support!

Best regards,
{businessName} Team`,
    enabled: true,
  },
  {
    id: 'template-4',
    providerId: 'provider-1',
    type: 'BOOKING_CANCELLED',
    channel: 'EMAIL',
    subject: 'Appointment Cancellation - {businessName}',
    content: `Hi {customerName},

Your appointment scheduled for {date} at {time} has been cancelled.

Service: {service}

If this was cancelled in error or you'd like to reschedule, please contact us.

{refundMessage}

Best regards,
{businessName} Team`,
    enabled: true,
  },
  {
    id: 'template-5',
    providerId: 'provider-1',
    type: 'THANK_YOU',
    channel: 'EMAIL',
    subject: 'Thank You for Visiting {businessName}!',
    content: `Hi {customerName},

Thank you for visiting {businessName}! We hope you loved your {service} experience.

We'd be thrilled to see you again. Book your next appointment online anytime.

As a valued customer, enjoy 10% off your next visit with code: THANKYOU10

Best regards,
{businessName} Team`,
    enabled: false,
  },
];

// ==================== Customer Stats (Computed) ====================

export const mockCustomerStats = {
  totalCustomers: 4,
  vipCustomers: 1,
  totalRevenue: 560,
  avgCustomerValue: 140,
};

// Calculate detailed customer data with appointments
export const getCustomerWithStats = (customerId: string) => {
  const customer = mockUsers.find((u) => u.id === customerId);
  if (!customer) return null;

  const customerAppointments = mockAppointments.filter(
    (apt) => apt.customerId === customerId && apt.status === 'COMPLETED'
  );

  const totalVisits = customerAppointments.length;
  const totalSpent = customerAppointments.reduce((sum, apt) => sum + apt.amount, 0);
  const avgPerVisit = totalVisits > 0 ? totalSpent / totalVisits : 0;
  const lastVisit = customerAppointments.length > 0 ? customerAppointments[0].date : null;

  // Calculate RFM scores
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const recencyScore =
    daysSinceLastVisit < 30 ? 5 : daysSinceLastVisit < 60 ? 4 : daysSinceLastVisit < 90 ? 3 : daysSinceLastVisit < 180 ? 2 : 1;
  const frequencyScore = totalVisits >= 10 ? 5 : totalVisits >= 5 ? 4 : totalVisits >= 3 ? 3 : totalVisits >= 2 ? 2 : 1;
  const monetaryScore = totalSpent >= 500 ? 5 : totalSpent >= 300 ? 4 : totalSpent >= 150 ? 3 : totalSpent >= 50 ? 2 : 1;

  // Determine segment
  let segment = 'REGULAR';
  if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
    segment = 'VIP';
  } else if (totalVisits === 1 && daysSinceLastVisit < 30) {
    segment = 'NEW';
  } else if (recencyScore <= 2 && frequencyScore >= 3) {
    segment = 'AT_RISK';
  } else if (daysSinceLastVisit > 180 && totalVisits > 0) {
    segment = 'CHURNED';
  }

  // Service preferences
  const serviceMap = new Map();
  customerAppointments.forEach((apt) => {
    const service = mockServices.find((s) => s.id === apt.serviceId);
    if (service) {
      const serviceName = service.name;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { serviceName, count: 0, lastDate: apt.date });
      }
      const pref = serviceMap.get(serviceName);
      pref.count++;
      if (new Date(apt.date) > new Date(pref.lastDate)) {
        pref.lastDate = apt.date;
      }
    }
  });

  const servicePreferences = Array.from(serviceMap.values()).sort((a, b) => b.count - a.count);

  return {
    ...customer,
    name: `${customer.firstName} ${customer.lastName}`,
    segment,
    totalVisits,
    totalSpent,
    lastVisit,
    stats: {
      totalVisits,
      totalSpent,
      avgPerVisit,
      lastVisit,
    },
    rfm: {
      recency: recencyScore,
      frequency: frequencyScore,
      monetary: monetaryScore,
      daysSinceLastVisit,
    },
    servicePreferences,
    tags: customer.customerProfile?.tags || [],
    notes: customer.customerProfile?.notes || '',
  };
};

// Get all customers with stats
export const getAllCustomersWithStats = () => {
  return mockUsers
    .filter((u) => u.role === 'CUSTOMER')
    .map((customer) => getCustomerWithStats(customer.id))
    .filter(Boolean);
};

// ==================== Favorites ====================

export const mockFavorites = [
  {
    id: 'fav-1',
    customerId: 'user-1',
    providerId: 'provider-1',
    provider: mockProviders[0],
    createdAt: '2024-09-01T10:00:00Z',
  },
];

// ==================== Helper Functions ====================

export const getAppointmentsByDate = (date: string) => {
  return mockAppointments.filter((apt) => apt.date === date);
};

export const getAppointmentsByDateRange = (startDate: string, endDate: string) => {
  return mockAppointments.filter((apt) => apt.date >= startDate && apt.date <= endDate);
};

export const getSchedulesByDate = (date: string) => {
  return mockSchedules.filter((sched) => sched.date === date);
};

export const getSchedulesByDateRange = (startDate: string, endDate: string) => {
  return mockSchedules.filter((sched) => sched.date >= startDate && sched.date <= endDate);
};
