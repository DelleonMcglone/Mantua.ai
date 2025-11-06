import { AgentKit } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_DATA_FILE = path.join(__dirname, "../data/wallet_data.txt");

const dataDir = path.dirname(WALLET_DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface AgentState {
  agent: any;
  agentkit: any;
  config: any;
  walletAddress?: string;
}

let agentState: AgentState | null = null;

export async function initializeAgent(): Promise<AgentState> {
  console.log("🔄 Initializing AgentKit...");

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set");
    }
    if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
      throw new Error("CDP API keys not set");
    }

    const agentKitConfig: any = {
      cdpApiKeyName: process.env.CDP_API_KEY_NAME,
      cdpApiKeyPrivate: process.env.CDP_API_KEY_PRIVATE_KEY,
    };

    if (fs.existsSync(WALLET_DATA_FILE)) {
      console.log("📂 Loading existing wallet...");
      agentKitConfig.cdpWalletData = fs.readFileSync(WALLET_DATA_FILE, "utf8");
    } else {
      console.log("🆕 Creating new wallet...");
    }

    const agentkit = await AgentKit.from(agentKitConfig);
    const exportedWallet = await agentkit.exportWallet();
    fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);
    
    const wallet = await agentkit.getWallet();
    const walletAddress = wallet.getDefaultAddress();
    console.log(`💼 Wallet Address: ${walletAddress}`);

    const tools = await getLangChainTools(agentkit);
    console.log(`🔧 Loaded ${tools.length} blockchain tools`);

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });

    const memory = new MemorySaver();

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `You are a helpful crypto AI agent powered by Coinbase AgentKit on Mantua Protocol.

**Your Capabilities:**
- Check wallet balances and details
- Send tokens (ETH, USDC, etc.)
- Swap tokens on DEXs
- Deploy ERC-20 tokens and NFT collections
- Request testnet funds from faucet
- Trade and interact with DeFi
- Register basenames on Base
- 50+ blockchain operations

**Your Wallet:**
- Address: ${walletAddress}
- Network: ${process.env.NETWORK_ID || "base-sepolia"}

**Guidelines:**
- Explain actions before executing
- Use faucet freely on testnet
- Be concise and helpful
- Provide transaction hashes
- Use emojis for engagement

You're on testnet - request funds from faucet when needed!`,
    });

    const config = { 
      configurable: { 
        thread_id: "mantua-agent" 
      } 
    };

    console.log("✅ AgentKit initialized!");

    agentState = { agent, agentkit, config, walletAddress: walletAddress.toString() };
    return agentState;
  } catch (error: any) {
    console.error("❌ Failed to initialize AgentKit:", error);
    throw new Error(`AgentKit initialization failed: ${error.message}`);
  }
}

export async function getAgent(): Promise<AgentState> {
  if (!agentState) {
    agentState = await initializeAgent();
  }
  return agentState;
}

export async function processAgentMessage(message: string): Promise<string> {
  try {
    const { agent, config } = await getAgent();
    console.log(`📨 Processing: ${message.substring(0, 50)}...`);

    const stream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      config
    );

    let lastMessage = "";

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        const content = chunk.agent.messages[0].content;
        if (content && typeof content === "string") {
          lastMessage = content;
        }
      }
    }

    return lastMessage || "I processed your request but didn't generate a response.";
  } catch (error: any) {
    console.error("❌ Agent error:", error);
    return `Error: ${error.message}`;
  }
}

export async function getWalletInfo(): Promise<any> {
  try {
    const { walletAddress } = await getAgent();
    return {
      address: walletAddress,
      network: process.env.NETWORK_ID || "base-sepolia",
    };
  } catch (error: any) {
    throw error;
  }
}
