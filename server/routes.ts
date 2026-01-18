import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- Speed Test Endpoints ---

  // Ping endpoint - minimal processing
  app.get(api.speedtest.ping.path, (req, res) => {
    res.json({ timestamp: Date.now() });
  });

  // Download endpoint - streams random data
  app.get(api.speedtest.download.path, (req, res) => {
    const size = Number(req.query.size) || 1024 * 1024; // Default 1MB
    const chunkSize = 64 * 1024; // 64KB chunks
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', size);

    // Create a reusable buffer of random data to avoid CPU overhead of generating it constantly
    const buffer = randomBytes(Math.min(size, chunkSize));
    
    let bytesSent = 0;
    
    function write() {
      let ok = true;
      while (bytesSent < size && ok) {
        const remaining = size - bytesSent;
        const toSend = Math.min(remaining, buffer.length);
        
        // If we need a smaller chunk at the end, slice it
        const chunk = toSend === buffer.length ? buffer : buffer.slice(0, toSend);
        
        ok = res.write(chunk);
        bytesSent += toSend;
      }
      
      if (bytesSent < size) {
        // Apply backpressure
        res.once('drain', write);
      } else {
        res.end();
      }
    }
    
    write();
  });

  // Upload endpoint - accepts data and discards it
  app.post(api.speedtest.upload.path, (req, res) => {
    let received = 0;
    
    req.on('data', (chunk) => {
      received += chunk.length;
    });
    
    req.on('end', () => {
      res.json({ received });
    });
    
    req.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).end();
    });
  });

  // --- Results API ---

  app.get(api.results.list.path, async (req, res) => {
    const results = await storage.getTestResults();
    res.json(results);
  });

  app.post(api.results.create.path, async (req, res) => {
    try {
      const input = api.results.create.input.parse(req.body);
      // Capture IP from request if not provided (though for privacy we might rely on client sending what it sees, or just store a masked version)
      // For this app, we'll respect the input or fallback to request ip
      const result = await storage.createTestResult({
        ...input,
        ipAddress: input.ipAddress || req.ip || 'unknown'
      });
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
