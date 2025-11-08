// Direct database setup with better SSL handling
import { config } from 'dotenv';
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 BeautyBook Database Setup (Direct Connection)\n');

  // Use direct database host, not pooler
  const client = new Client({
    host: 'db.jsyxfclzeiyjalxcwkep.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres.jsyxfclzeiyjalxcwkep',
    password: '531MQFYrbLwqBmTH',
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('📡 Connecting to PostgreSQL...');
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

    // Verify data
    const { rows } = await client.query('SELECT COUNT(*) FROM provider_profiles');
    console.log(`👥 Found ${rows[0].count} providers in database\n`);

    console.log('🌐 Test your API:');
    console.log('   → http://localhost:3001/api/providers\n');

  } catch (error: any) {
    console.error('\n❌ Database setup failed!\n');

    if (error.code === '42P07') {
      console.log('⚠️  Tables already exist. This is OK!');
      console.log('   Data should already be in the database.\n');
    } else {
      console.error('Error:', error.message);
      console.error('Code:', error.code);
    }

    throw error;
  } finally {
    await client.end();
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('✅ All done! 🎨\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup failed.\n');
    process.exit(1);
  });
