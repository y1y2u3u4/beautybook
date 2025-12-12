import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.service.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.cancellationRule.deleteMany();
  await prisma.education.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log('👤 Creating users...');

  // Customer user
  const customer1 = await prisma.user.create({
    data: {
      clerkId: 'user_test_customer_001',
      email: 'customer@test.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      clerkId: 'user_test_customer_002',
      email: 'mike@test.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      role: 'CUSTOMER',
    },
  });

  // Provider users
  const providerUser1 = await prisma.user.create({
    data: {
      clerkId: 'user_test_provider_001',
      email: 'emma@beautysalon.com',
      firstName: 'Emma',
      lastName: 'Davis',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      role: 'PROVIDER',
    },
  });

  const providerUser2 = await prisma.user.create({
    data: {
      clerkId: 'user_test_provider_002',
      email: 'james@hairmaster.com',
      firstName: 'James',
      lastName: 'Chen',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      role: 'PROVIDER',
    },
  });

  const providerUser3 = await prisma.user.create({
    data: {
      clerkId: 'user_test_provider_003',
      email: 'lisa@nailart.com',
      firstName: 'Lisa',
      lastName: 'Martinez',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      role: 'PROVIDER',
    },
  });

  // Create customer profiles
  console.log('📋 Creating customer profiles...');
  await prisma.customerProfile.create({
    data: {
      userId: customer1.id,
      phone: '+1-555-0101',
      address: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
  });

  await prisma.customerProfile.create({
    data: {
      userId: customer2.id,
      phone: '+1-555-0102',
      address: '456 Oak Ave',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
  });

  // Create provider profiles
  console.log('🏪 Creating provider profiles...');
  const provider1 = await prisma.providerProfile.create({
    data: {
      userId: providerUser1.id,
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
    },
  });

  const provider2 = await prisma.providerProfile.create({
    data: {
      userId: providerUser2.id,
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
    },
  });

  const provider3 = await prisma.providerProfile.create({
    data: {
      userId: providerUser3.id,
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
    },
  });

  // Create services for each provider
  console.log('💅 Creating services...');

  // Provider 1 services (Beauty Studio)
  const service1_1 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      name: 'Classic Facial',
      description: 'A relaxing facial treatment that cleanses, exfoliates, and hydrates your skin. Perfect for maintaining healthy, glowing skin.',
      duration: 60,
      price: 85,
      category: 'Facial',
      active: true,
    },
  });

  const service1_2 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      name: 'Anti-Aging Facial',
      description: 'Advanced facial treatment targeting fine lines and wrinkles using premium anti-aging products and techniques.',
      duration: 90,
      price: 150,
      category: 'Facial',
      active: true,
    },
  });

  const service1_3 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      name: 'Bridal Makeup',
      description: 'Complete bridal makeup service including consultation, trial, and day-of application. Look stunning on your special day!',
      duration: 120,
      price: 250,
      category: 'Makeup',
      active: true,
    },
  });

  const service1_4 = await prisma.service.create({
    data: {
      providerId: provider1.id,
      name: 'Evening Makeup',
      description: 'Glamorous makeup application perfect for special events, parties, or a night out.',
      duration: 60,
      price: 95,
      category: 'Makeup',
      active: true,
    },
  });

  // Provider 2 services (Hair Master)
  const service2_1 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      name: 'Haircut & Style',
      description: 'Professional haircut including consultation, wash, cut, and style. Tailored to your face shape and lifestyle.',
      duration: 45,
      price: 65,
      category: 'Hair Cutting',
      active: true,
    },
  });

  const service2_2 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      name: 'Full Color',
      description: 'Complete hair coloring service including consultation, application, and styling. Achieve your dream hair color!',
      duration: 120,
      price: 150,
      category: 'Hair Coloring',
      active: true,
    },
  });

  const service2_3 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      name: 'Balayage',
      description: 'Hand-painted highlighting technique for a natural, sun-kissed look. Low maintenance and beautifully blended.',
      duration: 180,
      price: 250,
      category: 'Hair Coloring',
      active: true,
    },
  });

  const service2_4 = await prisma.service.create({
    data: {
      providerId: provider2.id,
      name: 'Blowout',
      description: 'Professional blow-dry and styling service. Perfect for events or when you want to look your best.',
      duration: 30,
      price: 45,
      category: 'Hair Styling',
      active: true,
    },
  });

  // Provider 3 services (Nail Art)
  const service3_1 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      name: 'Classic Manicure',
      description: 'Traditional manicure including nail shaping, cuticle care, hand massage, and polish application.',
      duration: 30,
      price: 30,
      category: 'Manicure',
      active: true,
    },
  });

  const service3_2 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      name: 'Gel Manicure',
      description: 'Long-lasting gel polish manicure that stays chip-free for up to 2 weeks. Includes cuticle care and hand massage.',
      duration: 45,
      price: 50,
      category: 'Manicure',
      active: true,
    },
  });

  const service3_3 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      name: 'Spa Pedicure',
      description: 'Luxurious pedicure experience including foot soak, exfoliation, mask, massage, and polish.',
      duration: 60,
      price: 65,
      category: 'Pedicure',
      active: true,
    },
  });

  const service3_4 = await prisma.service.create({
    data: {
      providerId: provider3.id,
      name: 'Nail Art Design',
      description: 'Custom nail art designs. From simple accents to elaborate designs, express your personality through your nails!',
      duration: 60,
      price: 40,
      category: 'Nail Art',
      active: true,
    },
  });

  // Create availability for providers
  console.log('📅 Creating availability...');
  const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday

  for (const day of daysOfWeek) {
    await prisma.availability.create({
      data: {
        providerId: provider1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        active: true,
      },
    });

    await prisma.availability.create({
      data: {
        providerId: provider2.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '19:00',
        active: true,
      },
    });

    await prisma.availability.create({
      data: {
        providerId: provider3.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        active: true,
      },
    });
  }

  // Saturday availability
  await prisma.availability.create({
    data: { providerId: provider1.id, dayOfWeek: 6, startTime: '10:00', endTime: '16:00', active: true },
  });
  await prisma.availability.create({
    data: { providerId: provider2.id, dayOfWeek: 6, startTime: '09:00', endTime: '18:00', active: true },
  });
  await prisma.availability.create({
    data: { providerId: provider3.id, dayOfWeek: 6, startTime: '10:00', endTime: '17:00', active: true },
  });

  // Create reviews
  console.log('⭐ Creating reviews...');
  await prisma.review.createMany({
    data: [
      {
        customerId: customer1.id,
        providerId: provider1.id,
        rating: 5,
        comment: 'Emma is amazing! My skin has never looked better after her facial treatment. Highly recommend!',
        verified: true,
      },
      {
        customerId: customer2.id,
        providerId: provider1.id,
        rating: 5,
        comment: 'Best makeup artist in LA! She did my wedding makeup and I looked absolutely stunning.',
        verified: true,
      },
      {
        customerId: customer1.id,
        providerId: provider2.id,
        rating: 5,
        comment: 'James is a true hair master. He understood exactly what I wanted and delivered beyond my expectations.',
        verified: true,
      },
      {
        customerId: customer2.id,
        providerId: provider2.id,
        rating: 4,
        comment: 'Great haircut! The salon is very clean and professional. Will definitely come back.',
        verified: true,
      },
      {
        customerId: customer1.id,
        providerId: provider3.id,
        rating: 5,
        comment: 'Lisa is so talented! The nail art she created was exactly what I envisioned. Love it!',
        verified: true,
      },
      {
        customerId: customer2.id,
        providerId: provider3.id,
        rating: 4,
        comment: 'Great pedicure experience. Very relaxing and my nails look perfect.',
        verified: true,
      },
    ],
  });

  // Create some appointments
  console.log('📆 Creating appointments...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.appointment.create({
    data: {
      customerId: customer1.id,
      providerId: provider1.id,
      serviceId: service1_1.id,
      date: tomorrow,
      startTime: '10:00',
      endTime: '11:00',
      status: 'CONFIRMED',
      amount: 85,
      paymentStatus: 'PENDING',
      cancellationPolicy: 'STANDARD',
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: customer2.id,
      providerId: provider2.id,
      serviceId: service2_1.id,
      date: tomorrow,
      startTime: '14:00',
      endTime: '14:45',
      status: 'SCHEDULED',
      amount: 65,
      paymentStatus: 'PENDING',
      cancellationPolicy: 'MODERATE',
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: customer1.id,
      providerId: provider3.id,
      serviceId: service3_2.id,
      date: nextWeek,
      startTime: '11:00',
      endTime: '11:45',
      status: 'SCHEDULED',
      amount: 50,
      paymentStatus: 'PENDING',
      cancellationPolicy: 'FLEXIBLE',
    },
  });

  // Create a completed appointment for review purposes
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  await prisma.appointment.create({
    data: {
      customerId: customer1.id,
      providerId: provider1.id,
      serviceId: service1_1.id,
      date: lastWeek,
      startTime: '14:00',
      endTime: '15:00',
      status: 'COMPLETED',
      amount: 85,
      paymentStatus: 'PAID',
      cancellationPolicy: 'STANDARD',
    },
  });

  // Create education records
  console.log('🎓 Creating education records...');
  await prisma.education.createMany({
    data: [
      { providerId: provider1.id, degree: 'Esthetician License', institution: 'California Board of Barbering and Cosmetology', year: 2013 },
      { providerId: provider1.id, degree: 'Makeup Artistry Certification', institution: 'MAC Pro Training', year: 2015 },
      { providerId: provider2.id, degree: 'Master Barber License', institution: 'Paul Mitchell Schools', year: 2008 },
      { providerId: provider2.id, degree: 'Advanced Color Specialist', institution: 'L\'Oréal Professionnel', year: 2012 },
      { providerId: provider3.id, degree: 'Nail Technician License', institution: 'California Board of Barbering and Cosmetology', year: 2015 },
    ],
  });

  // Create certifications
  console.log('📜 Creating certifications...');
  await prisma.certification.createMany({
    data: [
      { providerId: provider1.id, name: 'Advanced Facial Techniques', issuer: 'Dermalogica', year: 2020 },
      { providerId: provider1.id, name: 'Bridal Makeup Specialist', issuer: 'Bobbi Brown', year: 2018 },
      { providerId: provider2.id, name: 'Balayage Master', issuer: 'Wella Professionals', year: 2019 },
      { providerId: provider3.id, name: 'Gel Nail Art Certification', issuer: 'OPI Academy', year: 2021 },
    ],
  });

  // Create cancellation rules
  console.log('📋 Creating cancellation rules...');
  await prisma.cancellationRule.createMany({
    data: [
      { providerId: provider1.id, policy: 'STANDARD', hoursBeforeAppt: 24, feePercentage: 50, active: true },
      { providerId: provider2.id, policy: 'MODERATE', hoursBeforeAppt: 12, feePercentage: 25, active: true },
      { providerId: provider3.id, policy: 'FLEXIBLE', hoursBeforeAppt: 2, feePercentage: 0, active: true },
    ],
  });

  // Create favorites
  console.log('❤️ Creating favorites...');
  await prisma.favorite.createMany({
    data: [
      { userId: customer1.id, providerId: provider1.id },
      { userId: customer1.id, providerId: provider3.id },
      { userId: customer2.id, providerId: provider2.id },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Users: 5 (2 customers, 3 providers)`);
  console.log(`   - Provider Profiles: 3`);
  console.log(`   - Services: 12`);
  console.log(`   - Reviews: 6`);
  console.log(`   - Appointments: 4`);
  console.log(`   - Availability slots: 18`);
  console.log('');
  console.log('🔐 Test Accounts:');
  console.log('   Customer: customer@test.com');
  console.log('   Provider 1: emma@beautysalon.com (Glow Beauty Studio)');
  console.log('   Provider 2: james@hairmaster.com (James Hair Master)');
  console.log('   Provider 3: lisa@nailart.com (Nail Art Paradise)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
