import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Create a connection pool to the MySQL database
const poolConnection = mysql.createPool(process.env.DATABASE_URL!);

// Export the Drizzle connection instance with schema support
export const db = drizzle(poolConnection, { schema, mode: 'default' });
