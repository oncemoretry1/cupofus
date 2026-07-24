CREATE TABLE IF NOT EXISTS "cafes" (
  "id" serial PRIMARY KEY NOT NULL,
  "source" text DEFAULT 'osm' NOT NULL,
  "source_id" text NOT NULL,
  "google_place_id" text,
  "name" text NOT NULL,
  "area" text DEFAULT 'Bangkok' NOT NULL,
  "address" text,
  "latitude" text,
  "longitude" text,
  "categories" text DEFAULT 'cafe' NOT NULL,
  "mood_tags" text DEFAULT 'everyday' NOT NULL,
  "raw_tags" text DEFAULT '{}' NOT NULL,
  "synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cafes_source_id_unique" ON "cafes" USING btree ("source", "source_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cafes_area_idx" ON "cafes" USING btree ("area");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cafes_name_idx" ON "cafes" USING btree ("name");
