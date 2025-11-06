import express, { Request, Response } from "express";
import { processAgentMessage, getWalletInfo, initializeAgent } from "../services/agentkit";

const router = express.Router();

initializeAgent().catch(error => {
  console.error("Failed to initialize agent:", error);
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ 
        error: "Message is required" 
      });
    }

    const response = await processAgentMessage(message);
    res.json({ success: true, response });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.get("/wallet", async (req: Request, res: Response) => {
  try {
    const walletInfo = await getWalletInfo();
    res.json({ success: true, wallet: walletInfo });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.get("/health", (req: Request, res: Response) => {
  res.json({ 
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

export default router;
