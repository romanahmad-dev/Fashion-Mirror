import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Configure file upload storage
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = 'uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

import { AiService } from "./services/ai.service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // ─────────────────────────────────────────────────────────────
  // TRY-ON ROUTES
  // ─────────────────────────────────────────────────────────────

  // List Try-Ons
  app.get(api.tryOns.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tryOns = await storage.getUserTryOns(userId);
      res.json(tryOns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch try-ons" });
    }
  });

  // Get Single Try-On
  app.get(api.tryOns.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const tryOn = await storage.getTryOn(Number(req.params.id));
      if (!tryOn) {
        return res.status(404).json({ message: 'Try-on not found' });
      }
      if (tryOn.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      res.json(tryOn);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch try-on" });
    }
  });

  // Create Try-On
  app.post(api.tryOns.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.tryOns.create.input.parse(req.body);
      
      const tryOn = await storage.createTryOn({
        ...input,
        userId,
        status: 'pending' as const
      });

      // Respond immediately — AI runs in the background
      res.status(201).json(tryOn);

      // Background: call OpenRouter and update DB when done
      setImmediate(async () => {
        try {
          await storage.updateTryOnStatus(tryOn.id, 'processing');
          const data = await AiService.runTryOn({
            modelImage: input.modelImage,
            garmentImage: input.garmentImage,
            category: input.category || "tops"
          });
          await storage.updateTryOnStatus(tryOn.id, 'completed', data.resultImage);
        } catch (apiError: any) {
          console.error("AI Generation Error:", apiError);
          await storage.updateTryOnStatus(tryOn.id, 'failed', undefined, apiError.message);
        }
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete Try-On
  app.delete(api.tryOns.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const tryOn = await storage.getTryOn(Number(req.params.id));
      if (!tryOn) {
        return res.status(404).json({ message: 'Try-on not found' });
      }
      if (tryOn.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      await storage.deleteTryOn(tryOn.id);
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete try-on" });
    }
  });

  // Check Status Endpoint — reads from DB (OpenRouter is synchronous, no external polling needed)
  app.get(api.tryOns.status.path, isAuthenticated, async (req: any, res) => {
    try {
      const tryOnId = Number(req.params.id);
      const tryOn = await storage.getTryOn(tryOnId);

      if (!tryOn) {
        return res.status(404).json({ message: 'Try-on not found' });
      }

      if (tryOn.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      return res.json({
        status: tryOn.status,
        resultImage: tryOn.resultImage ?? undefined,
        error: tryOn.error ?? undefined,
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  // ─────────────────────────────────────────────────────────────
  // GARMENT INVENTORY ROUTES
  // ─────────────────────────────────────────────────────────────

  // List Inventory
  app.get(api.inventory.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const garments = await storage.getUserGarments(userId);
      res.json(garments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Add Garment to Inventory
  app.post(api.inventory.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.inventory.create.input.parse(req.body);
      const garment = await storage.createGarment({ ...input, userId });
      res.status(201).json(garment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Failed to add garment" });
    }
  });

  // Delete Garment from Inventory
  app.delete(api.inventory.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const garment = await storage.getGarment(Number(req.params.id));
      if (!garment) {
        return res.status(404).json({ message: 'Garment not found' });
      }
      if (garment.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      await storage.deleteGarment(garment.id);
      res.json({ message: 'Garment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete garment" });
    }
  });

  // File Upload Route
  app.post('/api/upload', isAuthenticated, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  return httpServer;
}
