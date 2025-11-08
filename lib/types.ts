export interface Provider {
  id: string;
  name: string;
  title: string;
  avatar: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  experience: number; // years
  bio: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  verified: boolean;
  insuranceAccepted: string[];
  languages: string[];
  education: Education[];
  certifications: Certification[];
  nextAvailable?: Date;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
}

export interface Review {
  id: string;
  providerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
  helpful: number;
}

export interface Appointment {
  id: string;
  providerId: string;
  userId: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface FilterOptions {
  specialty: string[];
  rating: number;
  priceRange: [number, number];
  availability: 'today' | 'this-week' | 'any';
  insurance: string[];
  distance: number; // miles
  verified: boolean;
}
