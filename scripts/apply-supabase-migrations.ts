// @ts-ignore
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('Connecting to Supabase PostgreSQL...');

  const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'svG6PdUV7X4Vfedr';
  const projectRef = 'eyrbndkelwcrevreopjg';

  // Supabase direct connection strings (Mumbai region ap-south-1)
  const connectionStrings = [
    `postgresql://postgres.eyrbndkelwcrevreopjg:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.eyrbndkelwcrevreopjg:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.eyrbndkelwcrevreopjg.supabase.co:5432/postgres`,
  ];

  let client: Client | null = null;
  let connected = false;

  for (const connStr of connectionStrings) {
    try {
      console.log(`Trying connection: ${connStr.replace(dbPassword, '*****')}`);
      client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      connected = true;
      console.log('✅ Successfully connected to Supabase PostgreSQL!');
      break;
    } catch (err: any) {
      console.warn(`Connection attempt failed: ${err.message}`);
      if (client) {
        try { await client.end(); } catch {}
      }
    }
  }

  if (!connected || !client) {
    console.error('❌ Could not connect directly to Supabase via pooler.');
    console.log('Please run the migration SQL scripts inside the Supabase SQL Editor.');
    process.exit(1);
  }

  try {
    const migrationFiles = [
      'supabase/migrations/001_core_tables.sql',
      'supabase/migrations/002_cafe_data_tables.sql',
      'supabase/migrations/003_rls_policies.sql',
      'supabase/migrations/004_customer_platform.sql',
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`Running migration: ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf-8');
        await client.query(sql);
        console.log(`✅ ${file} applied successfully!`);
      }
    }

    console.log('\n🎉 ALL SUPABASE MIGRATIONS COMPLETED SUCCESSFULLY! 🎉');
  } catch (err: any) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations().catch(console.error);
