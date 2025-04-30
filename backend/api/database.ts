import { Hono } from 'hono';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vendingMachine } from '../schema/VendingMachine.js';

export const database = new Hono();

// // Connect to Supabase (Postgres) using URL from .env
// const queryClient = postgres(process.env.SUPABASE_DB_URL!, {
//   prepare: false,  // optional: avoids some supabase prepare errors
// });

// export const db = drizzle(queryClient);

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client);

database.get('/vending-machine/:id', async (c) => {
  const idParam = c.req.param('id');
  const id = parseInt(idParam, 10);

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  const result = await db
    .select()
    .from(vendingMachine)
    .where(eq(vendingMachine.id, id));

  const machine = result[0];

  if (!machine) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json(machine);
});
