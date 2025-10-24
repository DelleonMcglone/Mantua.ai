import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const agentTypeSchema = z.enum(["defi", "research"]);

export const agentPermissionsSchema = z.object({
  canSwap: z.boolean().default(false),
  canAddLiquidity: z.boolean().default(false),
  canBridge: z.boolean().default(false),
  maxSwapUsd: z.number().min(0).nullable().optional(),
  maxDailyVolumeUsd: z.number().min(0).nullable().optional(),
  requiresManualReview: z.boolean().default(true),
});

const agentCoreSchema = z.object({
  name: z.string().min(1).max(80),
  type: agentTypeSchema,
  permissions: agentPermissionsSchema,
  memory: z.string().max(4000).default(""),
});

export const insertAgentSchema = agentCoreSchema;

export const agentSchema = agentCoreSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const updateAgentSchema = agentCoreSchema.partial().extend({
  name: z.string().min(1).max(80).optional(),
  id: z.string(),
});

export type AgentPermissions = z.infer<typeof agentPermissionsSchema>;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type UpdateAgent = z.infer<typeof updateAgentSchema>;
