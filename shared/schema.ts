import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const tryOns = pgTable("try_ons", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  modelImage: text("model_image").notNull(),
  garmentImage: text("garment_image").notNull(),
  category: text("category").notNull().default("tops"), // tops, bottoms, one-pieces
  resultImage: text("result_image"),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  predictionId: text("prediction_id"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const garmentInventory = pgTable("garment_inventory", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("tops"),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertTryOnSchema = createInsertSchema(tryOns).omit({ 
  id: true, 
  userId: true, 
  resultImage: true, 
  status: true, 
  predictionId: true, 
  error: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertGarmentSchema = createInsertSchema(garmentInventory).omit({
  id: true,
  userId: true,
  usageCount: true,
  createdAt: true,
});

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type TryOn = typeof tryOns.$inferSelect;
export type InsertTryOn = z.infer<typeof insertTryOnSchema>;

export type Garment = typeof garmentInventory.$inferSelect;
export type InsertGarment = z.infer<typeof insertGarmentSchema>;

// Request types
export type CreateTryOnRequest = InsertTryOn;
export type TryOnStatus = "pending" | "processing" | "completed" | "failed";

// Response types
export interface TryOnResponse extends TryOn {
  status: TryOnStatus;
}

// FASHN API Types
export interface FashnResponse {
  id: string;
  status: TryOnStatus;
  output?: string[];
  error?: {
    name: string;
    message: string;
  };
}
