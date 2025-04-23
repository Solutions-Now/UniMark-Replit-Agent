import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if remote database URL is provided, otherwise fallback to local
const databaseUrl = process.env.REMOTE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log(`Using database: ${databaseUrl.split('@')[1] || 'local database'}`);

export const pool = new Pool({ 
  connectionString: databaseUrl,
  // SSL required for most remote database connections
  ssl: process.env.REMOTE_DATABASE_URL ? true : undefined
});

export const db = drizzle({ client: pool, schema });