import { defineConfig } from "drizzle-kit";
import 'dotenv/config';


export default defineConfig({
  dialect: "postgresql",
  schema: ["./backend/schema/VendingMachine.ts"],
  out: "./backend/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});