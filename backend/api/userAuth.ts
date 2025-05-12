import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { vendingMachine } from '../schema/VendingMachine.js';
import {db, supabase} from '@api/dbConnection.js'

