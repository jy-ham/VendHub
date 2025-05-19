import 'dotenv/config';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { mapRoutes } from './api/mapRoutes.js';
import { vendMachine } from './api/vendingMachineDB.js';
import { authRoutes } from './api/authRoutes.js';
import { userAuth } from './api/userAuth.js';
import { serve } from '@hono/node-server';

type Env = {
  Variables: {
    JWT_SECRET: string;
  };
};

const app = new Hono<Env>();

// Enable CORS if needed
app.use("*", cors());

app.use("/api/*", async (c, next) => {
  c.set("JWT_SECRET", process.env.JWT_SECRET!);
  await next();
});

// Register map routes under `/api`
app.route('/api', mapRoutes);
app.route('/api', vendMachine);
app.route('/api', authRoutes);
app.route('/api', userAuth);

// Start server
const PORT = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port: PORT });

console.log(`Server running on http://localhost:${PORT}`);