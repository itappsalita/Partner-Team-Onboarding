import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Provide a fallback for build time; runtime will use the real .env variable
const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/partner_onboarding_db";

// Create a connection pool
const poolConnection = mysql.createPool(connectionString);

// Export the Drizzle connection instance
export const db = drizzle(poolConnection, { schema, mode: 'default' });
