// Automatic database setup script
import { config } from 'dotenv';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const connectionString = process.env.POSTGRES_URL_NON_POOLING!;

if (!connectionString) {
  console.error('❌ Missing POSTGRES_URL_NON_POOLING in .env.local');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 BeautyBook Database Setup\n');
  console.log('📡 Connecting to PostgreSQL...');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // For Supabase
    },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Read SQL file
    console.log('📖 Reading schema.sql...');
    const sqlPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log('✅ Schema loaded\n');

    // Execute SQL
    console.log('⚙️  Executing database schema...');
    console.log('   This may take a few seconds...\n');

    await client.query(sql);

    console.log('✅ Database schema created successfully!\n');
    console.log('🎉 Database setup completed!\n');
    console.log('📊 Created tables:');
    console.log('   ✓ users');
    console.log('   ✓ customer_profiles');
    console.log('   ✓ provider_profiles');
    console.log('   ✓ education');
    console.log('   ✓ certifications');
    console.log('   ✓ services');
    console.log('   ✓ appointments');
    console.log('   ✓ reviews');
    console.log('   ✓ favorites');
    console.log('   ✓ availability\n');

    console.log('👥 Inserted sample data:');
    console.log('   ✓ 4 sample users');
    console.log('   ✓ 4 sample providers\n');

    console.log('🌐 Test your API:');
    console.log('   → http://localhost:3001/api/providers\n');

    console.log('✨ Setup complete! You can now start using BeautyBook.\n');

  } catch (error: any) {
    console.error('\n❌ Database setup failed!\n');

    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to database. Please check:');
      console.error('  - Database URL is correct');
      console.error('  - Database server is running');
    } else if (error.code === '42P07') {
      console.log('⚠️  Tables already exist. This is OK!\n');
      console.log('If you want to reset the database, run:');
      console.log('  npm run reset-db\n');
    } else {
      console.error('Error details:', error.message);
    }

    throw error;
  } finally {
    await client.end();
    console.log('👋 Disconnected from database');
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('\n✅ All done! Happy coding! 🎨\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed. Please check the error above.\n');
    process.exit(1);
  });
