# ⚡ BeautyBook 一键设置指南

## 🎯 3步完成数据库设置（5分钟）

### 第1步：打开 Supabase SQL Editor

**点击这个链接**: [Supabase SQL Editor](https://supabase.com/dashboard/project/jsyxfclzeiyjalxcwkep/sql/new)

或者手动访问：
1. 打开 https://supabase.com/dashboard
2. 选择项目 `jsyxfclzeiyjalxcwkep`
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **+ New query**

### 第2步：复制并执行 SQL

复制下面的完整 SQL 代码，粘贴到 SQL Editor，然后点击 **Run** 或按 `Cmd/Ctrl + Enter`：

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if any (optional, only if you need to reset)
-- DROP TABLE IF EXISTS availability CASCADE;
-- DROP TABLE IF EXISTS favorites CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS appointments CASCADE;
-- DROP TABLE IF EXISTS services CASCADE;
-- DROP TABLE IF EXISTS certifications CASCADE;
-- DROP TABLE IF EXISTS education CASCADE;
-- DROP TABLE IF EXISTS provider_profiles CASCADE;
-- DROP TABLE IF EXISTS customer_profiles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS customer_profiles (
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
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  phone TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  experience INTEGER DEFAULT 0,
  languages TEXT[],
  specialties TEXT[],
  price_min DECIMAL(10, 2) NOT NULL,
  price_max DECIMAL(10, 2) NOT NULL,
  insurance_accepted TEXT[],
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  business_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Education
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year INTEGER NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'FAILED')),
  payment_id TEXT,
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
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
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, provider_id)
);

-- Availability
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_city ON provider_profiles(city);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_state ON provider_profiles(state);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_verified ON provider_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);

-- Insert sample data
INSERT INTO users (clerk_id, email, first_name, last_name, role, image_url) VALUES
  ('user_sample1', 'sarah.johnson@example.com', 'Sarah', 'Johnson', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('user_sample2', 'emily.rodriguez@example.com', 'Emily', 'Rodriguez', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'),
  ('user_sample3', 'michelle.chen@example.com', 'Michelle', 'Chen', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michelle'),
  ('user_sample4', 'jessica.williams@example.com', 'Jessica', 'Williams', 'PROVIDER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica')
ON CONFLICT (clerk_id) DO NOTHING;

-- Insert provider profiles
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

  INSERT INTO provider_profiles (user_id, business_name, title, bio, phone, verified, address, city, state, zip_code, experience, languages, specialties, price_min, price_max, insurance_accepted, average_rating, review_count) VALUES
    (user_id_1, 'Dr. Sarah Johnson', 'Licensed Aesthetician & Dermatologist', 'Board-certified dermatologist specializing in medical and cosmetic dermatology with over 12 years of experience.', '(310) 555-0123', TRUE, '123 Beauty Lane', 'Los Angeles', 'CA', '90001', 12, ARRAY['English', 'Spanish'], ARRAY['Facial Treatments', 'Skin Care', 'Anti-Aging'], 150.00, 500.00, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth'], 4.9, 342),
    (user_id_2, 'Emily Rodriguez Hair Studio', 'Master Hair Stylist', 'Award-winning hair stylist specializing in color transformations and modern cuts.', '(212) 555-0456', TRUE, '456 Style Street', 'New York', 'NY', '10001', 8, ARRAY['English'], ARRAY['Hair Styling', 'Color Specialist', 'Balayage'], 100.00, 350.00, ARRAY[]::TEXT[], 4.8, 256),
    (user_id_3, 'Zen Wellness Center', 'Licensed Massage Therapist', 'Certified massage therapist with expertise in sports recovery and chronic pain management.', '(415) 555-0789', TRUE, '789 Wellness Ave', 'San Francisco', 'CA', '94102', 10, ARRAY['English', 'Mandarin'], ARRAY['Deep Tissue Massage', 'Sports Massage', 'Therapeutic Massage'], 80.00, 200.00, ARRAY['Aetna', 'Cigna'], 5.0, 189),
    (user_id_4, 'Jessica Nails & Spa', 'Nail Artist & Technician', 'Creative nail artist specializing in custom designs and long-lasting gel manicures.', '(305) 555-0321', TRUE, '321 Glam Blvd', 'Miami', 'FL', '33101', 6, ARRAY['English'], ARRAY['Nail Art', 'Manicure', 'Pedicure'], 50.00, 150.00, ARRAY[]::TEXT[], 4.7, 412)
  ON CONFLICT (user_id) DO NOTHING;
END $$;
```

### 第3步：验证数据

执行完成后，点击左侧的 **Table Editor**，选择 `provider_profiles` 表，你应该能看到 4 个提供者数据！

## ✅ 完成！

现在访问以下链接测试：

- **API 测试**: http://localhost:3001/api/providers
- **网站首页**: http://localhost:3001
- **搜索页面**: http://localhost:3001/providers

你应该能看到：
- ✅ 4 个示例提供者
- ✅ 完整的资料信息
- ✅ 精美的渐变 UI
- ✅ 玻璃拟态效果

## 🎉 恭喜！

数据库设置完成！现在你可以开始：

1. **浏览提供者列表** - 查看所有美容专业人员
2. **查看详情页** - 点击任何提供者查看完整资料
3. **测试预约流程** - 体验完整的预订功能

## 📝 下一步

- [ ] 集成 Clerk 用户认证
- [ ] 连接真实 API 到前端
- [ ] 实现预约功能
- [ ] 集成 Stripe 支付

---

**遇到问题？** 查看 `DATABASE_SETUP.md` 获取详细帮助。
