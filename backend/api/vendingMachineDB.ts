import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { vendingMachine } from '../schema/VendingMachine.js';
import { createClient } from '@supabase/supabase-js';

export const vendMachine = new Hono();
vendMachine.use(cors());

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client);

// For uploading image
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all vending machine info
vendMachine.get('/vending-machine', async (c) => {
  const result = await db.select().from(vendingMachine);

  console.log(result);
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
    //const body = await c.req.json();

    //const { lat, lon, location, desc, available = true, items, image } = body;

    const body = await c.req.parseBody({ all: true });
    console.log("Received: ", body);

    const lat = body.lat as string;
    const lon = body.lon as string;
    const location = body.location as string;
    const desc = body.desc as string;
    const available = body.available !== undefined ? body.available === 'true' : true;
    const items = body.items as string;
    const image = body.image;
    

    // Optional: Add basic type checks
    if (!lat || !lon || !location || !desc || !items || !(image instanceof File)) {
      return c.json({ error: 'Missing required fields or image file' }, 400);
    }

    // Upload to Supabase Storage
    const buffer = Buffer.from(await image.arrayBuffer());
    const fileName = `${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from('vendingmachines') 
      .upload(fileName, buffer, {
        contentType: image.type,
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return c.json({ error: 'Image upload failed' }, 500);
    }

    const { data: urlData } = supabase.storage
      .from('vendingmachines')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return c.json({ error: 'Image URL generation failed' }, 500);
    }

    const imageUrl = urlData.publicUrl;

    await db.insert(vendingMachine).values({
      lat,
      lon,
      location,
      desc,
      available,
      items,
      imageUrl
    });

    return c.json({ message: 'Vending machine added successfully' }, 201);

  } catch (err) {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
