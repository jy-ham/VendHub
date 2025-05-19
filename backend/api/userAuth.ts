import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { users } from '../schema/Users.js';
import {db, supabase} from './dbConnection.js'
import argon2 from 'argon2'

export const userAuth = new Hono();
userAuth.use(cors());

// Register: hash password and store
userAuth.post('/register', async (c) => {
  let { username, email, password } = await c.req.json()

  // const body = await c.req.parseBody({ all: true });
  
  // const username = body.username as string;
  // const email = body.email as string;
  // if (!username || !email) {
  //   return c.json({ error: 'Missing fields' }, 400)
  // }

  // let password;
  // try {
  //   if (!body.password) {
  //       return c.json({ error: 'Missing fields' }, 400)
  //   }
  //    password = await argon2.hash(body.password as string);
  //  } catch (err) {
  //   return c.json({ error: 'Hashing failed' }, 500)
  //  }
  

  if (!username || !email || !password) {
    return c.json({ error: 'Missing fields' }, 400)
  }

  try {
     password = await argon2.hash(password as string);
   } catch (err) {
    return c.json({ error: 'Hashing failed' }, 500)
   }

  try {
    await db.insert(users).values({
        username,
        email,
        password
    });
    return c.json({ message: 'User registered' })
  } catch (err) {
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

// Login: verify password
userAuth.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if(!email || !password) {
    return c.json({ error: 'Missing fields' }, 400)
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const storedHash = result[0].password;
  
  if (!storedHash) return c.json({ error: 'User not found' }, 404)

  try {
    const valid = await argon2.verify(storedHash, password)
    if (!valid) return c.json({ error: 'Invalid password' }, 401)
    return c.json({ message: 'Login successful' })
  } catch (err) {
    return c.json({ error: 'Verification failed' }, 500)
  }
})
