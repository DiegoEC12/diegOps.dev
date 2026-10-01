import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const appRole = pgEnum("app_role", ["admin", "moderator", "user"]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  problem: text("problem").notNull(),
  category: text("category").notNull(),
  technologies: text("technologies").array().notNull().default([]),
  github_url: text("github_url"),
  demo_url: text("demo_url"),
  image_url: text("image_url"),
  image_fit: text("image_fit").notNull().default("cover"),
  image_position: text("image_position").notNull().default("50% 50%"),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  role: appRole("role").notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("general_config"),
  brand_initials: text("brand_initials").notNull().default("DY"),
  brand_name: text("brand_name").notNull().default("Diego Yeferson EC"),
  hero_title: text("hero_title").notNull().default("Diego Yeferson EC"),
  hero_role: text("hero_role").notNull().default("Técnico en desarrollo de sistemas e información"),
  hero_copy: text("hero_copy")
    .notNull()
    .default("Construyo soluciones digitales útiles, mantenibles y bien pensadas."),
  availability_status: text("availability_status")
    .notNull()
    .default("Disponible para nuevos retos y proyectos"),
  email_contact: text("email_contact"),
  github_url: text("github_url"),
  linkedin_url: text("linkedin_url"),
  location: text("location"),
  logo_url: text("logo_url"),
  logo_fit: text("logo_fit").notNull().default("contain"),
  logo_position: text("logo_position").notNull().default("50% 50%"),
  footer_tagline: text("footer_tagline"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const timelineEntries = pgTable("timeline_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind", { enum: ["education", "experience"] }).notNull(),
  title: text("title").notNull(),
  institution: text("institution").notNull(),
  period: text("period").notNull(),
  status: text("status").notNull().default("Completado"),
  description: text("description").notNull(),
  skills_learned: text("skills_learned").array().notNull().default([]),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  issued_date: text("issued_date").notNull(),
  credential_url: text("credential_url"),
  credential_id: text("credential_id"),
  hours: integer("hours"),
  badge_url: text("badge_url"),
  image_fit: text("image_fit").notNull().default("contain"),
  image_position: text("image_position").notNull().default("50% 50%"),
  sort_order: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const musicTracks = pgTable("music_tracks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  artist: text("artist").notNull().default("Lo-Fi Records"),
  audio_url: text("audio_url").notNull(),
  duration: text("duration").default("2:30"),
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqQueries = pgTable("faq_queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  question_label: text("question_label").notNull(),
  sql_command: text("sql_command").notNull(),
  result_columns: text("result_columns").array().notNull().default([]),
  result_rows: jsonb("result_rows")
    .notNull()
    .default(sql`'[]'::jsonb`),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sender_name: text("sender_name").notNull(),
  sender_email: text("sender_email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
