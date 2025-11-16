/**
 * Seed test data for development
 * Creates test users, providers, and services
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create test customer user
  const testCustomer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      clerkId: 'test_customer_123',
      email: 'customer@test.com',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'CUSTOMER',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer',
    },
  });
  console.log('✅ Created test customer:', testCustomer.email);

  // Create test provider users
  const testProvider1 = await prisma.user.upsert({
    where: { email: 'provider1@test.com' },
    update: {},
    create: {
      clerkId: 'test_provider_1',
      email: 'provider1@test.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'PROVIDER',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
  });
  console.log('✅ Created test provider:', testProvider1.email);

  const testProvider2 = await prisma.user.upsert({
    where: { email: 'provider2@test.com' },
    update: {},
    create: {
      clerkId: 'test_provider_2',
      email: 'provider2@test.com',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      role: 'PROVIDER',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
  });
  console.log('✅ Created test provider:', testProvider2.email);

  // Create provider profiles
  const providerProfile1 = await prisma.providerProfile.upsert({
    where: { userId: testProvider1.id },
    update: {},
    create: {
      userId: testProvider1.id,
      businessName: 'Radiant Skin Clinic',
      title: 'Licensed Aesthetician & Dermatologist',
      bio: 'Board-certified dermatologist specializing in medical and cosmetic dermatology with over 12 years of experience. Passionate about helping clients achieve healthy, glowing skin.',
      phone: '(310) 555-0123',
      verified: true,
      address: '123 Beauty Lane',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      experience: 12,
      languages: ['English', 'Spanish'],
      specialties: ['Facial Treatments', 'Skin Care', 'Anti-Aging', 'Acne Treatment'],
      priceMin: 150.00,
      priceMax: 500.00,
      insuranceAccepted: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth'],
      averageRating: 4.9,
      reviewCount: 342,
    },
  });
  console.log('✅ Created provider profile:', providerProfile1.businessName);

  const providerProfile2 = await prisma.providerProfile.upsert({
    where: { userId: testProvider2.id },
    update: {},
    create: {
      userId: testProvider2.id,
      businessName: 'Emily Rodriguez Hair Studio',
      title: 'Master Hair Stylist',
      bio: 'Award-winning hair stylist specializing in color transformations and modern cuts. 8 years of experience making clients look and feel amazing.',
      phone: '(212) 555-0456',
      verified: true,
      address: '456 Style Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      experience: 8,
      languages: ['English'],
      specialties: ['Hair Styling', 'Color Specialist', 'Balayage', 'Highlights'],
      priceMin: 100.00,
      priceMax: 350.00,
      insuranceAccepted: [],
      averageRating: 4.8,
      reviewCount: 256,
    },
  });
  console.log('✅ Created provider profile:', providerProfile2.businessName);

  // Create services for provider 1
  const services1 = await prisma.service.createMany({
    data: [
      {
        providerId: providerProfile1.id,
        name: 'Hydrating Facial',
        description: 'Deep cleansing and hydrating facial treatment for all skin types',
        duration: 60,
        price: 150.00,
        category: 'Facial',
        active: true,
      },
      {
        providerId: providerProfile1.id,
        name: 'Anti-Aging Treatment',
        description: 'Advanced anti-aging treatment with peptides and retinol',
        duration: 90,
        price: 300.00,
        category: 'Facial',
        active: true,
      },
      {
        providerId: providerProfile1.id,
        name: 'Chemical Peel',
        description: 'Professional chemical peel for skin rejuvenation',
        duration: 45,
        price: 250.00,
        category: 'Skin Treatment',
        active: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created services for provider 1:', services1.count);

  // Create services for provider 2
  const services2 = await prisma.service.createMany({
    data: [
      {
        providerId: providerProfile2.id,
        name: 'Haircut & Style',
        description: 'Professional haircut and styling consultation',
        duration: 60,
        price: 100.00,
        category: 'Hair',
        active: true,
      },
      {
        providerId: providerProfile2.id,
        name: 'Full Color & Highlights',
        description: 'Complete color transformation with highlights',
        duration: 180,
        price: 350.00,
        category: 'Hair',
        active: true,
      },
      {
        providerId: providerProfile2.id,
        name: 'Balayage',
        description: 'Hand-painted highlights for natural-looking dimension',
        duration: 150,
        price: 300.00,
        category: 'Hair',
        active: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created services for provider 2:', services2.count);

  // Create availability for providers
  const availability1 = await prisma.availability.createMany({
    data: [
      // Monday - Friday: 9 AM - 5 PM
      { providerId: providerProfile1.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', active: true },
      { providerId: providerProfile1.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', active: true },
      { providerId: providerProfile1.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00', active: true },
      { providerId: providerProfile1.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00', active: true },
      { providerId: providerProfile1.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00', active: true },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created availability for provider 1');

  const availability2 = await prisma.availability.createMany({
    data: [
      // Tuesday - Saturday: 10 AM - 7 PM
      { providerId: providerProfile2.id, dayOfWeek: 2, startTime: '10:00', endTime: '19:00', active: true },
      { providerId: providerProfile2.id, dayOfWeek: 3, startTime: '10:00', endTime: '19:00', active: true },
      { providerId: providerProfile2.id, dayOfWeek: 4, startTime: '10:00', endTime: '19:00', active: true },
      { providerId: providerProfile2.id, dayOfWeek: 5, startTime: '10:00', endTime: '19:00', active: true },
      { providerId: providerProfile2.id, dayOfWeek: 6, startTime: '10:00', endTime: '19:00', active: true },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created availability for provider 2');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Test Accounts Created:');
  console.log('   Customer: customer@test.com (password: set in Clerk)');
  console.log('   Provider 1: provider1@test.com (Sarah Johnson)');
  console.log('   Provider 2: provider2@test.com (Emily Rodriguez)\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
