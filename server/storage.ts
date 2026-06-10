import { db } from "./db";
import { tryOns, garmentInventory, type InsertTryOn, type TryOn, type TryOnStatus, type Garment, type InsertGarment } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Try-On Operations
  createTryOn(tryOn: InsertTryOn & { userId: string, predictionId?: string, status?: TryOnStatus }): Promise<TryOn>;
  getTryOn(id: number): Promise<TryOn | undefined>;
  getUserTryOns(userId: string): Promise<TryOn[]>;
  updateTryOnStatus(id: number, status: TryOnStatus, resultImage?: string, error?: string): Promise<TryOn>;
  updateTryOnPredictionId(id: number, predictionId: string): Promise<TryOn>;
  deleteTryOn(id: number): Promise<void>;

  // Garment Inventory Operations
  createGarment(garment: InsertGarment & { userId: string }): Promise<Garment>;
  getUserGarments(userId: string): Promise<Garment[]>;
  getGarment(id: number): Promise<Garment | undefined>;
  deleteGarment(id: number): Promise<void>;
  incrementGarmentUsage(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // ── Try-On CRUD ──────────────────────────────────────────────────────────

  async createTryOn(tryOn: InsertTryOn & { userId: string, predictionId?: string, status?: TryOnStatus }): Promise<TryOn> {
    const [newTryOn] = await db
      .insert(tryOns)
      .values(tryOn)
      .returning();
    return newTryOn;
  }

  async getTryOn(id: number): Promise<TryOn | undefined> {
    const [tryOn] = await db
      .select()
      .from(tryOns)
      .where(eq(tryOns.id, id));
    return tryOn;
  }

  async getUserTryOns(userId: string): Promise<TryOn[]> {
    return await db
      .select()
      .from(tryOns)
      .where(eq(tryOns.userId, userId))
      .orderBy(desc(tryOns.createdAt));
  }

  async updateTryOnStatus(id: number, status: TryOnStatus, resultImage?: string, error?: string): Promise<TryOn> {
    const [updated] = await db
      .update(tryOns)
      .set({ 
        status, 
        resultImage, 
        error,
        updatedAt: new Date() 
      })
      .where(eq(tryOns.id, id))
      .returning();
    return updated;
  }

  async updateTryOnPredictionId(id: number, predictionId: string): Promise<TryOn> {
    const [updated] = await db
      .update(tryOns)
      .set({ 
        predictionId,
        updatedAt: new Date() 
      })
      .where(eq(tryOns.id, id))
      .returning();
    return updated;
  }

  async deleteTryOn(id: number): Promise<void> {
    await db.delete(tryOns).where(eq(tryOns.id, id));
  }

  // ── Garment Inventory CRUD ────────────────────────────────────────────────

  async createGarment(garment: InsertGarment & { userId: string }): Promise<Garment> {
    const [newGarment] = await db
      .insert(garmentInventory)
      .values(garment)
      .returning();
    return newGarment;
  }

  async getUserGarments(userId: string): Promise<Garment[]> {
    return await db
      .select()
      .from(garmentInventory)
      .where(eq(garmentInventory.userId, userId))
      .orderBy(desc(garmentInventory.createdAt));
  }

  async getGarment(id: number): Promise<Garment | undefined> {
    const [garment] = await db
      .select()
      .from(garmentInventory)
      .where(eq(garmentInventory.id, id));
    return garment;
  }

  async deleteGarment(id: number): Promise<void> {
    await db.delete(garmentInventory).where(eq(garmentInventory.id, id));
  }

  async incrementGarmentUsage(id: number): Promise<void> {
    const [garment] = await db
      .select()
      .from(garmentInventory)
      .where(eq(garmentInventory.id, id));
    if (garment) {
      await db
        .update(garmentInventory)
        .set({ usageCount: (garment.usageCount ?? 0) + 1 })
        .where(eq(garmentInventory.id, id));
    }
  }
}

export const storage = new DatabaseStorage();
