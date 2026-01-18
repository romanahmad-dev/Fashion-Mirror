import { db } from "./db";
import { tryOns, type InsertTryOn, type TryOn, type TryOnStatus } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Try-On Operations
  createTryOn(tryOn: InsertTryOn & { userId: string, predictionId?: string, status?: TryOnStatus }): Promise<TryOn>;
  getTryOn(id: number): Promise<TryOn | undefined>;
  getUserTryOns(userId: string): Promise<TryOn[]>;
  updateTryOnStatus(id: number, status: TryOnStatus, resultImage?: string, error?: string): Promise<TryOn>;
  updateTryOnPredictionId(id: number, predictionId: string): Promise<TryOn>;
}

export class DatabaseStorage implements IStorage {
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
}

export const storage = new DatabaseStorage();
