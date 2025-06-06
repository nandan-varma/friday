import { drizzle } from 'drizzle-orm/neon-http';
import { upstashCache } from "drizzle-orm/cache/upstash";
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(
    sql,
    {
        schema,
        cache: upstashCache({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        }),
    });