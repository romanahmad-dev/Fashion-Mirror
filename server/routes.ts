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

  // Protected Routes
  
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
      // Ensure user owns this try-on
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

      try {
        const data = await AiService.runTryOn({
          modelImage: input.modelImage,
          garmentImage: input.garmentImage,
          category: input.category || "tops"
        });
        await storage.updateTryOnPredictionId(tryOn.id, data.id);
        await storage.updateTryOnStatus(tryOn.id, 'processing');
      } catch (apiError: any) {
        console.error("AI Generation Error:", apiError);
        await storage.updateTryOnStatus(tryOn.id, 'failed', undefined, apiError.message);
      }

      res.status(201).json(tryOn);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check Status Endpoint (Proxy to FASHN API)
  app.get(api.tryOns.status.path, isAuthenticated, async (req: any, res) => {
    try {
      const tryOnId = Number(req.params.id);
      const tryOn = await storage.getTryOn(tryOnId);

      if (!tryOn) {
        return res.status(404).json({ message: 'Try-on not found' });
      }

      // If already completed or failed, return stored result
      if (tryOn.status === 'completed' || tryOn.status === 'failed') {
        return res.json({
          status: tryOn.status,
          resultImage: tryOn.resultImage,
          error: tryOn.error
        });
      }

      // If missing prediction ID but not failed/completed, something is wrong
      if (!tryOn.predictionId) {
        return res.json({ status: 'failed', error: 'Missing prediction ID' });
      }

      // Poll FASHN API via Service
      try {
        const data = await AiService.checkStatus(tryOn.predictionId);
        
        // Update DB if status changed
        if (data.status === 'completed' || data.status === 'failed') {
          const resultImage = data.output && data.output.length > 0 ? data.output[0] : undefined;
          const error = data.error ? data.error.message : undefined;
          
          await storage.updateTryOnStatus(tryOnId, data.status, resultImage, error);
          
          return res.json({
            status: data.status,
            resultImage,
            error
          });
        }

        // Still processing
        return res.json({ status: data.status });
      } catch (aiError: any) {
        console.error("AI Status Check Error:", aiError);
        return res.status(502).json({ message: "AI provider error" });
      }
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  // File Upload Route
  app.post('/api/upload', isAuthenticated, upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Return full URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  return httpServer;
}
