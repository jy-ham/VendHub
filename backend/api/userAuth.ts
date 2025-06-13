import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { users } from "../schema/Users.js";
import { db } from "./dbConnection.js";
import * as argon2 from "argon2";
import type { Env, JwtPayload } from "../types/env.js";
import { sign } from "hono/jwt";

export const userAuth = new Hono<Env>();
userAuth.use(cors());

// Register: hash password and store
userAuth.post("/register", async (c) => {
  let { username, email, password } = await c.req.json();

  if (!username) {
    const now = Date.now(); // milliseconds since 1970
    const highPrecision = Math.floor(performance.now() * 1000); // sub-ms in µs
    const uniqueMicroseconds = now * 1000 + (highPrecision % 1000); // total in µs
    username = `user${uniqueMicroseconds}`;
  }

  if (!email || !password) {
    return c.json({ error: "Missing fields" }, 400);
  }

  try {
    password = await argon2.hash(password as string);
  } catch (err) {
    return c.json({ error: "Hashing failed" }, 500);
  }

  try {
    // Insert and get the created user back
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password,
      })
      .returning();

    // Set cookie for immediate login after registration
    const payload: JwtPayload = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username || "",
    };

    const jwtSecret = c.get("JWT_SECRET");
    const token = await sign(payload, jwtSecret);

    c.header(
      "Set-Cookie",
      `auth=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`
    );

    return c.json({ message: "User registered" });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Login: verify password
userAuth.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: "Missing fields" }, 400);
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0 || !result[0].password) {
    return c.json({ error: "User not found" }, 404);
  }

  try {
    const valid = await argon2.verify(result[0].password, password);
    if (!valid) return c.json({ error: "Invalid password" }, 401);

    // Add for prod
    // if (!result[0].username) {
    //   return c.json({ error: 'Invalid username' }, 400);
    // }

    //Step 1: Prepare payload
    const payload: JwtPayload = {
      id: result[0].id,
      email: result[0].email,
      username: result[0].username || "",
    };

    //Step 2: Sign JWT
    const jwtSecret = c.get("JWT_SECRET");
    const token = await sign(payload, jwtSecret);

    // Step 3: Set cookie
    c.header(
      "Set-Cookie",
      `auth=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`
    );

    return c.json({ message: "Login successful" });
  } catch (err) {
    return c.json({ error: "Verification failed" }, 500);
  }
});
