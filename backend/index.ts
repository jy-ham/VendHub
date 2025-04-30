import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { mapRoutes } from './api/mapRoutes.js';
import { database } from './api/database.js';
import { serve } from '@hono/node-server';

const app = new Hono();

// Enable CORS if needed
app.use('*', cors());

// Register map routes under `/api`
app.route('/api', mapRoutes);
app.route('/api', database);

// Start server
const PORT = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port: PORT });

console.log(`Server running on http://localhost:${PORT}`);
