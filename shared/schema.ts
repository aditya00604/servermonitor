import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  jsonb, 
  index,
  integer,
  boolean,
  real,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  credits: integer("credits").default(0).notNull(),
  isPro: boolean("is_pro").default(false).notNull(),
  proExpiresAt: timestamp("pro_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Additional auth fields
  githubId: varchar("github_id"),
  googleId: varchar("google_id"),
  password: varchar("password"), // For email/password auth
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: varchar("email_verification_token"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
});

// OTP verification table
export const otpVerifications = pgTable("otp_verifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  otp: varchar("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Servers table
export const servers = pgTable("servers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  apiKey: varchar("api_key").unique().notNull(),
  lastSeen: timestamp("last_seen"),
  isOnline: boolean("is_online").default(false).notNull(),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Server metrics table
export const serverMetrics = pgTable("server_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: uuid("server_id").references(() => servers.id).notNull(),
  cpuUsage: real("cpu_usage").notNull(),
  memoryUsage: real("memory_usage").notNull(),
  memoryTotal: real("memory_total").notNull(),
  memoryUsed: real("memory_used").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Credits transactions table
export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(),
  type: varchar("type").notNull(), // 'ad_watch', 'pro_purchase'
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertServer = typeof servers.$inferInsert;
export type Server = typeof servers.$inferSelect;

export type InsertServerMetric = typeof serverMetrics.$inferInsert;
export type ServerMetric = typeof serverMetrics.$inferSelect;

export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

export type InsertOtpVerification = typeof otpVerifications.$inferInsert;
export type OtpVerification = typeof otpVerifications.$inferSelect;

// Insert schemas
export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  apiKey: true,
  lastSeen: true,
  isOnline: true,
});

export const insertServerMetricSchema = createInsertSchema(serverMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertOtpSchema = createInsertSchema(otpVerifications).omit({
  id: true,
  createdAt: true,
  verified: true,
});
