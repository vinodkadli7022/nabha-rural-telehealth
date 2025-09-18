import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Telemedicine application tables
export const patients = sqliteTable('patients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  gender: text('gender').default('other'),
  age: integer('age').notNull(),
  village: text('village').notNull(),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
});

export const records = sqliteTable('records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
  diagnosis: text('diagnosis').notNull(),
  notes: text('notes'),
  prescription: text('prescription'),
  createdAt: text('created_at').notNull(),
});

export const appointments = sqliteTable('appointments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  doctorName: text('doctor_name').notNull(),
  scheduledFor: text('scheduled_for').notNull(),
  status: text('status').default('scheduled'),
  createdAt: text('created_at').notNull(),
});

export const inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  medicineName: text('medicine_name').notNull(),
  pharmacyName: text('pharmacy_name').notNull(),
  stock: integer('stock').notNull().default(0),
  lastUpdated: text('last_updated').notNull(),
});