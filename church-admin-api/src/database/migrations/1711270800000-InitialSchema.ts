import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1711270800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM types
    await queryRunner.query(
      `CREATE TYPE "user_role_enum" AS ENUM('super_admin', 'admin', 'pastor', 'staff', 'member', 'guest')`,
    );

    await queryRunner.query(
      `CREATE TYPE "event_status_enum" AS ENUM('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')`,
    );

    await queryRunner.query(
      `CREATE TYPE "donation_status_enum" AS ENUM('pending', 'completed', 'failed', 'refunded')`,
    );

    await queryRunner.query(
      `CREATE TYPE "media_type_enum" AS ENUM('image', 'video', 'audio', 'document', 'other')`,
    );

    await queryRunner.query(
      `CREATE TYPE "live_stream_status_enum" AS ENUM('upcoming', 'active', 'completed', 'cancelled')`,
    );

    // Create churches table (tenant)
    await queryRunner.query(
      `CREATE TABLE "churches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL UNIQUE,
        "description" text,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "postal_code" character varying,
        "country" character varying,
        "phone" character varying,
        "email" character varying,
        "website" character varying,
        "logo_url" character varying,
        "banner_url" character varying,
        "timezone" character varying DEFAULT 'UTC',
        "currency" character varying DEFAULT 'USD',
        "is_active" boolean NOT NULL DEFAULT true,
        "settings" jsonb DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_churches_slug" ON "churches" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_churches_is_active" ON "churches" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_churches_created_at" ON "churches" ("created_at")`);

    // Create users table
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "phone" character varying,
        "role" "user_role_enum" NOT NULL DEFAULT 'member',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_verified" boolean NOT NULL DEFAULT false,
        "last_login" TIMESTAMP WITH TIME ZONE,
        "avatar_url" character varying,
        "bio" text,
        "settings" jsonb DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_email_church" ON "users" ("email", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_church_id" ON "users" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_is_active" ON "users" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_created_at" ON "users" ("created_at")`);

    // Create refresh_tokens table
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "church_id" uuid NOT NULL,
        "token_hash" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "revoked_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_church_id" ON "refresh_tokens" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_expires_at" ON "refresh_tokens" ("expires_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_is_revoked" ON "refresh_tokens" ("is_revoked")`);

    // Create permissions table
    await queryRunner.query(
      `CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "category" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_permissions_slug_church" ON "permissions" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_permissions_church_id" ON "permissions" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_permissions_category" ON "permissions" ("category")`);

    // Create user_permissions join table
    await queryRunner.query(
      `CREATE TABLE "user_permissions" (
        "user_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        "church_id" uuid NOT NULL,
        PRIMARY KEY ("user_id", "permission_id"),
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_user_permissions_user_id" ON "user_permissions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_permissions_permission_id" ON "user_permissions" ("permission_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_permissions_church_id" ON "user_permissions" ("church_id")`);

    // Create categories table
    await queryRunner.query(
      `CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "icon_url" character varying,
        "color" character varying,
        "parent_category_id" uuid,
        "display_order" integer DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("parent_category_id") REFERENCES "categories" ("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_categories_slug_church" ON "categories" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_church_id" ON "categories" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_parent_category_id" ON "categories" ("parent_category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active")`);

    // Create sermons table
    await queryRunner.query(
      `CREATE TABLE "sermons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "content" text,
        "speaker_id" uuid,
        "speaker_name" character varying,
        "sermon_date" TIMESTAMP WITH TIME ZONE,
        "duration_minutes" integer,
        "thumbnail_url" character varying,
        "video_url" character varying,
        "audio_url" character varying,
        "transcript" text,
        "view_count" integer DEFAULT 0,
        "is_featured" boolean DEFAULT false,
        "is_published" boolean DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("speaker_id") REFERENCES "users" ("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_sermons_slug_church" ON "sermons" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_sermons_church_id" ON "sermons" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_sermons_speaker_id" ON "sermons" ("speaker_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_sermons_is_published" ON "sermons" ("is_published")`);
    await queryRunner.query(`CREATE INDEX "IDX_sermons_is_featured" ON "sermons" ("is_featured")`);
    await queryRunner.query(`CREATE INDEX "IDX_sermons_sermon_date" ON "sermons" ("sermon_date")`);

    // Create sermon_categories join table
    await queryRunner.query(
      `CREATE TABLE "sermon_categories" (
        "sermon_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "church_id" uuid NOT NULL,
        PRIMARY KEY ("sermon_id", "category_id"),
        FOREIGN KEY ("sermon_id") REFERENCES "sermons" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_sermon_categories_sermon_id" ON "sermon_categories" ("sermon_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_sermon_categories_category_id" ON "sermon_categories" ("category_id")`);

    // Create events table
    await queryRunner.query(
      `CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "location" character varying,
        "location_url" character varying,
        "organizer_id" uuid,
        "organizer_name" character varying,
        "image_url" character varying,
        "status" "event_status_enum" DEFAULT 'draft',
        "max_attendees" integer,
        "current_attendees" integer DEFAULT 0,
        "is_published" boolean DEFAULT false,
        "is_featured" boolean DEFAULT false,
        "requires_registration" boolean DEFAULT false,
        "event_url" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("organizer_id") REFERENCES "users" ("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_events_slug_church" ON "events" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_church_id" ON "events" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_organizer_id" ON "events" ("organizer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_status" ON "events" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_start_date" ON "events" ("start_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_events_is_published" ON "events" ("is_published")`);

    // Create event_categories join table
    await queryRunner.query(
      `CREATE TABLE "event_categories" (
        "event_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "church_id" uuid NOT NULL,
        PRIMARY KEY ("event_id", "category_id"),
        FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_event_categories_event_id" ON "event_categories" ("event_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_categories_category_id" ON "event_categories" ("category_id")`);

    // Create donation_campaigns table
    await queryRunner.query(
      `CREATE TABLE "donation_campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "goal_amount" numeric(12, 2) NOT NULL,
        "raised_amount" numeric(12, 2) DEFAULT 0,
        "image_url" character varying,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE,
        "is_active" boolean DEFAULT true,
        "is_featured" boolean DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_donation_campaigns_slug_church" ON "donation_campaigns" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_donation_campaigns_church_id" ON "donation_campaigns" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_donation_campaigns_is_active" ON "donation_campaigns" ("is_active")`);

    // Create donation_transactions table
    await queryRunner.query(
      `CREATE TABLE "donation_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "campaign_id" uuid,
        "donor_id" uuid,
        "donor_email" character varying,
        "donor_name" character varying NOT NULL,
        "amount" numeric(12, 2) NOT NULL,
        "currency" character varying DEFAULT 'USD',
        "status" "donation_status_enum" DEFAULT 'pending',
        "payment_method" character varying,
        "transaction_ref" character varying,
        "notes" text,
        "metadata" jsonb DEFAULT '{}',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("campaign_id") REFERENCES "donation_campaigns" ("id") ON DELETE SET NULL,
        FOREIGN KEY ("donor_id") REFERENCES "users" ("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_donation_transactions_church_id" ON "donation_transactions" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_donation_transactions_campaign_id" ON "donation_transactions" ("campaign_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_donation_transactions_donor_id" ON "donation_transactions" ("donor_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_donation_transactions_status" ON "donation_transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_donation_transactions_created_at" ON "donation_transactions" ("created_at")`);

    // Create spiritual_resources table
    await queryRunner.query(
      `CREATE TABLE "spiritual_resources" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "content" text,
        "content_url" character varying,
        "thumbnail_url" character varying,
        "resource_type" character varying,
        "author" character varying,
        "is_published" boolean DEFAULT false,
        "is_featured" boolean DEFAULT false,
        "view_count" integer DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_spiritual_resources_slug_church" ON "spiritual_resources" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_spiritual_resources_church_id" ON "spiritual_resources" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_spiritual_resources_is_published" ON "spiritual_resources" ("is_published")`);

    // Create spiritual_resource_categories join table
    await queryRunner.query(
      `CREATE TABLE "spiritual_resource_categories" (
        "resource_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "church_id" uuid NOT NULL,
        PRIMARY KEY ("resource_id", "category_id"),
        FOREIGN KEY ("resource_id") REFERENCES "spiritual_resources" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_spiritual_resource_categories_resource_id" ON "spiritual_resource_categories" ("resource_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_spiritual_resource_categories_category_id" ON "spiritual_resource_categories" ("category_id")`);

    // Create hymns table
    await queryRunner.query(
      `CREATE TABLE "hymns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "lyrics" text,
        "composer" character varying,
        "author" character varying,
        "hymn_number" character varying,
        "is_published" boolean DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_hymns_slug_church" ON "hymns" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_hymns_church_id" ON "hymns" ("church_id")`);

    // Create hymn_categories join table
    await queryRunner.query(
      `CREATE TABLE "hymn_categories" (
        "hymn_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "church_id" uuid NOT NULL,
        PRIMARY KEY ("hymn_id", "category_id"),
        FOREIGN KEY ("hymn_id") REFERENCES "hymns" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_hymn_categories_hymn_id" ON "hymn_categories" ("hymn_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_hymn_categories_category_id" ON "hymn_categories" ("category_id")`);

    // Create radio_stations table
    await queryRunner.query(
      `CREATE TABLE "radio_stations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "stream_url" character varying NOT NULL,
        "logo_url" character varying,
        "banner_url" character varying,
        "is_active" boolean DEFAULT true,
        "is_featured" boolean DEFAULT false,
        "listener_count" integer DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_radio_stations_slug_church" ON "radio_stations" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_radio_stations_church_id" ON "radio_stations" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_radio_stations_is_active" ON "radio_stations" ("is_active")`);

    // Create live_streams table
    await queryRunner.query(
      `CREATE TABLE "live_streams" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "stream_url" character varying NOT NULL,
        "thumbnail_url" character varying,
        "scheduled_start" TIMESTAMP WITH TIME ZONE,
        "actual_start" TIMESTAMP WITH TIME ZONE,
        "actual_end" TIMESTAMP WITH TIME ZONE,
        "status" "live_stream_status_enum" DEFAULT 'upcoming',
        "viewer_count" integer DEFAULT 0,
        "duration_minutes" integer,
        "is_featured" boolean DEFAULT false,
        "recording_url" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_live_streams_slug_church" ON "live_streams" ("slug", "church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_live_streams_church_id" ON "live_streams" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_live_streams_status" ON "live_streams" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_live_streams_scheduled_start" ON "live_streams" ("scheduled_start")`);

    // Create media table
    await queryRunner.query(
      `CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "filename" character varying NOT NULL,
        "file_path" character varying NOT NULL,
        "file_size" integer,
        "mime_type" character varying,
        "media_type" "media_type_enum" DEFAULT 'other',
        "duration_seconds" integer,
        "width" integer,
        "height" integer,
        "alt_text" character varying,
        "description" text,
        "is_public" boolean DEFAULT false,
        "view_count" integer DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" uuid,
        "updated_by" uuid,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_media_church_id" ON "media" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_media_type" ON "media" ("media_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_is_public" ON "media" ("is_public")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_created_at" ON "media" ("created_at")`);

    // Create media_usages table (tracks where media is used)
    await queryRunner.query(
      `CREATE TABLE "media_usages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "media_id" uuid NOT NULL,
        "entity_type" character varying NOT NULL,
        "entity_id" uuid NOT NULL,
        "field_name" character varying,
        "usage_position" integer,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("media_id") REFERENCES "media" ("id") ON DELETE CASCADE
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_media_usages_church_id" ON "media_usages" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_usages_media_id" ON "media_usages" ("media_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_usages_entity" ON "media_usages" ("entity_type", "entity_id")`);

    // Create audit_logs table
    await queryRunner.query(
      `CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "church_id" uuid NOT NULL,
        "user_id" uuid,
        "action" character varying NOT NULL,
        "entity_type" character varying NOT NULL,
        "entity_id" uuid,
        "old_values" jsonb,
        "new_values" jsonb,
        "status_code" integer,
        "error_message" text,
        "ip_address" character varying,
        "user_agent" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id"),
        FOREIGN KEY ("church_id") REFERENCES "churches" ("id") ON DELETE CASCADE,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL
      )`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_church_id" ON "audit_logs" ("church_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_user_id" ON "audit_logs" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity" ON "audit_logs" ("entity_type", "entity_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (due to foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media_usages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "live_streams"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "radio_stations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hymn_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "hymns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "spiritual_resource_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "spiritual_resources"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "donation_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "donation_campaigns"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sermon_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sermons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "churches"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "live_stream_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "media_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "donation_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "event_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
