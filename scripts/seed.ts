import { PrismaClient } from '@prisma/client';
import { mockProviders, mockServices, mockReviews } from '../lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in correct order to avoid foreign key constraints)
    console.log('🗑️  Cleaning up existing data...');
    await prisma.waitlist.deleteMany();
    await prisma.rewardRedemption.deleteMany();
    await prisma.loyaltyTransaction.deleteMany();
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.education.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.location.deleteMany();
    await prisma.providerProfile.deleteMany();
    await prisma.customerProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleanup complete');

    // Create test users
    console.log('👥 Creating users...');

    // Create multiple customer users
    const customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = await prisma.user.create({
        data: {
          clerkId: `test_customer_${i}`,
          email: `customer${i}@test.com`,
          firstName: `Customer`,
          lastName: `${i}`,
          role: 'CUSTOMER',
          customerProfile: {
            create: {
              phone: `+1234567890${i}`,
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90001',
              loyaltyPoints: Math.floor(Math.random() * 2000),
              membershipTier: i <= 2 ? 'BRONZE' : i <= 4 ? 'SILVER' : 'GOLD',
              totalSpent: Math.floor(Math.random() * 1000),
            },
          },
        },
        include: {
          customerProfile: true,
        },
      });
      customers.push(customer);
    }

    console.log(`✅ Created ${customers.length} customer users`);

    // Create provider users and profiles
    console.log('🏢 Creating providers...');
    const providers = [];

    for (const mockProvider of mockProviders) {
      const provider = await prisma.user.create({
        data: {
          clerkId: `provider_${mockProvider.id}`,
          email: `provider${mockProvider.id}@test.com`,
          firstName: mockProvider.name.split(' ')[0],
          lastName: mockProvider.name.split(' ').slice(1).join(' '),
          imageUrl: mockProvider.avatar,
          role: 'PROVIDER',
          providerProfile: {
            create: {
              businessName: mockProvider.name,
              title: mockProvider.title,
              bio: mockProvider.bio,
              phone: '+1234567890',
              verified: mockProvider.verified,
              address: mockProvider.location.address,
              city: mockProvider.location.city,
              state: mockProvider.location.state,
              zipCode: mockProvider.location.zipCode,
              experience: mockProvider.experience,
              languages: mockProvider.specialty,
              specialties: mockProvider.specialty,
              priceMin: mockProvider.priceRange.min,
              priceMax: mockProvider.priceRange.max,
              insuranceAccepted: mockProvider.insuranceAccepted,
              averageRating: mockProvider.rating,
              reviewCount: mockProvider.reviewCount,
              education: {
                create: mockProvider.education.map(edu => ({
                  degree: edu.degree,
                  institution: edu.institution,
                  year: edu.year,
                })),
              },
              certifications: {
                create: mockProvider.certifications.map(cert => ({
                  name: cert.name,
                  issuer: cert.issuer,
                  year: cert.year,
                })),
              },
            },
          },
        },
        include: {
          providerProfile: true,
        },
      });

      providers.push(provider);
    }

    console.log(`✅ Created ${providers.length} providers`);

    // Create locations for each provider
    console.log('📍 Creating locations...');
    for (const provider of providers) {
      // Primary location
      await prisma.location.create({
        data: {
          providerId: provider.providerProfile!.id,
          name: 'Main Office',
          address: mockProvider.location?.address || '123 Main St',
          city: mockProvider.location?.city || 'Los Angeles',
          state: mockProvider.location?.state || 'CA',
          zipCode: mockProvider.location?.zipCode || '90001',
          phone: '+1234567890',
          isPrimary: true,
          active: true,
        },
      });

      // Secondary location for some providers
      if (Math.random() > 0.5) {
        await prisma.location.create({
          data: {
            providerId: provider.providerProfile!.id,
            name: 'Downtown Branch',
            address: '456 Downtown Ave',
            city: mockProvider.location?.city || 'Los Angeles',
            state: mockProvider.location?.state || 'CA',
            zipCode: '90002',
            phone: '+1234567891',
            isPrimary: false,
            active: true,
          },
        });
      }
    }

    console.log('✅ Created locations');

    // Create services
    console.log('💅 Creating services...');
    const services = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const servicesToCreate = mockServices.slice(i * 2, i * 2 + 3);

      for (const mockService of servicesToCreate) {
        if (!mockService) continue;

        const service = await prisma.service.create({
          data: {
            providerId: provider.providerProfile!.id,
            name: mockService.name,
            description: mockService.description,
            duration: mockService.duration,
            price: mockService.price,
            category: mockService.category,
            active: true,
          },
        });

        services.push(service);
      }
    }

    console.log(`✅ Created ${services.length} services`);

    // Create staff members for each provider
    console.log('👨‍💼 Creating staff...');
    for (const provider of providers) {
      const staffCount = Math.floor(Math.random() * 3) + 2; // 2-4 staff per provider
      for (let i = 1; i <= staffCount; i++) {
        await prisma.staff.create({
          data: {
            providerId: provider.providerProfile!.id,
            name: `Staff Member ${i}`,
            role: ['Hair Stylist', 'Nail Technician', 'Massage Therapist', 'Esthetician'][i % 4],
            email: `staff${i}@${provider.email}`,
            phone: `+1234567${i}${i}${i}`,
            active: true,
          },
        });
      }
    }

    console.log('✅ Created staff members');

    // Create appointments (past, current, and future)
    console.log('📅 Creating appointments...');
    const statuses = ['COMPLETED', 'CONFIRMED', 'SCHEDULED', 'CANCELLED'];

    for (let i = 0; i < 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const service = services.find(s => s.providerId === provider.providerProfile!.id);

      if (!service) continue;

      const daysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + daysOffset);

      const status = daysOffset < -7 ? 'COMPLETED' : daysOffset < 0 ? 'CANCELLED' : statuses[Math.floor(Math.random() * 2) + 1];

      await prisma.appointment.create({
        data: {
          customerId: customer.id,
          providerId: provider.providerProfile!.id,
          serviceId: service.id,
          date: appointmentDate,
          startTime: '10:00',
          endTime: '11:00',
          status,
          amount: service.price,
          tipAmount: status === 'COMPLETED' ? Math.floor(Math.random() * 20) + 5 : 0,
          paymentStatus: status === 'COMPLETED' ? 'PAID' : status === 'CANCELLED' ? 'REFUNDED' : 'PENDING',
        },
      });
    }

    console.log('✅ Created appointments');

    // Create reviews
    console.log('⭐ Creating reviews...');
    for (const mockReview of mockReviews) {
      const provider = providers.find(
        p => `provider_${mockReview.providerId}` === p.clerkId
      );
      const customer = customers[Math.floor(Math.random() * customers.length)];

      if (provider) {
        await prisma.review.create({
          data: {
            customerId: customer.id,
            providerId: provider.providerProfile!.id,
            rating: mockReview.rating,
            comment: mockReview.comment,
            verified: mockReview.verified,
            helpful: mockReview.helpful,
          },
        });
      }
    }

    console.log(`✅ Created ${mockReviews.length} reviews`);

    // Create loyalty transactions
    console.log('💎 Creating loyalty transactions...');
    for (const customer of customers) {
      if (!customer.customerProfile) continue;

      for (let i = 0; i < 5; i++) {
        await prisma.loyaltyTransaction.create({
          data: {
            customerProfileId: customer.customerProfile.id,
            type: ['EARNED_BOOKING', 'EARNED_REFERRAL', 'BONUS'][Math.floor(Math.random() * 3)] as any,
            points: Math.floor(Math.random() * 100) + 10,
            description: 'Test loyalty transaction',
          },
        });
      }
    }

    console.log('✅ Created loyalty transactions');

    // Create availability (Mon-Fri, 9am-6pm)
    console.log('📅 Creating availability...');
    for (const provider of providers) {
      for (let day = 1; day <= 5; day++) {
        await prisma.availability.create({
          data: {
            providerId: provider.providerProfile!.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '18:00',
            active: true,
          },
        });
      }
    }

    console.log('✅ Created availability schedules');

    // Create some waitlist entries
    console.log('⏳ Creating waitlist entries...');
    for (let i = 0; i < 5; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const service = services.find(s => s.providerId === provider.providerProfile!.id);

      if (service) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1);

        await prisma.waitlist.create({
          data: {
            customerId: customer.id,
            providerId: provider.providerProfile!.id,
            serviceId: service.id,
            date: futureDate,
            flexible: Math.random() > 0.5,
            status: 'ACTIVE',
          },
        });
      }
    }

    console.log('✅ Created waitlist entries');

    // Summary
    console.log('\n🎉 Seed completed successfully!');
    console.log(`
📊 Summary:
  - ${customers.length} customers created
  - ${providers.length} providers created
  - ${services.length} services created
  - ${mockReviews.length} reviews created
  - Staff members created for all providers
  - Locations created for all providers
  - Sample appointments created
  - Loyalty transactions created
  - Waitlist entries created
  - Availability schedules created

🧪 Test Credentials:
  Customers: customer1@test.com through customer5@test.com
  Providers: provider1@test.com through provider${providers.length}@test.com
  Password: (Set by Clerk during sign-up)

💡 You can now test the full application flow!

📝 Next Steps:
  1. Sign up via Clerk with any email
  2. Explore the providers list
  3. Book an appointment
  4. Test cancellation and rescheduling
  5. Leave reviews
  6. Check analytics dashboard (as provider)
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
