import 'dotenv/config';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { mapRoutes } from './api/mapRoutes.js';
import { vendMachine } from './api/vendingMachineDB.js';
//import { authRoutes } from './api/authRoutes.js';
import { userAuth } from './api/userAuth.js';
import { serve } from '@hono/node-server';
import { sign, verify } from "hono/jwt";
import {Env, JwtPayload} from './types/env.js'

const app = new Hono<Env>();

// Enable CORS if needed
app.use("*", cors());

app.use("/api/*", async (c, next) => {
  const jwtSecret = process.env.JWT_SECRET!;
  c.set("JWT_SECRET", jwtSecret);

  // Public routes that don't require auth
  const publicPaths = ["/api/login", "/api/register", "/api/map-key"];
  const currentPath = c.req.path;

  const isPublic = publicPaths.some((path) => currentPath.startsWith(path));

  // Extract JWT from 'auth' cookie
  const cookieHeader = c.req.header("Cookie") || "";
  const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("auth="))
    ?.split("=")[1];

  if (token) {
    try {
      const user = await verify(token, jwtSecret) as JwtPayload;
      c.set("user", user); // Make user available to handlers
      return await next(); // ✅ Proceed to route
    } catch {
      // Token exists but is invalid
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  }

  if (isPublic) {
    return await next(); // ✅ Public route, no token required
  }
});

// Register map routes under `/api`
app.route('/api', mapRoutes);
app.route('/api', vendMachine);
//app.route('/api', authRoutes);
app.route('/api', userAuth);

// Start server
const PORT = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port: PORT });

console.log(`Server running on http://localhost:${PORT}`);