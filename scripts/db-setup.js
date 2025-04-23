/**
 * Database migration script for the School Bus Tracking System
 * 
 * This script helps with setting up a remote database by:
 * 1. Creating all required tables
 * 2. Setting up relations between tables
 * 3. Creating initial admin user (if needed)
 * 
 * Usage:
 * 1. Set REMOTE_DATABASE_URL environment variable to your remote database URL
 * 2. Run `node scripts/db-setup.js`
 */

const { Pool } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Check for remote database URL
const databaseUrl = process.env.REMOTE_DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: REMOTE_DATABASE_URL environment variable is not set');
  console.error('Please set this variable to your remote PostgreSQL database connection string');
  console.error('Example: REMOTE_DATABASE_URL=postgres://user:password@hostname:port/database');
  process.exit(1);
}

// Create the database pool
const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: true
});

// Function to create tables
async function createTables() {
  try {
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to remote database successfully');
    
    // Check if users table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('⚠️ Tables already exist in the database');
      const answer = await prompt('Do you want to drop all existing tables and recreate them? (yes/no): ');
      
      if (answer.toLowerCase() === 'yes') {
        await pool.query(`
          DROP TABLE IF EXISTS activity_logs CASCADE;
          DROP TABLE IF EXISTS absences CASCADE;
          DROP TABLE IF EXISTS notifications CASCADE;
          DROP TABLE IF EXISTS locations CASCADE;
          DROP TABLE IF EXISTS round_students CASCADE;
          DROP TABLE IF EXISTS bus_rounds CASCADE;
          DROP TABLE IF EXISTS buses CASCADE;
          DROP TABLE IF EXISTS students CASCADE;
          DROP TABLE IF EXISTS users CASCADE;
          DROP TABLE IF EXISTS session CASCADE;
        `);
        console.log('🗑️  Dropped all existing tables');
      } else {
        console.log('Keeping existing tables');
        return;
      }
    }
    
    // Create tables
    console.log('🔨 Creating database tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        grade VARCHAR(20) NOT NULL,
        parent_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create buses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS buses (
        id SERIAL PRIMARY KEY,
        bus_number VARCHAR(20) NOT NULL,
        license_number VARCHAR(20) NOT NULL,
        capacity INTEGER NOT NULL,
        driver_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create bus_rounds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bus_rounds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        start_time VARCHAR(20) NOT NULL,
        end_time VARCHAR(20) NOT NULL,
        bus_id INTEGER REFERENCES buses(id),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create round_students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS round_students (
        id SERIAL PRIMARY KEY,
        round_id INTEGER REFERENCES bus_rounds(id),
        student_id INTEGER REFERENCES students(id),
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        bus_id INTEGER REFERENCES buses(id),
        latitude VARCHAR(20) NOT NULL,
        longitude VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        related_student_id INTEGER REFERENCES students(id),
        related_round_id INTEGER REFERENCES bus_rounds(id),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create absences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS absences (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        date DATE NOT NULL,
        reason TEXT,
        reported_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create activity_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        description TEXT,
        entity_type VARCHAR(50),
        entity_id INTEGER,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create session table for authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);
    
    console.log('✅ All tables created successfully');
    
    // Create admin user
    const adminExists = await pool.query(`
      SELECT * FROM users WHERE username = 'admin2'
    `);
    
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await pool.query(`
        INSERT INTO users (username, password, email, full_name, role)
        VALUES ('admin2', $1, 'admin2@school.edu', 'School Administrator', 'admin')
      `, [hashedPassword]);
      
      console.log('✅ Admin user created (username: admin2, password: password)');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    console.log('\n🎉 Database setup complete! You can now use the remote database.\n');
    console.log('To connect your application to this database:');
    console.log('1. Set the REMOTE_DATABASE_URL environment variable in your application');
    console.log('2. Restart your application');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
}

// Helper function to get user input
function prompt(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
}

// Execute the setup
createTables().catch(console.error);