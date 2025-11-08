// Database setup using Supabase client
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 BeautyBook Database Setup via Supabase\n');

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Read SQL file
    console.log('📖 Reading schema.sql...');
    const sqlPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log('✅ Schema loaded\n');

    console.log('⚙️  Executing database setup...\n');
    console.log('   Note: We\'ll execute this via SQL statements\n');

    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';

      // Skip comments
      if (stmt.trim().startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });

        if (error) {
          // Check if it's an "already exists" error - that's OK
          if (error.message.includes('already exists') || error.code === '42P07') {
            console.log(`⚠️  Statement ${i + 1}/${statements.length}: Already exists (skipping)`);
            skipCount++;
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length}: ${error.message}`);
          }
        } else {
          successCount++;
          if (i % 5 === 0) {
            console.log(`✅ Progress: ${i + 1}/${statements.length} statements`);
          }
        }
      } catch (err: any) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Skipped: ${skipCount}`);
    console.log(`   📝 Total: ${statements.length}\n`);

    console.log('✨ Checking if data was inserted...\n');

    // Check if providers exist
    const { data: providers, error: providerError } = await supabase
      .from('provider_profiles')
      .select('*')
      .limit(10);

    if (!providerError && providers && providers.length > 0) {
      console.log('🎉 Database setup completed successfully!\n');
      console.log(`👥 Found ${providers.length} providers in database\n`);
      console.log('🌐 Test your API:');
      console.log('   → http://localhost:3001/api/providers\n');
    } else {
      console.log('⚠️  Setup completed but no data found.');
      console.log('   You may need to manually execute the SQL in Supabase Dashboard\n');
    }

  } catch (error: any) {
    console.error('\n❌ Database setup failed!');
    console.error('Error:', error.message);
    throw error;
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
    console.error('📝 Alternative: Copy the SQL from lib/db/schema.sql');
    console.error('   and run it manually in Supabase Dashboard SQL Editor\n');
    process.exit(1);
  });
