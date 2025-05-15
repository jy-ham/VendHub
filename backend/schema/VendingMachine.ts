import { pgTable, serial, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

export const vendingMachine = pgTable('vendingMachine', {
  id: serial('id').primaryKey(),
  lat: numeric('lat', { precision: 9, scale: 6 }).notNull(),
  lon: numeric('lon', { precision: 9, scale: 6 }).notNull(),
  location: text('location').notNull(),
  desc: text('desc').notNull(),
  available: boolean('available').default(true).notNull(),
  items: text('items').notNull(),
  imageUrl: text('imageUrl'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});