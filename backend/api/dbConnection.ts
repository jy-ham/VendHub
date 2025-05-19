import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

// For uploading image
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export {db, supabase}