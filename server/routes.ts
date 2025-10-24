import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import {
  agentSchema,
  insertAgentSchema,
  updateAgentSchema,
} from "@shared/schema";
import { z } from "zod";
import { storage } from "./storage";
import { parseIntent } from "./services/intent";
import { analyzeQuestion } from "./services/analyze";

const parseIntentSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

const analyzeRequestSchema = z.object({
  question: z.string().trim().min(5).max(500),
});

function handleRouteError(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof z.ZodError) {
    res.status(400).json({
      message: "Invalid request",
      issues: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof Error) {
    if (error.message === "UNSUPPORTED_ANALYSIS") {
      res.status(400).json({
        message: "That question isn't supported yet. Try a TVL or trending tokens query.",
      });
      return;
    }

    if (
      error.message === "NO_CHAIN_DATA" ||
      error.message === "NO_TRENDING_DATA" ||
      error.message === "NO_DATA"
    ) {
      res.status(502).json({
        message: "No data available from upstream sources.",
      });
      return;
    }
  }

  next(error);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  router.post("/ai/parse_intent", (req, res, next) => {
    try {
      const { message } = parseIntentSchema.parse(req.body);
      const result = parseIntent(message);
      res.json(result);
    } catch (error) {
      handleRouteError(error, req, res, next);
    }
  });

  router.post("/ai/analyze", async (req, res, next) => {
    try {
      const { question } = analyzeRequestSchema.parse(req.body);
      const analysis = await analyzeQuestion(question);
      res.json(analysis);
    } catch (error) {
      handleRouteError(error, req, res, next);
    }
  });

  router.get("/agents", async (_req, res, next) => {
    try {
      const agents = await storage.listAgents();
      res.json({ agents });
    } catch (error) {
      next(error);
    }
  });

  router.get("/agents/:id", async (req, res, next) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.json(agent);
    } catch (error) {
      next(error);
    }
  });

  router.post("/agents", async (req, res, next) => {
    try {
      const payload = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(payload);
      res.status(201).json(agentSchema.parse(agent));
    } catch (error) {
      handleRouteError(error, req, res, next);
    }
  });

  router.put("/agents/:id", async (req, res, next) => {
    try {
      const payload = updateAgentSchema.parse({
        ...req.body,
        id: req.params.id,
      });
      const updated = await storage.updateAgent(req.params.id, payload);
      if (!updated) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.json(agentSchema.parse(updated));
    } catch (error) {
      handleRouteError(error, req, res, next);
    }
  });

  router.delete("/agents/:id", async (req, res, next) => {
    try {
      const removed = await storage.deleteAgent(req.params.id);
      if (!removed) {
        res.status(404).json({ message: "Agent not found" });
        return;
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
