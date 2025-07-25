import {
  users,
  servers,
  serverMetrics,
  creditTransactions,
  otpVerifications,
  type User,
  type UpsertUser,
  type Server,
  type InsertServer,
  type ServerMetric,
  type InsertServerMetric,
  type CreditTransaction,
  type InsertCreditTransaction,
  type OtpVerification,
  type InsertOtpVerification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, gt, lt } from "drizzle-orm";
import { randomUUID } from "crypto";
import 'dotenv/config';
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Server operations
  getUserServers(userId: string): Promise<Server[]>;
  createServer(server: Omit<InsertServer, 'apiKey'>): Promise<Server>;
  updateServer(id: string, updates: Partial<Server>): Promise<Server | undefined>;
  deleteServer(id: string): Promise<boolean>;
  getServerByApiKey(apiKey: string): Promise<Server | undefined>;
  
  // Server metrics operations
  addServerMetric(metric: InsertServerMetric): Promise<ServerMetric>;
  getServerMetrics(serverId: string, fromDate?: Date, toDate?: Date): Promise<ServerMetric[]>;
  getLatestServerMetrics(serverId: string): Promise<ServerMetric | undefined>;
  
  // Credits operations
  addCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getUserCreditTransactions(userId: string): Promise<CreditTransaction[]>;
  updateUserCredits(userId: string, credits: number): Promise<User | undefined>;
  activatePro(userId: string): Promise<User | undefined>;
  
  // OTP operations
  createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification>;
  verifyOtp(email: string, otp: string): Promise<OtpVerification | undefined>;
  cleanupExpiredOtps(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Server operations
  async getUserServers(userId: string): Promise<Server[]> {
    return await db.select().from(servers).where(eq(servers.userId, userId));
  }

  async createServer(server: Omit<InsertServer, 'apiKey'>): Promise<Server> {
    const apiKey = randomUUID();
    const [newServer] = await db
      .insert(servers)
      .values({ ...server, apiKey })
      .returning();
    return newServer;
  }

  async updateServer(id: string, updates: Partial<Server>): Promise<Server | undefined> {
    const [updated] = await db
      .update(servers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(servers.id, id))
      .returning();
    return updated;
  }

  async deleteServer(id: string): Promise<boolean> {
    const result = await db.delete(servers).where(eq(servers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getServerByApiKey(apiKey: string): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.apiKey, apiKey));
    return server;
  }

  // Server metrics operations
  async addServerMetric(metric: InsertServerMetric): Promise<ServerMetric> {
    const [newMetric] = await db
      .insert(serverMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  async getServerMetrics(serverId: string, fromDate?: Date, toDate?: Date): Promise<ServerMetric[]> {
    let conditions = [eq(serverMetrics.serverId, serverId)];
    
    if (fromDate && toDate) {
      conditions.push(
        gte(serverMetrics.timestamp, fromDate),
        lte(serverMetrics.timestamp, toDate)
      );
    }
    
    return await db
      .select()
      .from(serverMetrics)
      .where(and(...conditions))
      .orderBy(desc(serverMetrics.timestamp));
  }

  async getLatestServerMetrics(serverId: string): Promise<ServerMetric | undefined> {
    const [metric] = await db
      .select()
      .from(serverMetrics)
      .where(eq(serverMetrics.serverId, serverId))
      .orderBy(desc(serverMetrics.timestamp))
      .limit(1);
    return metric;
  }

  // Credits operations
  async addCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  async updateUserCredits(userId: string, credits: number): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async activatePro(userId: string): Promise<User | undefined> {
    const proExpiresAt = new Date();
    proExpiresAt.setMonth(proExpiresAt.getMonth() + 3); // 3 months from now
    
    const [updated] = await db
      .update(users)
      .set({ 
        isPro: true, 
        proExpiresAt,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // OTP verification operations
  async createOtpVerification(otp: InsertOtpVerification): Promise<OtpVerification> {
    const [result] = await db
      .insert(otpVerifications)
      .values(otp)
      .returning();
    return result;
  }

  async verifyOtp(email: string, otp: string): Promise<OtpVerification | undefined> {
    const [result] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.email, email),
          eq(otpVerifications.otp, otp),
          eq(otpVerifications.verified, false),
          gt(otpVerifications.expiresAt, new Date())
        )
      );
    
    if (result) {
      // Mark as verified
      await db
        .update(otpVerifications)
        .set({ verified: true })
        .where(eq(otpVerifications.id, result.id));
    }
    
    return result;
  }

  async cleanupExpiredOtps(): Promise<void> {
    await db
      .delete(otpVerifications)
      .where(lt(otpVerifications.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
