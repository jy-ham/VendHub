CREATE TABLE "vendingMachine" (
	"id" serial PRIMARY KEY NOT NULL,
	"lat" numeric(9, 6) NOT NULL,
	"lon" numeric(9, 6) NOT NULL,
	"location" text NOT NULL,
	"desc" text NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"items" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
