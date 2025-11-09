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
import {
  getSimplePrice,
  getCoinsMarkets,
  getCoinMarketChart,
  searchPools,
  getPoolInfoBaseNetwork,
  getTrendingPoolsOnBase,
  searchEthCbBtcPoolOnBase,
} from "./services/coingecko";
import {
  getCurrentPrices,
  getHistoricalPrices,
  getAllDexVolumes,
  getDexVolumesByChain,
  getDexSummary,
  getYieldPools,
  getProtocols,
  getProtocol,
  getChains,
  getTrendingPools,
  searchPoolsByTokens,
} from "./services/defillama";

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

  // CoinGecko API endpoints
  router.get("/coingecko/prices", async (req, res, next) => {
    try {
      const { coinIds, vsCurrency = "usd" } = req.query;
      if (!coinIds) {
        res.status(400).json({ message: "coinIds query parameter is required" });
        return;
      }
      const prices = await getSimplePrice(coinIds as string, vsCurrency as string);
      res.json(prices);
    } catch (error) {
      next(error);
    }
  });

  router.get("/coingecko/markets", async (req, res, next) => {
    try {
      const { vsCurrency = "usd", coinIds, perPage = "10", page = "1" } = req.query;
      const ids = coinIds ? (coinIds as string).split(",") : undefined;
      const markets = await getCoinsMarkets(
        vsCurrency as string,
        ids,
        parseInt(perPage as string),
        parseInt(page as string)
      );
      res.json(markets);
    } catch (error) {
      next(error);
    }
  });

  router.get("/coingecko/chart/:coinId", async (req, res, next) => {
    try {
      const { coinId } = req.params;
      const { vsCurrency = "usd", days = "7" } = req.query;
      const chart = await getCoinMarketChart(coinId, vsCurrency as string, days as string);
      res.json(chart);
    } catch (error) {
      next(error);
    }
  });

  router.get("/coingecko/pools/search", async (req, res, next) => {
    try {
      const { query, network } = req.query;
      if (!query) {
        res.status(400).json({ message: "query parameter is required" });
        return;
      }
      const pools = await searchPools(query as string, network as string | undefined);
      res.json(pools);
    } catch (error) {
      next(error);
    }
  });

  router.get("/coingecko/pools/base/:poolAddress", async (req, res, next) => {
    try {
      const { poolAddress } = req.params;
      const pool = await getPoolInfoBaseNetwork(poolAddress);
      res.json(pool);
    } catch (error) {
      next(error);
    }
  });

  router.get("/coingecko/pools/base/trending", async (req, res, next) => {
    try {
      const { page = "1" } = req.query;
      const trending = await getTrendingPoolsOnBase(parseInt(page as string));
      res.json(trending);
    } catch (error) {
      next(error);
    }
  });

  router.get("/coingecko/pools/eth-cbbtc", async (_req, res, next) => {
    try {
      const result = await searchEthCbBtcPoolOnBase();
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // DeFiLlama API endpoints - FREE, NO API KEY REQUIRED!

  // Token prices
  router.get("/defillama/prices/current", async (req, res, next) => {
    try {
      const { coins } = req.query;
      if (!coins) {
        res.status(400).json({ message: "coins query parameter is required (comma-separated)" });
        return;
      }
      const coinArray = (coins as string).split(",").map(c => c.trim());
      const prices = await getCurrentPrices(coinArray);
      res.json(prices);
    } catch (error) {
      next(error);
    }
  });

  router.get("/defillama/prices/historical/:timestamp", async (req, res, next) => {
    try {
      const { timestamp } = req.params;
      const { coins } = req.query;
      if (!coins) {
        res.status(400).json({ message: "coins query parameter is required (comma-separated)" });
        return;
      }
      const coinArray = (coins as string).split(",").map(c => c.trim());
      const prices = await getHistoricalPrices(parseInt(timestamp), coinArray);
      res.json(prices);
    } catch (error) {
      next(error);
    }
  });

  // DEX volumes
  router.get("/defillama/dex/all", async (_req, res, next) => {
    try {
      const volumes = await getAllDexVolumes();
      res.json(volumes);
    } catch (error) {
      next(error);
    }
  });

  router.get("/defillama/dex/chain/:chain", async (req, res, next) => {
    try {
      const { chain } = req.params;
      const volumes = await getDexVolumesByChain(chain);
      res.json(volumes);
    } catch (error) {
      next(error);
    }
  });

  router.get("/defillama/dex/:dex/summary", async (req, res, next) => {
    try {
      const { dex } = req.params;
      const summary = await getDexSummary(dex);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  // Yield pools
  router.get("/defillama/pools", async (req, res, next) => {
    try {
      const { chain } = req.query;
      const pools = await getYieldPools(chain as string | undefined);
      res.json(pools);
    } catch (error) {
      next(error);
    }
  });

  router.get("/defillama/pools/trending/:chain", async (req, res, next) => {
    try {
      const { chain } = req.params;
      const { sortBy = "tvl", limit = "10" } = req.query;
      const pools = await getTrendingPools(
        chain,
        sortBy as "apy" | "tvl" | "volume",
        parseInt(limit as string)
      );
      res.json({ pools });
    } catch (error) {
      next(error);
    }
  });

  router.get("/defillama/pools/search", async (req, res, next) => {
    try {
      const { token1, token2, chain } = req.query;
      if (!token1 || !token2) {
        res.status(400).json({ message: "token1 and token2 query parameters are required" });
        return;
      }
      const pools = await searchPoolsByTokens(
        token1 as string,
        token2 as string,
        chain as string | undefined
      );
      res.json({ pools });
    } catch (error) {
      next(error);
    }
  });

  // Protocols
  router.get("/defillama/protocols", async (_req, res, next) => {
    try {
      const protocols = await getProtocols();
      res.json({ protocols });
    } catch (error) {
      next(error);
    }
  });

  router.get("/defillama/protocol/:protocol", async (req, res, next) => {
    try {
      const { protocol } = req.params;
      const data = await getProtocol(protocol);
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  // Chains
  router.get("/defillama/chains", async (_req, res, next) => {
    try {
      const chains = await getChains();
      res.json({ chains });
    } catch (error) {
      next(error);
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
