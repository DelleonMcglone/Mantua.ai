import {
  type User,
  type InsertUser,
  type Agent,
  type InsertAgent,
  type UpdateAgent,
  users,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, updates: UpdateAgent): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private agents: Map<string, Agent>;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.seedAgents();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const now = new Date().toISOString();
    const id = randomUUID();
    const created: Agent = {
      id,
      name: agent.name,
      type: agent.type,
      permissions: agent.permissions,
      memory: agent.memory ?? "",
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(id, created);
    return created;
  }

  async updateAgent(id: string, updates: UpdateAgent): Promise<Agent | undefined> {
    const existing = this.agents.get(id);
    if (!existing) return undefined;

    const merged: Agent = {
      ...existing,
      ...updates,
      permissions: updates.permissions
        ? {
            ...existing.permissions,
            ...updates.permissions,
          }
        : existing.permissions,
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(id, merged);
    return merged;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  private seedAgents(): void {
    const now = new Date().toISOString();
    const sample: Agent = {
      id: randomUUID(),
      name: "Base Flow Guardian",
      type: "defi",
      permissions: {
        canSwap: true,
        canAddLiquidity: true,
        canBridge: false,
        maxSwapUsd: 500,
        maxDailyVolumeUsd: 1500,
        requiresManualReview: true,
      },
      memory:
        "Monitors Base Sepolia liquidity opportunities and only executes swaps with MEV protection within defined limits.",
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(sample.id, sample);
  }
}

export class DbStorage implements IStorage {
  private db: any;
  private agents: Map<string, Agent>;

  constructor(db: any) {
    this.db = db;
    this.agents = new Map();
    this.seedAgents();
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const now = new Date().toISOString();
    const id = randomUUID();
    const created: Agent = {
      id,
      name: agent.name,
      type: agent.type,
      permissions: agent.permissions,
      memory: agent.memory ?? "",
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(id, created);
    return created;
  }

  async updateAgent(id: string, updates: UpdateAgent): Promise<Agent | undefined> {
    const existing = this.agents.get(id);
    if (!existing) return undefined;

    const merged: Agent = {
      ...existing,
      ...updates,
      permissions: updates.permissions
        ? {
            ...existing.permissions,
            ...updates.permissions,
          }
        : existing.permissions,
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(id, merged);
    return merged;
  }

  async deleteAgent(id: string): Promise<boolean> {
    return this.agents.delete(id);
  }

  private seedAgents(): void {
    const now = new Date().toISOString();
    const sample: Agent = {
      id: randomUUID(),
      name: "Base Flow Guardian",
      type: "defi",
      permissions: {
        canSwap: true,
        canAddLiquidity: true,
        canBridge: false,
        maxSwapUsd: 500,
        maxDailyVolumeUsd: 1500,
        requiresManualReview: true,
      },
      memory:
        "Monitors Base Sepolia liquidity opportunities and only executes swaps with MEV protection within defined limits.",
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(sample.id, sample);
  }
}

function createStorage(): IStorage {
  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    try {
      const { db } = require("./db");
      console.log("✅ Using PostgreSQL database for production");
      return new DbStorage(db);
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      console.log("⚠️  Falling back to in-memory storage");
      return new MemStorage();
    }
  }
  console.log("📝 Using in-memory storage for development");
  return new MemStorage();
}

export const storage = createStorage();
