import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './db/schema';
import { DATABASE_URL } from './env';

const sql = neon(DATABASE_URL);

export const db = drizzle(
    sql,
    {
        schema,
        // Connection configuration for better performance
        logger: process.env.NODE_ENV === 'development',
    });