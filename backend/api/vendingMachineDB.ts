import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vendingMachine } from '../schema/VendingMachine.js';

export const vendMachine = new Hono();
vendMachine.use(cors());

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client);

// Get all vending machine info
vendMachine.get('/vending-machine', async (c) => {
  const result = await db.select().from(vendingMachine);

  return c.json(result);
});

// Get specific vending machine info based on id
vendMachine.get('/vending-machine/:id', async (c) => {
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

// Post vending machine info
vendMachine.post('/vending-machine', async (c) => {
  try {
    const body = await c.req.json();

    const { lat, lon, location, desc, available = true, items } = body;

    // Optional: Add basic type checks
    if (!lat || !lon || !location || !desc || !items) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    await db.insert(vendingMachine).values({
      lat,
      lon,
      location,
      desc,
      available,
      items
    });

    return c.json({ message: 'Vending machine added successfully' }, 201);

  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }

});
