import { Provider, Review, Service } from './types';

// Mock data for development - will be replaced with database queries
export const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Licensed Aesthetician & Dermatologist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    specialty: ['Facial Treatments', 'Skin Care', 'Anti-Aging'],
    rating: 4.9,
    reviewCount: 342,
    experience: 12,
    bio: 'Board-certified dermatologist specializing in medical and cosmetic dermatology with over 12 years of experience. Passionate about helping clients achieve healthy, glowing skin.',
    location: {
      address: '123 Beauty Lane',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
    verified: true,
    insuranceAccepted: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth'],
    languages: ['English', 'Spanish'],
    education: [
      {
        degree: 'Doctor of Medicine (MD)',
        institution: 'UCLA School of Medicine',
        year: 2012,
      },
    ],
    certifications: [
      {
        name: 'Board Certified Dermatologist',
        issuer: 'American Board of Dermatology',
        year: 2015,
      },
    ],
    nextAvailable: new Date(Date.now() + 86400000), // Tomorrow
    priceRange: {
      min: 150,
      max: 500,
    },
  },
  {
    id: '2',
    name: 'Emily Rodriguez',
    title: 'Master Hair Stylist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    specialty: ['Hair Styling', 'Color Specialist', 'Balayage'],
    rating: 4.8,
    reviewCount: 256,
    experience: 8,
    bio: 'Award-winning hair stylist specializing in color transformations and modern cuts. Featured in Vogue and Harper\'s Bazaar.',
    location: {
      address: '456 Style Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    verified: true,
    insuranceAccepted: [],
    languages: ['English'],
    education: [
      {
        degree: 'Cosmetology License',
        institution: 'Paul Mitchell School',
        year: 2016,
      },
    ],
    certifications: [
      {
        name: 'Certified Balayage Specialist',
        issuer: 'Redken Academy',
        year: 2018,
      },
    ],
    nextAvailable: new Date(Date.now() + 172800000), // 2 days
    priceRange: {
      min: 100,
      max: 350,
    },
  },
  {
    id: '3',
    name: 'Michelle Chen',
    title: 'Licensed Massage Therapist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michelle',
    specialty: ['Deep Tissue Massage', 'Sports Massage', 'Therapeutic Massage'],
    rating: 5.0,
    reviewCount: 189,
    experience: 10,
    bio: 'Certified massage therapist with expertise in sports recovery and chronic pain management. Worked with professional athletes.',
    location: {
      address: '789 Wellness Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
    verified: true,
    insuranceAccepted: ['Aetna', 'Cigna'],
    languages: ['English', 'Mandarin'],
    education: [
      {
        degree: 'Massage Therapy Certification',
        institution: 'National Holistic Institute',
        year: 2014,
      },
    ],
    certifications: [
      {
        name: 'Licensed Massage Therapist',
        issuer: 'California Massage Therapy Council',
        year: 2014,
      },
    ],
    nextAvailable: new Date(Date.now() + 43200000), // 12 hours
    priceRange: {
      min: 80,
      max: 200,
    },
  },
  {
    id: '4',
    name: 'Jessica Williams',
    title: 'Nail Artist & Technician',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    specialty: ['Nail Art', 'Manicure', 'Pedicure'],
    rating: 4.7,
    reviewCount: 412,
    experience: 6,
    bio: 'Creative nail artist specializing in custom designs and long-lasting gel manicures. Instagram @jessicasnails with 50K followers.',
    location: {
      address: '321 Glam Blvd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
    },
    verified: true,
    insuranceAccepted: [],
    languages: ['English'],
    education: [
      {
        degree: 'Nail Technician License',
        institution: 'Florida Academy of Nail Technology',
        year: 2018,
      },
    ],
    certifications: [
      {
        name: 'Certified Nail Specialist',
        issuer: 'OPI Certified',
        year: 2019,
      },
    ],
    nextAvailable: new Date(Date.now() + 259200000), // 3 days
    priceRange: {
      min: 50,
      max: 150,
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    providerId: '1',
    userId: 'u1',
    userName: 'Amanda K.',
    rating: 5,
    comment: 'Dr. Johnson is amazing! She really took the time to understand my skin concerns and created a personalized treatment plan. My skin has never looked better!',
    date: new Date('2024-10-15'),
    verified: true,
    helpful: 24,
  },
  {
    id: '2',
    providerId: '1',
    userId: 'u2',
    userName: 'Robert M.',
    rating: 5,
    comment: 'Professional, knowledgeable, and caring. The office is clean and modern. Highly recommend!',
    date: new Date('2024-10-01'),
    verified: true,
    helpful: 18,
  },
  {
    id: '3',
    providerId: '2',
    userId: 'u3',
    userName: 'Lisa P.',
    rating: 5,
    comment: 'Emily is a color genius! She transformed my hair exactly how I envisioned. The consultation was thorough and she explained every step.',
    date: new Date('2024-10-20'),
    verified: true,
    helpful: 31,
  },
];

export const mockServices: Service[] = [
  {
    id: 's1',
    name: 'Hydrafacial Treatment',
    description: 'Deep cleansing and hydrating facial treatment',
    duration: 60,
    price: 200,
    category: 'Facial',
  },
  {
    id: 's2',
    name: 'Balayage Hair Color',
    description: 'Natural-looking hair highlights',
    duration: 180,
    price: 250,
    category: 'Hair',
  },
  {
    id: 's3',
    name: 'Deep Tissue Massage',
    description: 'Therapeutic massage for muscle tension',
    duration: 90,
    price: 150,
    category: 'Massage',
  },
  {
    id: 's4',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish manicure',
    duration: 60,
    price: 65,
    category: 'Nails',
  },
];
