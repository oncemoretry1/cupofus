CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event_name" text NOT NULL,
	"book_slug" text,
	"source" text,
	"metadata" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"key_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_rate_limits_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"purpose" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"password_salt" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"thai_title" text,
	"author" text NOT NULL,
	"cover_color" text NOT NULL,
	"cover_text_color" text DEFAULT '#172f2b' NOT NULL,
	"summary" text NOT NULL,
	"tags" text NOT NULL,
	"concerns" text NOT NULL,
	"personality" text NOT NULL,
	"reading_minutes" integer DEFAULT 300 NOT NULL,
	"audio_url" text,
	"podcast_url" text,
	"kinokuniya_url" text,
	"shopee_url" text,
	"lazada_url" text,
	"naiin_url" text,
	"thaimart_url" text,
	CONSTRAINT "books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coffee_pairings" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_slug" text NOT NULL,
	"menu_name" text NOT NULL,
	"menu_name_thai" text NOT NULL,
	"ingredients" text NOT NULL,
	"brew_method" text NOT NULL,
	"order_tip" text NOT NULL,
	"caffeine" text NOT NULL,
	"layer_top" text NOT NULL,
	"layer_bottom" text NOT NULL,
	CONSTRAINT "coffee_pairings_book_slug_unique" UNIQUE("book_slug")
);
--> statement-breakpoint
CREATE TABLE "creator_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"book_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_pairings" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_slug" text NOT NULL,
	"song_title" text NOT NULL,
	"song_artist" text NOT NULL,
	"song_url" text,
	"movie_title" text NOT NULL,
	"movie_year" integer,
	"movie_url" text,
	"mood" text NOT NULL,
	"reason" text NOT NULL,
	CONSTRAINT "media_pairings_book_slug_unique" UNIQUE("book_slug")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"favorite_topics" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "saved_cups" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_email" text NOT NULL,
	"book_id" integer NOT NULL,
	"cup_name" text NOT NULL,
	"answers" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_posts" ADD CONSTRAINT "creator_posts_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_cups" ADD CONSTRAINT "saved_cups_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identity_provider_subject_unique" ON "auth_identities" USING btree ("provider","provider_subject");