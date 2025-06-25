import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema.ts';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be défini dans .env");
}

// ✅ Connexion via le client natif pg (PostgreSQL local)
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
