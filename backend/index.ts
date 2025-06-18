import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { mapRoutes } from './api/mapRoutes.js';
import { vendMachine } from './api/vendingMachineDB.js';
import { userAuth } from './api/userAuth.js';
import { serve } from '@hono/node-server';
import { verify } from "hono/jwt";
import {Env, JwtPayload} from './types/env.js';
import { match } from 'path-to-regexp';

const app = new Hono<Env>();

// Enable CORS if needed
const allowedOrigin = process.env.NODE_ENV === "production"
  ? "https://vendhub.onrender.com"
  : "http://localhost:5173";

app.use(
  "*",
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use("/api/*", async (c, next) => {
  const jwtSecret = process.env.JWT_SECRET!;
  c.set("JWT_SECRET", jwtSecret);

  // Public routes that don't require auth
  const publicPaths = [
    { method: "POST", path: match("/api/login") },
    { method: "POST", path: match("/api/register") }, 
    { method: "GET", path: match("/api/map-key") },
    { method: "GET", path: match("/api/vending-machine") },
    { method: "GET", path: match("/api/vending-machine/:id") }
  ];
  const currentPath = c.req.path;
  const currentMethod = c.req.method;

  const isPublic = publicPaths.some(({ method, path }) => method === currentMethod && path(currentPath) !== false);

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

  return c.json({ error: "Unauthorized, user not logged in" }, 401);
});

// Register map routes under `/api`
app.route('/api', mapRoutes);
app.route('/api', vendMachine);
app.route('/api', userAuth);

// Start server
const PORT = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port: PORT });

console.log(`Server running on http://localhost:${PORT}`);