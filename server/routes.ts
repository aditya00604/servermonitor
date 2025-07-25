import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { setupOAuth } from "./oauth";
import { insertServerSchema, insertServerMetricSchema, insertCreditTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { getHelpResponse } from "./gemini";
import 'dotenv/config';
export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupOAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Server routes
  app.get('/api/servers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const servers = await storage.getUserServers(userId);
      
      // Add latest metrics to each server
      const serversWithMetrics = await Promise.all(
        servers.map(async (server) => {
          const latestMetrics = await storage.getLatestServerMetrics(server.id);
          return { ...server, latestMetrics };
        })
      );
      
      res.json(serversWithMetrics);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.post('/api/servers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check server limit (10 servers max)
      const userServers = await storage.getUserServers(userId);
      if (userServers.length >= 10) {
        return res.status(400).json({ 
          message: "Server limit reached. You can monitor up to 10 servers." 
        });
      }

      const serverData = insertServerSchema.parse(req.body);
      const server = await storage.createServer({ 
        ...serverData,
        userId
      });
      res.json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid server data", errors: error.errors });
      }
      console.error("Error creating server:", error);
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  app.put('/api/servers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const server = await storage.updateServer(id, updates);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json(server);
    } catch (error) {
      console.error("Error updating server:", error);
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  app.delete('/api/servers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteServer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json({ message: "Server deleted successfully" });
    } catch (error) {
      console.error("Error deleting server:", error);
      res.status(500).json({ message: "Failed to delete server" });
    }
  });

  // Metrics endpoint for Python agent
  app.post('/api/metrics/:apiKey', async (req, res) => {
    try {
      const { apiKey } = req.params;
      const server = await storage.getServerByApiKey(apiKey);
      
      if (!server) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const metricData = insertServerMetricSchema.parse(req.body);
      const metric = await storage.addServerMetric({ ...metricData, serverId: server.id });
      
      // Update server status
      await storage.updateServer(server.id, {
        lastSeen: new Date(),
        isOnline: true,
      });

      res.json(metric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      console.error("Error adding metric:", error);
      res.status(500).json({ message: "Failed to add metric" });
    }
  });

  app.get('/api/servers/:id/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { from, to } = req.query;
      
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      
      const metrics = await storage.getServerMetrics(id, fromDate, toDate);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Credits routes
  app.post('/api/credits/watch-ad', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add credit transaction
      await storage.addCreditTransaction({
        userId,
        amount: 1,
        type: 'ad_watch',
        description: 'Watched advertisement',
      });

      // Update user credits
      const updatedUser = await storage.updateUserCredits(userId, user.credits + 1);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error processing ad watch:", error);
      res.status(500).json({ message: "Failed to process ad watch" });
    }
  });

  app.post('/api/credits/activate-pro', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.credits < 16) {
        return res.status(400).json({ message: "Insufficient credits. You need 16 credits to activate Pro." });
      }

      // Deduct credits and activate Pro
      await storage.addCreditTransaction({
        userId,
        amount: -16,
        type: 'pro_purchase',
        description: '3-month Pro subscription',
      });

      await storage.updateUserCredits(userId, user.credits - 16);
      const updatedUser = await storage.activatePro(userId);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error activating Pro:", error);
      res.status(500).json({ message: "Failed to activate Pro" });
    }
  });

  app.get('/api/credits/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const transactions = await storage.getUserCreditTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const servers = await storage.getUserServers(userId);
      
      const stats = {
        totalServers: servers.length,
        onlineServers: servers.filter(s => s.isOnline).length,
        offlineServers: servers.filter(s => !s.isOnline).length,
        avgCpuUsage: 0,
        avgMemoryUsage: 0,
      };

      // Calculate average CPU and memory usage
      if (servers.length > 0) {
        const onlineServers = servers.filter(s => s.isOnline);
        if (onlineServers.length > 0) {
          const metrics = await Promise.all(
            onlineServers.map(s => storage.getLatestServerMetrics(s.id))
          );
          
          const validMetrics = metrics.filter(m => m !== undefined);
          if (validMetrics.length > 0) {
            stats.avgCpuUsage = Math.round(
              validMetrics.reduce((sum, m) => sum + m!.cpuUsage, 0) / validMetrics.length
            );
            stats.avgMemoryUsage = Math.round(
              validMetrics.reduce((sum, m) => sum + m!.memoryUsage, 0) / validMetrics.length
            );
          }
        }
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // OTP Authentication Routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email is required" });
      }
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set expiration to 15 minutes from now
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      // Clean up old OTPs first
      await storage.cleanupExpiredOtps();
      
      // Save OTP to database
      await storage.createOtpVerification({
        email,
        otp,
        expiresAt
      });
      
      // TODO: Send OTP via email (requires SendGrid setup)
      console.log(`OTP for ${email}: ${otp}`);
      
      res.json({ 
        message: "OTP sent to your email address",
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
      
      // Verify OTP
      const verification = await storage.verifyOtp(email, otp);
      
      if (!verification) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Check if user exists, create if not
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.upsertUser({
          id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email,
          emailVerified: true,
          firstName: email.split('@')[0], // Use email prefix as first name
        });
      }
      
      // Create session for OTP verified user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Failed to create session" });
        }
      });
      
      res.json({ 
        message: "OTP verified successfully",
        user: user
      });
      
      res.json({ 
        message: "OTP verified successfully",
        user: user
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Gemini chat support
  app.post('/api/chat/help', isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await getHelpResponse(message);
      res.json({ response });
    } catch (error) {
      console.error("Error processing chat request:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  // Static file serving for monitor agent
  app.get('/monitor_agent.py', (req, res) => {
    const path = require('path');
    res.sendFile(path.join(process.cwd(), 'monitor_agent.py'));
  });

  const httpServer = createServer(app);
  return httpServer;
}
