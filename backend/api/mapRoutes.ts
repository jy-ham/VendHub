import { Hono } from 'hono';
import 'dotenv/config';

export const mapRoutes = new Hono();

mapRoutes.get('/map-key', (c) => {
    return c.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});
