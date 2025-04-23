import { Pool } from '@neondatabase/serverless';

const databaseUrl = process.env.REMOTE_DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: REMOTE_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: true
});

// Test the connection
async function testConnection() {
  try {
    console.log('Testing connection to remote database...');
    console.log(`Database URL: ${databaseUrl.split('@')[1]}`);

    // Check if we can connect
    const result = await pool.query('SELECT NOW() as time');
    console.log(`✅ Connected successfully! Server time: ${result.rows[0].time}`);

    // List all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tables.rows.length > 0) {
      console.log('\n📋 Tables found in database:');
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️ No tables found in database. Run db-setup.js to create them.');
    }

    // Count users if the table exists
    const userTableExists = tables.rows.some(row => row.table_name === 'users');
    if (userTableExists) {
      const users = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`\n👥 Users in database: ${users.rows[0].count}`);
    }

    console.log('\n✅ Connection test complete!');

  } catch (err) {
    console.error('❌ Connection test failed:');
    console.error(err);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection().catch(console.error);