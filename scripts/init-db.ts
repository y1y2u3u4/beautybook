// Database initialization script
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function initDatabase() {
  console.log('🚀 Starting database seed...\n');
  console.log('ℹ️  Note: Please ensure tables are created in Supabase Dashboard first!\n');
  console.log('   Visit: https://supabase.com/dashboard/project/jsyxfclzeiyjalxcwkep\n');

  try {
    // Step 1: Insert sample users
    console.log('📝 Inserting sample users...');
    const sampleUsers = [
      {
        clerk_id: 'user_sample1',
        email: 'sarah.johnson@example.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'PROVIDER',
        image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
      },
      {
        clerk_id: 'user_sample2',
        email: 'emily.rodriguez@example.com',
        first_name: 'Emily',
        last_name: 'Rodriguez',
        role: 'PROVIDER',
        image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
      },
      {
        clerk_id: 'user_sample3',
        email: 'michelle.chen@example.com',
        first_name: 'Michelle',
        last_name: 'Chen',
        role: 'PROVIDER',
        image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michelle'
      },
      {
        clerk_id: 'user_sample4',
        email: 'jessica.williams@example.com',
        first_name: 'Jessica',
        last_name: 'Williams',
        role: 'PROVIDER',
        image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica'
      }
    ];

    const { data: insertedUsers, error: usersInsertError } = await supabase
      .from('users')
      .upsert(sampleUsers, { onConflict: 'clerk_id' })
      .select();

    if (usersInsertError) {
      console.error('Users insert error:', usersInsertError);
    } else {
      console.log(`✅ Inserted ${insertedUsers?.length} sample users\n`);
    }

    // Step 4: Insert sample provider profiles
    console.log('📝 Inserting sample provider profiles...');

    const userIds = insertedUsers?.reduce((acc, user) => {
      acc[user.clerk_id] = user.id;
      return acc;
    }, {} as Record<string, string>) || {};

    const sampleProviders = [
      {
        user_id: userIds['user_sample1'],
        business_name: 'Dr. Sarah Johnson',
        title: 'Licensed Aesthetician & Dermatologist',
        bio: 'Board-certified dermatologist specializing in medical and cosmetic dermatology with over 12 years of experience.',
        phone: '(310) 555-0123',
        verified: true,
        address: '123 Beauty Lane',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        experience: 12,
        languages: ['English', 'Spanish'],
        specialties: ['Facial Treatments', 'Skin Care', 'Anti-Aging'],
        price_min: 150.00,
        price_max: 500.00,
        insurance_accepted: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth'],
        average_rating: 4.9,
        review_count: 342
      },
      {
        user_id: userIds['user_sample2'],
        business_name: 'Emily Rodriguez Hair Studio',
        title: 'Master Hair Stylist',
        bio: 'Award-winning hair stylist specializing in color transformations and modern cuts.',
        phone: '(212) 555-0456',
        verified: true,
        address: '456 Style Street',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        experience: 8,
        languages: ['English'],
        specialties: ['Hair Styling', 'Color Specialist', 'Balayage'],
        price_min: 100.00,
        price_max: 350.00,
        insurance_accepted: [],
        average_rating: 4.8,
        review_count: 256
      },
      {
        user_id: userIds['user_sample3'],
        business_name: 'Zen Wellness Center',
        title: 'Licensed Massage Therapist',
        bio: 'Certified massage therapist with expertise in sports recovery and chronic pain management.',
        phone: '(415) 555-0789',
        verified: true,
        address: '789 Wellness Ave',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94102',
        experience: 10,
        languages: ['English', 'Mandarin'],
        specialties: ['Deep Tissue Massage', 'Sports Massage', 'Therapeutic Massage'],
        price_min: 80.00,
        price_max: 200.00,
        insurance_accepted: ['Aetna', 'Cigna'],
        average_rating: 5.0,
        review_count: 189
      },
      {
        user_id: userIds['user_sample4'],
        business_name: 'Jessica Nails & Spa',
        title: 'Nail Artist & Technician',
        bio: 'Creative nail artist specializing in custom designs and long-lasting gel manicures.',
        phone: '(305) 555-0321',
        verified: true,
        address: '321 Glam Blvd',
        city: 'Miami',
        state: 'FL',
        zip_code: '33101',
        experience: 6,
        languages: ['English'],
        specialties: ['Nail Art', 'Manicure', 'Pedicure'],
        price_min: 50.00,
        price_max: 150.00,
        insurance_accepted: [],
        average_rating: 4.7,
        review_count: 412
      }
    ];

    const { data: insertedProviders, error: providersInsertError } = await supabase
      .from('provider_profiles')
      .upsert(sampleProviders, { onConflict: 'user_id' })
      .select();

    if (providersInsertError) {
      console.error('Providers insert error:', providersInsertError);
    } else {
      console.log(`✅ Inserted ${insertedProviders?.length} sample provider profiles\n`);
    }

    console.log('🎉 Database initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${insertedUsers?.length || 0}`);
    console.log(`   - Providers: ${insertedProviders?.length || 0}`);
    console.log('\n✨ You can now visit http://localhost:3001/api/providers to see the data!\n');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run the initialization
initDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
