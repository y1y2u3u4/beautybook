// Database types for Supabase

export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  phone: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  medical_history: any | null;
  allergies: string[];
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  title: string;
  bio: string;
  phone: string;
  verified: boolean;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  experience: number;
  languages: string[];
  specialties: string[];
  price_min: number;
  price_max: number;
  insurance_accepted: string[];
  average_rating: number;
  review_count: number;
  business_hours: any | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderWithUser extends ProviderProfile {
  user: User;
}

export interface Education {
  id: string;
  provider_id: string;
  degree: string;
  institution: string;
  year: number;
  created_at: string;
}

export interface Certification {
  id: string;
  provider_id: string;
  name: string;
  issuer: string;
  year: number;
  expiry_date: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  amount: number;
  payment_status: PaymentStatus;
  payment_id: string | null;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  verified: boolean;
  helpful: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithCustomer extends Review {
  customer: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  provider_id: string;
  created_at: string;
}

export interface Availability {
  id: string;
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Query filters
export interface ProviderFilters {
  city?: string;
  state?: string;
  specialties?: string[];
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  insurance?: string[];
  search?: string;
}
