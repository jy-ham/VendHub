import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Connect to Supabase (Postgres) using URL from .env
const queryClient = postgres(process.env.SUPABASE_DB_URL!, {
  prepare: false,  // optional: avoids some supabase prepare errors
});

export const db = drizzle(queryClient);