// @ts-ignore
import { Client } from 'pg';
import { hashPassword } from '../src/lib/security';

async function seedSuperAdmin() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'svG6PdUV7X4Vfedr';
  const connectionString = `postgresql://postgres.eyrbndkelwcrevreopjg:${encodeURIComponent(dbPassword)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase DB to seed Super Admin...');

    const email = '29sandesh.agrawal@gmail.com';
    const password = 'Sejal_2912';
    const passwordHash = await hashPassword(password);

    // Upsert super admin record
    await client.query(`
      INSERT INTO platform_users (id, email, password_hash, name, role, is_active)
      VALUES (gen_random_uuid(), $1, $2, 'Sandesh Agrawal', 'super_admin', true)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $2, role = 'super_admin', is_active = true;
    `, [email, passwordHash]);

    console.log(`✅ Super Admin (${email}) successfully seeded in Supabase platform_users table!`);
  } catch (err: any) {
    console.error('Error seeding Super Admin:', err.message);
  } finally {
    await client.end();
  }
}

seedSuperAdmin().catch(console.error);
