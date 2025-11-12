import { PrismaClient } from '@prisma/client';
import { mockProviders, mockServices, mockReviews } from '../lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🗑️  Cleaning up existing data...');
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.service.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.education.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.providerProfile.deleteMany();
    await prisma.customerProfile.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleanup complete');

    // Create test users
    console.log('👥 Creating users...');

    // Create customer users
    const customerUser = await prisma.user.create({
      data: {
        clerkId: 'test_customer_1',
        email: 'customer@test.com',
        firstName: 'Test',
        lastName: 'Customer',
        role: 'CUSTOMER',
        customerProfile: {
          create: {
            phone: '+1234567890',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
          },
        },
      },
    });

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
              languages: mockProvider.specialty, // Using specialty as languages for now
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

    // Create services
    console.log('💅 Creating services...');
    const services = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      // Assign 2-3 services per provider
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

    // Create reviews
    console.log('⭐ Creating reviews...');

    for (const mockReview of mockReviews) {
      const provider = providers.find(
        p => `provider_${mockReview.providerId}` === p.clerkId
      );

      if (provider) {
        await prisma.review.create({
          data: {
            customerId: customerUser.id,
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

    // Create availability (Mon-Fri, 9am-6pm)
    console.log('📅 Creating availability...');

    for (const provider of providers) {
      for (let day = 1; day <= 5; day++) {
        // Monday to Friday
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

    // Summary
    console.log('\n🎉 Seed completed successfully!');
    console.log(`
📊 Summary:
  - ${providers.length} providers created
  - ${services.length} services created
  - ${mockReviews.length} reviews created
  - Availability schedules created for all providers

🧪 Test Credentials:
  Customer: customer@test.com
  Provider: provider1@test.com (and provider2, provider3, etc.)

💡 You can now test the application with real data!
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
