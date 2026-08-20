import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").primaryKey(),
  officeName: varchar("officeName", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  heroEyebrow: varchar("heroEyebrow", { length: 160 }).notNull(),
  heroTitle: text("heroTitle").notNull(),
  heroDescription: text("heroDescription").notNull(),
  heroImageUrl: text("heroImageUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["토지", "전원주택", "농지"]).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  location: varchar("location", { length: 240 }).notNull(),
  detail: text("detail").notNull(),
  size: varchar("size", { length: 100 }).notNull(),
  price: varchar("price", { length: 100 }).notNull(),
  imageUrl: text("imageUrl"),
  tint: mysqlEnum("tint", ["clay", "pine", "cream"]).notNull().default("cream"),
  position: int("position").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 80 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  excerpt: text("excerpt").notNull(),
  dateLabel: varchar("dateLabel", { length: 40 }).notNull(),
  readTime: varchar("readTime", { length: 40 }).notNull(),
  position: int("position").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  contact: varchar("contact", { length: 80 }).notNull(),
  interest: varchar("interest", { length: 80 }).notNull(),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
