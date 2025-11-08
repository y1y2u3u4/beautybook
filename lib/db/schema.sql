-- BeautyBook Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'PROVIDER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Customer profiles
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  medical_history JSONB,
  allergies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Provider profiles
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  phone TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,

  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Professional info
  experience INTEGER DEFAULT 0,
  languages TEXT[],
  specialties TEXT[],

  -- Pricing
  price_min DECIMAL(10, 2) NOT NULL,
  price_max DECIMAL(10, 2) NOT NULL,

  -- Insurance
  insurance_accepted TEXT[],

  -- Ratings
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Business hours
  business_hours JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Education
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Certifications
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year INTEGER NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),

  -- Appointment details
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT,

  -- Payment
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'FAILED')),
  payment_id TEXT,

  -- Calendar integration
  google_event_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, provider_id)
);

-- Availability
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_provider_profiles_city ON provider_profiles(city);
CREATE INDEX idx_provider_profiles_state ON provider_profiles(state);
CREATE INDEX idx_provider_profiles_verified ON provider_profiles(verified);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_services_provider_id ON services(provider_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (clerk_id, email, first_name, last_name, role, image_url) VALUES
  ('user_sample1', 'sarah.johnson@example.com', 'Sarah', 'Johnson', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('user_sample2', 'emily.rodriguez@example.com', 'Emily', 'Rodriguez', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'),
  ('user_sample3', 'michelle.chen@example.com', 'Michelle', 'Chen', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michelle'),
  ('user_sample4', 'jessica.williams@example.com', 'Jessica', 'Williams', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica')
ON CONFLICT (clerk_id) DO NOTHING;

-- Get the inserted user IDs for foreign key references
DO $$
DECLARE
  user_id_1 UUID;
  user_id_2 UUID;
  user_id_3 UUID;
  user_id_4 UUID;
BEGIN
  SELECT id INTO user_id_1 FROM users WHERE clerk_id = 'user_sample1';
  SELECT id INTO user_id_2 FROM users WHERE clerk_id = 'user_sample2';
  SELECT id INTO user_id_3 FROM users WHERE clerk_id = 'user_sample3';
  SELECT id INTO user_id_4 FROM users WHERE clerk_id = 'user_sample4';

  -- Insert provider profiles
  INSERT INTO provider_profiles (user_id, business_name, title, bio, phone, verified, address, city, state, zip_code, experience, languages, specialties, price_min, price_max, insurance_accepted, average_rating, review_count) VALUES
    (user_id_1, 'Dr. Sarah Johnson', 'Licensed Aesthetician & Dermatologist', 'Board-certified dermatologist specializing in medical and cosmetic dermatology with over 12 years of experience.', '(310) 555-0123', TRUE, '123 Beauty Lane', 'Los Angeles', 'CA', '90001', 12, ARRAY['English', 'Spanish'], ARRAY['Facial Treatments', 'Skin Care', 'Anti-Aging'], 150.00, 500.00, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth'], 4.9, 342),
    (user_id_2, 'Emily Rodriguez Hair Studio', 'Master Hair Stylist', 'Award-winning hair stylist specializing in color transformations and modern cuts.', '(212) 555-0456', TRUE, '456 Style Street', 'New York', 'NY', '10001', 8, ARRAY['English'], ARRAY['Hair Styling', 'Color Specialist', 'Balayage'], 100.00, 350.00, ARRAY[]::TEXT[], 4.8, 256),
    (user_id_3, 'Zen Wellness Center', 'Licensed Massage Therapist', 'Certified massage therapist with expertise in sports recovery and chronic pain management.', '(415) 555-0789', TRUE, '789 Wellness Ave', 'San Francisco', 'CA', '94102', 10, ARRAY['English', 'Mandarin'], ARRAY['Deep Tissue Massage', 'Sports Massage', 'Therapeutic Massage'], 80.00, 200.00, ARRAY['Aetna', 'Cigna'], 5.0, 189),
    (user_id_4, 'Jessica Nails & Spa', 'Nail Artist & Technician', 'Creative nail artist specializing in custom designs and long-lasting gel manicures.', '(305) 555-0321', TRUE, '321 Glam Blvd', 'Miami', 'FL', '33101', 6, ARRAY['English'], ARRAY['Nail Art', 'Manicure', 'Pedicure'], 50.00, 150.00, ARRAY[]::TEXT[], 4.7, 412)
  ON CONFLICT (user_id) DO NOTHING;
END $$;
