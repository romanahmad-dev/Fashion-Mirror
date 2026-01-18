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
      
      // Initial creation in DB
      const tryOn = await storage.createTryOn({
        ...input,
        userId,
        status: 'starting' as const
      });

      // Trigger FASHN API
      try {
        if (!process.env.FASHN_API_KEY) {
          throw new Error("FASHN API Key not configured");
        }

        const response = await fetch("https://api.fashn.ai/v1/run", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.FASHN_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model_name: "fashn-tryon-v1", // Adjust model name if needed
            inputs: {
              model_image: input.modelImage,
              garment_image: input.garmentImage,
              category: input.category
            }
          })
        });

        if (!response.ok) {
          throw new Error(`FASHN API Error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Update with prediction ID
        await storage.updateTryOnPredictionId(tryOn.id, data.id);
        await storage.updateTryOnStatus(tryOn.id, 'processing');

      } catch (apiError: any) {
        console.error("FASHN API Error:", apiError);
        await storage.updateTryOnStatus(tryOn.id, 'failed', undefined, apiError.message);
      }

      res.status(201).json(tryOn);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create try-on" });
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

      // Poll FASHN API
      const response = await fetch(`https://api.fashn.ai/v1/status/${tryOn.predictionId}`, {
        headers: {
          "Authorization": `Bearer ${process.env.FASHN_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to check status with FASHN API");
      }

      const data = await response.json();
      
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
