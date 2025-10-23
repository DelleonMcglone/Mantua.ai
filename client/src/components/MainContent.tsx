import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import ChatInput from "./ChatInput";
import SwapPage from "@/pages/Swap";
import AddLiquidityPage from "@/pages/AddLiquidity";
import { useState, useEffect, useRef, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation } from "wouter";

type ActionId = 'swap' | 'add-liquidity' | 'explore-agents' | 'analyze';
type HookContext = "swap" | "liquidity";

interface SwapIntentState {
  sellToken?: string;
  buyToken?: string;
  selectedHook?: string;
  showCustomHook?: boolean;
  showCustomHookModal?: boolean;
  hookWarning?: string;
}

interface SwapSuccessPayload {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  transactionHash: string;
}

interface LiquidityIntentState {
  token1?: string;
  token2?: string;
  selectedHook?: string;
  showCustomHook?: boolean;
  hookWarning?: string;
}

interface HookResolution {
  selectedHook?: string;
  showCustomHook?: boolean;
  showCustomHookModal?: boolean;
  hookWarning?: string;
}

const SINGLE_WORD_ACTIONS = ["swap", "analyze", "agent", "explore"] as const;
const MULTI_WORD_ACTIONS = ["add liquidity", "remove liquidity"] as const;
const AFFIRMATIVE_RESPONSES = new Set(["yes", "y", "yeah", "yep", "sure", "confirm", "correct"]);
const NEGATIVE_RESPONSES = new Set(["no", "n", "nope", "cancel"]);
const DISALLOWED_TOKENS = new Set(["WETH", "DAI", "CBBTC"]);
const UNSUPPORTED_TOKEN_MESSAGE = "WETH, DAI, and CBBTC are not currently supported on Mantua.AI.";

interface ClarificationRequest {
  suggestion: string;
  normalizedSuggestion: string;
  keyword: string;
}

function computeLevenshtein(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  const matrix: number[][] = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));

  for (let i = 0; i <= lenA; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[lenA][lenB];
}

function applyWordCasing(source: string | undefined, target: string): string {
  if (!source) return target;
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source === source.toLowerCase()) return target.toLowerCase();
  if (source[0] === source[0].toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

function detectCommandClarification(message: string): ClarificationRequest | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  const words = trimmed.split(/\s+/);
  const firstWord = words[0]?.toLowerCase() ?? "";

  for (const keyword of SINGLE_WORD_ACTIONS) {
    if (!firstWord || firstWord === keyword) continue;
    const distance = computeLevenshtein(firstWord, keyword);
    if (distance > 0 && distance < 2) {
      const suggestionWords = [...words];
      suggestionWords[0] = applyWordCasing(words[0], keyword);
      const suggestion = suggestionWords.join(" ");
      return {
        suggestion,
        normalizedSuggestion: suggestion.toLowerCase(),
        keyword,
      };
    }
  }

  if (words.length >= 2) {
    const normalizedPair = `${words[0].toLowerCase()} ${words[1].toLowerCase()}`;
    for (const keyword of MULTI_WORD_ACTIONS) {
      if (normalizedPair === keyword) continue;
      const distance = computeLevenshtein(normalizedPair, keyword);
      if (distance > 0 && distance < 2) {
        const suggestionWords = [...words];
        const [keywordFirst, keywordSecond] = keyword.split(" ");
        suggestionWords[0] = applyWordCasing(words[0], keywordFirst);
        suggestionWords[1] = applyWordCasing(words[1], keywordSecond);
        const suggestion = suggestionWords.join(" ");
        return {
          suggestion,
          normalizedSuggestion: suggestion.toLowerCase(),
          keyword,
        };
      }
    }
  }

  return null;
}

function isAffirmativeResponse(message: string): boolean {
  return AFFIRMATIVE_RESPONSES.has(message);
}

function isNegativeResponse(message: string): boolean {
  return NEGATIVE_RESPONSES.has(message);
}

function isTokenUnsupported(token?: string): boolean {
  if (!token) return false;
  if (token === "cbBTC") return false;
  return DISALLOWED_TOKENS.has(token.toUpperCase());
}

function canonicalizeTokenSymbol(token: string): string {
  if (!token) return token;
  if (token.toLowerCase() === "cbbtc") {
    return "cbBTC";
  }
  return token.toUpperCase();
}

const HOOK_UNRECOGNIZED_MESSAGES: Record<HookContext, string> = {
  swap: `Unrecognized Hook — You asked to swap using a hook that isn't in Mantua's supported library yet.
You can paste the hook's address to validate it, pick a supported hook, or continue without a hook.`,
  liquidity: `You asked to Add Liquidity using a hook that isn't in Mantua's supported library yet.
You can paste the hook's address to validate it, pick a supported hook, or continue without a hook.`,
}; // SWAP FIX: unify unsupported hook messaging

const SUPPORTED_HOOKS = [
  { keyword: "dynamic fee", value: "dynamic-fee" },
  { keyword: "twamm", value: "twamm" },
  { keyword: "mev protection", value: "mev-protection" },
]; // SWAP FIX: Unrecognized hook handler

const swapDefaults: Readonly<SwapIntentState> = {
  sellToken: "",
  buyToken: "",
  selectedHook: "no-hook",
  showCustomHook: false,
  showCustomHookModal: false,
}; // SWAP: baseline swap configuration

const liquidityDefaults: Readonly<LiquidityIntentState> = {
  token1: "",
  token2: "",
  selectedHook: "no-hook",
  showCustomHook: false,
}; // LIQUIDITY FIX: baseline liquidity configuration

export default function MainContent() {
  const [isDark, setIsDark] = useState(false);
  const [activeComponent, setActiveComponent] = useState<null | "swap" | "liquidity">(null);
  const [swapProps, setSwapProps] = useState<SwapIntentState | null>(null);
  const [liquidityProps, setLiquidityProps] = useState<LiquidityIntentState | null>(null); // LIQUIDITY FIX: track liquidity intent props
  const { currentChat, addMessage, updateAgentMode, createNewChat } = useChatContext();
  const [location] = useLocation();
  const account = useActiveAccount();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingChatIdRef = useRef<string | null>(null);
  const previousChatIdRef = useRef<string | null>(null);
  const pendingClarificationsRef = useRef<Record<string, ClarificationRequest | undefined>>({}); // SWAP REGRESSION FIX: track clarification prompts
  const [swapIntentKey, setSwapIntentKey] = useState<number>(0); // SWAP: track swap intent resets
  const [liquidityIntentKey, setLiquidityIntentKey] = useState<number>(0); // LIQUIDITY FIX: track liquidity intent resets

  const mergeSwapIntent = useCallback(
    (nextProps: SwapIntentState) => {
      setSwapProps((current) => {
        const base = current ?? swapDefaults;
        return {
          ...base,
          sellToken: nextProps.sellToken || base.sellToken,
          buyToken: nextProps.buyToken || base.buyToken,
          selectedHook: nextProps.selectedHook ?? base.selectedHook,
          showCustomHook: nextProps.showCustomHook ?? base.showCustomHook,
          showCustomHookModal: nextProps.showCustomHookModal ?? base.showCustomHookModal ?? false,
          hookWarning: nextProps.hookWarning,
        };
      });
    },
    [],
  ); // SWAP REGRESSION FIX: merge swap intent without unmounting

  const activateSwap = useCallback(
    (nextProps?: SwapIntentState) => {
      const initialIntent: SwapIntentState = {
        ...swapDefaults,
        ...nextProps,
      };
      setSwapProps(initialIntent);
      setSwapIntentKey((key) => key + 1);
      setLiquidityProps(null); // SWAP FIX: ensure single active flow
      setActiveComponent("swap");
    },
    [],
  ); // SWAP: centralize swap activation

  const exitSwapMode = useCallback(() => {
    setActiveComponent(null);
    setSwapProps(null);
  }, []); // SWAP: reset swap mode when dismissed

  const mergeLiquidityIntent = useCallback(
    (nextProps: LiquidityIntentState) => {
      setLiquidityProps((current) => {
        const base = current ?? liquidityDefaults;
        return {
          ...base,
          token1: nextProps.token1 || base.token1,
          token2: nextProps.token2 || base.token2,
          selectedHook: nextProps.selectedHook ?? base.selectedHook,
          showCustomHook: nextProps.showCustomHook ?? base.showCustomHook,
          hookWarning: nextProps.hookWarning,
        };
      });
    },
    [],
  ); // LIQUIDITY REGRESSION FIX: merge liquidity intent without unmounting

  const activateLiquidity = useCallback(
    (nextProps?: LiquidityIntentState) => {
      const initialIntent: LiquidityIntentState = {
        ...liquidityDefaults,
        ...nextProps,
      };
      setLiquidityProps(initialIntent);
      setLiquidityIntentKey((key) => key + 1);
      setSwapProps(null); // LIQUIDITY FIX: clear swap state when liquidity is active
      setActiveComponent("liquidity");
    },
    [],
  ); // LIQUIDITY FIX: centralize liquidity activation

  const exitLiquidityMode = useCallback(() => {
    setActiveComponent(null);
    setLiquidityProps(null);
  }, []); // LIQUIDITY FIX: reset liquidity mode when dismissed

  const handleSwapIntent = useCallback(
    (intent: SwapIntentState, chatId: string) => {
      if (isTokenUnsupported(intent.sellToken) || isTokenUnsupported(intent.buyToken)) {
        addMessage(
          {
            content: UNSUPPORTED_TOKEN_MESSAGE,
            sender: "assistant",
          },
          chatId,
        );
        return true;
      }

      if (activeComponent === "swap") {
        mergeSwapIntent(intent);
      } else {
        activateSwap(intent);
      }

      if (intent.hookWarning) {
        addMessage(
          {
            content: intent.hookWarning,
            sender: "assistant",
          },
          chatId,
        );
      }

      return true;
    },
    [activateSwap, activeComponent, addMessage, mergeSwapIntent],
  ); // SWAP REGRESSION FIX: centralized swap intent handler

  const handleLiquidityIntent = useCallback(
    (intent: LiquidityIntentState, chatId: string) => {
      if (isTokenUnsupported(intent.token1) || isTokenUnsupported(intent.token2)) {
        addMessage(
          {
            content: UNSUPPORTED_TOKEN_MESSAGE,
            sender: "assistant",
          },
          chatId,
        );
        return true;
      }

      if (activeComponent === "liquidity") {
        mergeLiquidityIntent(intent);
      } else {
        activateLiquidity(intent);
      }

      if (intent.hookWarning) {
        addMessage(
          {
            content: intent.hookWarning,
            sender: "assistant",
          },
          chatId,
        );
      }

      return true;
    },
    [activateLiquidity, activeComponent, addMessage, mergeLiquidityIntent],
  ); // LIQUIDITY REGRESSION FIX: centralized liquidity intent handler

  const isWalletConnected = Boolean(account);

  // Derived state from current chat
  const chatMessages = currentChat ? currentChat.messages : [];
  const messageCount = chatMessages.length;
  const hasPrompted = isWalletConnected && messageCount > 0;
  const isAgentMode = Boolean(currentChat?.isAgentMode);
  const isSwapModeActive = activeComponent === "swap"; // SWAP: synchronize swap mode state
  const isLiquidityModeActive = activeComponent === "liquidity"; // LIQUIDITY FIX: synchronize add-liquidity mode

  // Debug logging
  useEffect(() => {
    console.log(`[MainContent] State update:`, {
      hasAccount: !!account,
      currentChatId: currentChat?.id,
      messageCount: chatMessages.length,
      hasPrompted,
      location
    });
  }, [account, currentChat, chatMessages, hasPrompted, location]);

  useEffect(() => {
    if (currentChat?.id) {
      pendingChatIdRef.current = currentChat.id;
    }
  }, [currentChat?.id]);

  const shortenedAddress = account
    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
    : "";

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Reset transient UI state when switching between chat threads
  useEffect(() => {
    const newChatId = currentChat?.id ?? null;

    if (!newChatId) {
      setActiveComponent(null);
      setSwapProps(null);
      setLiquidityProps(null);
      previousChatIdRef.current = null;
      return;
    }

    if (
      previousChatIdRef.current &&
      previousChatIdRef.current !== newChatId
    ) {
      setActiveComponent(null);
      setSwapProps(null);
      setLiquidityProps(null);
    }

    previousChatIdRef.current = newChatId;
  }, [currentChat?.id]);

  // Auto-scroll to bottom when new messages are added and the wallet is connected
  useEffect(() => {
    if (!isWalletConnected || !currentChat) return;
    if (chatMessages.length === 0) return;

    // Keep the most recent exchange in view without abrupt jumps
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, currentChat?.id, isWalletConnected]);

  // Mock assistant responses
  const getMockAssistantResponse = (userMessage: string): string => {
    const responses = [
      "I understand you're asking about DeFi operations. Let me help you with that.",
      "Great question! In the DeFi space, there are several approaches to consider...",
      "I can help you navigate that DeFi strategy. Here's what I recommend...",
      "That's an excellent point about liquidity management. Let me explain the options...",
      "For yield farming and staking, here are the key considerations...",
      "Regarding swap operations, I can guide you through the best practices...",
      "Token analysis shows some interesting patterns. Here's my assessment...",
      "Risk management is crucial in DeFi. Let me break down the key factors..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle action button clicks with predefined content
  const handleActionClick = (actionId: string) => {
    const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!activeChatId) return; // No active chat to add messages to

    if (actionId === 'explore-agents') {
      // Enter Agent mode
      updateAgentMode(true, activeChatId);
      return;
    }
    
    const actionContent = getActionContent(actionId as ActionId);
    
    // Add assistant response only if there's content
    if (actionContent) {
      addMessage({
        content: actionContent,
        sender: 'assistant'
      }, activeChatId);
    }
    
    // Handle component activation for swap
    if (actionId === 'swap') {
      activateSwap(); // SWAP FIX: normalize swap activation path
    }
    
    // Handle component activation for add-liquidity
    if (actionId === 'add-liquidity') {
      activateLiquidity(); // LIQUIDITY FIX: normalize liquidity activation path
    }
  };

  const processClarifiedCommand = (suggestedMessage: string, chatId: string) => {
    const trimmedSuggestion = suggestedMessage.trim();
    if (!trimmedSuggestion) return;

    if (!isWalletConnected) {
      addMessage(
        {
          content: "Please connect your wallet to continue.",
          sender: "assistant",
        },
        chatId,
      );
      return;
    }

    const swapIntent = parseSwapIntent(trimmedSuggestion);
    if (swapIntent) {
      handleSwapIntent(swapIntent, chatId);
      return;
    }

    const liquidityIntent = parseLiquidityIntent(trimmedSuggestion);
    if (liquidityIntent) {
      handleLiquidityIntent(liquidityIntent, chatId);
      return;
    }

    const normalizedSuggestion = trimmedSuggestion.toLowerCase();
    if (normalizedSuggestion === "analyze") {
      handleActionClick("analyze");
      return;
    }

    if (normalizedSuggestion === "explore" || normalizedSuggestion.startsWith("explore ")) {
      handleActionClick("explore-agents");
      return;
    }

    if (normalizedSuggestion === "agent") {
      handleActionClick("explore-agents");
      return;
    }

    if (normalizedSuggestion.startsWith("remove liquidity")) {
      addMessage(
        {
          content: "Remove Liquidity flows aren't supported yet, but I'm tracking your request.",
          sender: "assistant",
        },
        chatId,
      );
      return;
    }

    addMessage(
      {
        content: getMockAssistantResponse(trimmedSuggestion),
        sender: "assistant",
      },
      chatId,
    );
  }; // SWAP REGRESSION FIX: resume intent execution after clarification

  // Get predefined content for action buttons
  const getActionContent = (actionId: ActionId): string => {
    switch (actionId) {
      case 'swap':
        return ''; // No intro text for swap - just show component

      case 'add-liquidity':
        return ''; // No intro text for add liquidity - just show component

      case 'analyze':
        return `Uniswap v4 Overview (Base)
What changed from v3 → v4: v4 introduces a singleton architecture via the PoolManager, so pools live inside one contract; and hooks let builders add programmable logic (dynamic fees, MEV protection, etc.) at the pool level. Gas usage is reduced with native "flash accounting," and liquidity positions move to ERC-1155 (vs v3's ERC-721). (Uniswap Docs)

Ethereum mainnet anchor (context): The canonical PoolManager on Ethereum mainnet is 0x000000000004444C5dC75cB358380D2e3DE08A90. If you're reading v4 articles or SDK examples, they often reference this address. (Ethereum (ETH) Blockchain Explorer)

Core Uniswap v4 Components (what Mantua users will see)
- PoolManager (singleton): single entry point for swaps, mints/burns, and pool state.
- PositionManager (ERC-1155): creates/manages LP positions.
- Quoter: off-chain pricing and quote simulation.
- StateView: read-only state helpers for pools/positions.
- Universal Router: user-facing router for swaps/liquidity.
- Permit2: shared approvals/allowances used across chains. (Uniswap Docs)

Uniswap v4 — Contract Addresses on Base

Base Mainnet (Chain ID 8453)
PoolManager: 0x498581fF718922C3f8E6A244956Af099b2652B2B
PositionDescriptor: 0x25D093633990dC94bEDEeD76C8F3cdaa75F3E7D5
PositionManager: 0x7C5F5A4bbD8Fd63184577525326123b519429Bdc
Quoter: 0x0D5E0F971ed27FbfF6c2837BF31316121532048D
StateView: 0xA3C0c9B65Bad0B08107aA264b0F3DB444B867a71
Universal Router: 0x6fF5693b99212Da76ad316178A184AB56D299b43
Permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3

Base Sepolia (Testnet, Chain ID 84532)
PoolManager: 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408
PositionManager: 0x4b2C77D209d3405F41A037eC6C77F7F5B8E2cA80
Quoter: 0x4A6513C898fE1B2D0E78D3B0E0A4a151589B1cBa
StateView: 0x571291B572eD32cE6751a2cB2486eBEE8defB9B4
Universal Router: 0x492E6456D9528771018DeB9E87ef7750EF184104
Permit2: 0x000000000022D473030F116dDEE9F6B43aC78BA3
Source: Uniswap v4 official deployments (Uniswap Docs)`;
      
      case 'explore-agents':
        // This is handled separately in handleActionClick
        return "";
      
      default:
        // This should never happen with proper TypeScript typing
        const _exhaustiveCheck: never = actionId;
        return "";
    }
  };

  // Handle agent action button clicks
  const handleAgentAction = (action: string) => {
    const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!activeChatId) return; // No active chat to add messages to
    
    addMessage({
      content: `Executing agent action: ${action}`,
      sender: 'assistant'
    }, activeChatId);
  };

  // Exit Agent mode
  const exitAgentMode = () => {
    const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!activeChatId) return;
    updateAgentMode(false, activeChatId);
  };

  // SWAP FIX: derive hook metadata from free-form phrases (shared with liquidity flow)
  const resolveHookDetails = (phrase: string, context: HookContext): HookResolution => {
    const normalized = phrase.toLowerCase();
    const unsupportedMessage = HOOK_UNRECOGNIZED_MESSAGES[context];

    if (normalized.includes("hook not in library")) {
      return {
        selectedHook: "no-hook",
        showCustomHook: false,
        hookWarning: unsupportedMessage,
      };
    }

    if (normalized.includes("my custom hook")) {
      return {
        selectedHook: "custom",
        showCustomHook: true,
        showCustomHookModal: context === "swap",
      };
    }

    if (normalized.includes("custom hook")) {
      return {
        selectedHook: "custom",
        showCustomHook: true,
      };
    }

    const supportedHook = SUPPORTED_HOOKS.find(({ keyword }) => normalized.includes(keyword)); // SWAP FIX: Unrecognized hook handler
    if (supportedHook) {
      return { selectedHook: supportedHook.value };
    }

    const genericHookMatch =
      normalized.match(/(?:swap|add\s+liquidity|provide\s+liquidity)(?:\s+[a-z0-9\/]+)*\s+with\s+([a-z0-9\s-]+)/i) ??
      normalized.match(/with\s+([a-z0-9\s-]+)/i);
    // SWAP FIX: Unrecognized hook handler

    if (genericHookMatch) {
      const requestedHookRaw = genericHookMatch[1].trim();
      if (requestedHookRaw) {
        const cleanedRequested = requestedHookRaw.replace(/hook$/, "").trim();
        const isSupported = SUPPORTED_HOOKS.some(({ keyword }) =>
          cleanedRequested.includes(keyword),
        );
        const isCustomRequest = cleanedRequested.includes("custom");
        if (!isSupported && !isCustomRequest) {
          return {
            selectedHook: "no-hook",
            showCustomHook: false,
            hookWarning: unsupportedMessage,
          }; // SWAP FIX: Unrecognized hook handler
        }
      }
    }

    const contextPrefixes =
      context === "swap"
        ? ["swap"]
        : ["add liquidity", "provide liquidity"];

    if (!contextPrefixes.some((prefix) => normalized.startsWith(prefix))) {
      const fragment = normalized.trim();
      if (fragment) {
        const cleanedFragment = fragment.replace(/hook$/, "").trim();
        const isSupportedFragment = SUPPORTED_HOOKS.some(({ keyword }) =>
          cleanedFragment.includes(keyword),
        );
        const isCustomFragment = cleanedFragment.includes("custom");
        if (!isSupportedFragment && !isCustomFragment) {
          return {
            selectedHook: "no-hook",
            showCustomHook: false,
            hookWarning: unsupportedMessage,
          }; // SWAP FIX: Unrecognized hook handler
        }
      }
    }

    return {};
  };

  // Intent parsing for swap commands
  const parseSwapIntent = (message: string): SwapIntentState | null => {
    const lowerMessage = message.toLowerCase().trim();
    if (!lowerMessage.startsWith("swap")) {
      return null;
    }

    const baseDetails = resolveHookDetails(lowerMessage, "swap");
    let sellToken = swapDefaults.sellToken;
    let buyToken = swapDefaults.buyToken;

    const swapWithHookPattern = /swap\s+([a-zA-Z0-9]+)\s+for\s+([a-zA-Z0-9]+)\s+with\s+(.+)/i;
    const swapTokensPattern = /swap\s+([a-zA-Z0-9]+)\s+for\s+([a-zA-Z0-9]+)/i;

    const withHookMatch = message.match(swapWithHookPattern);
    if (withHookMatch) {
      sellToken = canonicalizeTokenSymbol(withHookMatch[1]);
      buyToken = canonicalizeTokenSymbol(withHookMatch[2]);
      const explicitHookPhrase = withHookMatch[3];
      Object.assign(baseDetails, resolveHookDetails(explicitHookPhrase, "swap"));
    } else {
      const tokensOnlyMatch = message.match(swapTokensPattern);
      if (tokensOnlyMatch) {
        sellToken = canonicalizeTokenSymbol(tokensOnlyMatch[1]);
        buyToken = canonicalizeTokenSymbol(tokensOnlyMatch[2]);
      }
    }

    return {
      sellToken,
      buyToken,
      selectedHook: baseDetails.selectedHook ?? swapDefaults.selectedHook,
      showCustomHook: baseDetails.showCustomHook ?? swapDefaults.showCustomHook,
      showCustomHookModal: baseDetails.showCustomHookModal ?? false,
      hookWarning: baseDetails.hookWarning,
    };
  };

  // LIQUIDITY FIX: intent parsing for add liquidity commands
  const parseLiquidityIntent = (message: string): LiquidityIntentState | null => {
    const lowerMessage = message.toLowerCase().trim();
    const startsWithAdd = lowerMessage.startsWith("add liquidity");
    const startsWithProvide = lowerMessage.startsWith("provide liquidity");

    if (!startsWithAdd && !startsWithProvide) {
      return null;
    }

    const baseDetails = resolveHookDetails(lowerMessage, "liquidity");
    let token1 = liquidityDefaults.token1;
    let token2 = liquidityDefaults.token2;

    const liquidityWithHookPattern = /(?:add|provide)\s+liquidity(?:\s+to)?\s+([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)\s+with\s+(.+)/i;
    const liquidityTokensPattern = /(?:add|provide)\s+liquidity(?:\s+to)?\s+([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/i;

    const withHookMatch = message.match(liquidityWithHookPattern);
    if (withHookMatch) {
      token1 = canonicalizeTokenSymbol(withHookMatch[1]);
      token2 = canonicalizeTokenSymbol(withHookMatch[2]);
      const hookPhrase = withHookMatch[3];
      Object.assign(baseDetails, resolveHookDetails(hookPhrase, "liquidity"));
    } else {
      const tokensOnlyMatch = message.match(liquidityTokensPattern);
      if (tokensOnlyMatch) {
        token1 = canonicalizeTokenSymbol(tokensOnlyMatch[1]);
        token2 = canonicalizeTokenSymbol(tokensOnlyMatch[2]);
      }
    }

    return {
      token1,
      token2,
      selectedHook: baseDetails.selectedHook ?? liquidityDefaults.selectedHook,
      showCustomHook: baseDetails.showCustomHook ?? liquidityDefaults.showCustomHook,
      hookWarning: baseDetails.hookWarning,
    };
  };

  // Handle chat input submission
  const handleChatSubmit = (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return; // Empty message

    const normalizedMessage = trimmedMessage.toLowerCase();

    let chatForMessage = currentChat;

    if (!chatForMessage) {
      console.log(
        `[MainContent] No active chat found, creating new chat for message: ${trimmedMessage}`,
      );
      const newChat = createNewChat();
      if (!newChat) return;
      chatForMessage = newChat;
    }

    const chatId = chatForMessage.id;
    pendingChatIdRef.current = chatId;

    const isSystemConnectPrompt =
      trimmedMessage === "Please connect your wallet to continue.";

    addMessage(
      {
        content: trimmedMessage,
        sender: !isWalletConnected && isSystemConnectPrompt ? "assistant" : "user",
      },
      chatId,
    );

    const pendingClarification = pendingClarificationsRef.current[chatId];
    let skipClarificationCheck = false;

    if (pendingClarification) {
      if (isAffirmativeResponse(normalizedMessage)) {
        pendingClarificationsRef.current[chatId] = undefined;
        addMessage(
          {
            content: `Confirmed - executing "${pendingClarification.suggestion}".`,
            sender: "assistant",
          },
          chatId,
        );
        processClarifiedCommand(pendingClarification.suggestion, chatId);
        return;
      }

      if (isNegativeResponse(normalizedMessage)) {
        pendingClarificationsRef.current[chatId] = undefined;
        addMessage(
          {
            content: "No problem - just let me know how you'd like to proceed.",
            sender: "assistant",
          },
          chatId,
        );
        return;
      }

      if (normalizedMessage === pendingClarification.normalizedSuggestion) {
        pendingClarificationsRef.current[chatId] = undefined;
        skipClarificationCheck = true;
      }
    }

    if (!skipClarificationCheck) {
      const clarification = detectCommandClarification(trimmedMessage);
      if (clarification) {
        pendingClarificationsRef.current[chatId] = clarification;
        addMessage(
          {
            content: `Did you mean "${clarification.suggestion}"?\nPlease confirm so I can get you to the correct action.`,
            sender: "assistant",
          },
          chatId,
        );
        return;
      }
    }

    if (!isWalletConnected) {
      return;
    }

    const swapIntent = parseSwapIntent(trimmedMessage);
    if (swapIntent) {
      if (handleSwapIntent(swapIntent, chatId)) {
        return;
      }
    }

    const liquidityIntent = parseLiquidityIntent(trimmedMessage);
    if (liquidityIntent) {
      if (handleLiquidityIntent(liquidityIntent, chatId)) {
        return;
      }
    }

    setTimeout(() => {
      addMessage(
        {
          content: getMockAssistantResponse(trimmedMessage),
          sender: "assistant",
        },
        chatId,
      );
    }, 800);
  };

  const ensureSwapShortcut = useCallback(() => {
    if (isSwapModeActive) return;
    activateSwap(); // SWAP: enable swap mode from quick shortcut
  }, [activateSwap, isSwapModeActive]);

  const ensureLiquidityShortcut = useCallback(() => {
    if (isLiquidityModeActive) return;
    activateLiquidity(); // LIQUIDITY FIX: enable liquidity mode from quick shortcut
  }, [activateLiquidity, isLiquidityModeActive]);

  const handleSwapSuccess = useCallback(
    (payload: SwapSuccessPayload) => {
      const activeChatId = currentChat?.id ?? pendingChatIdRef.current;
      if (!activeChatId) return;

      const explorerBase =
        import.meta.env.MODE === "production"
          ? "https://basescan.org/tx/"
          : "https://sepolia-explorer.base.org/tx/"; // SWAP: auto-select explorer per environment

      const sanitizedBuyAmount =
        payload.buyAmount.replace(/^\$/, "").trim() || payload.buyAmount;

      const swapSummary = `Swapped ${payload.sellAmount} ${payload.sellToken} to ${payload.buyToken}.
Transaction successful!
You have received ${sanitizedBuyAmount} ${payload.buyToken}. [View Transaction →](${explorerBase}${payload.transactionHash})`;

      addMessage(
        {
          content: swapSummary,
          sender: "assistant",
        },
        activeChatId,
      ); // SWAP: persist simplified swap recap
    },
    [addMessage, currentChat?.id],
  );

  return (
    <main className="flex-1 flex flex-col bg-background min-h-0">
      {hasPrompted && currentChat ? (
        /* Full-width chat layout */
        <div className="flex-1 flex flex-col min-h-0">
            {/* Chat messages container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0" data-testid="div-chat-messages">
              <div className="max-w-4xl mx-auto space-y-4">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-muted text-foreground shadow-sm'
                      }`}
                      data-testid={`message-${message.sender}-${message.id}`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              
                {/* Render active component */}
                {activeComponent === 'swap' && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-3">
                      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden" data-testid="component-swap-active">
                        <SwapPage
                          key={swapIntentKey}
                          initialSellToken={swapProps?.sellToken ?? swapDefaults.sellToken}
                          initialBuyToken={swapProps?.buyToken ?? swapDefaults.buyToken}
                          initialSelectedHook={swapProps?.selectedHook ?? swapDefaults.selectedHook}
                          initialShowCustomHook={swapProps?.showCustomHook ?? swapDefaults.showCustomHook}
                          initialHookWarning={swapProps?.hookWarning}
                          shouldOpenCustomHookModal={Boolean(swapProps?.showCustomHookModal)}
                          inlineMode={true}
                          onSwapSuccess={handleSwapSuccess}
                          onSwapDismiss={exitSwapMode}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeComponent === 'liquidity' && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-3">
                      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden" data-testid="component-liquidity-active">
                        <AddLiquidityPage
                          key={liquidityIntentKey}
                          initialToken1={liquidityProps?.token1}
                          initialToken2={liquidityProps?.token2}
                          initialSelectedHook={liquidityProps?.selectedHook ?? liquidityDefaults.selectedHook}
                          initialShowCustomHook={liquidityProps?.showCustomHook ?? liquidityDefaults.showCustomHook}
                          inlineMode={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Fixed input at bottom */}
            <div className="border-t bg-background p-4">
              <div className="max-w-4xl mx-auto space-y-3">
                {!account ? (
                  /* Wallet disconnected - show reconnection message */
                  <div className="text-center py-3">
                    <p className="text-sm text-muted-foreground" data-testid="text-wallet-required">
                      Reconnect your wallet to interact with saved chats.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Agent action buttons directly above input when in Agent mode */}
                    {isAgentMode && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          className="text-sm py-2"
                          onClick={() => handleAgentAction('Request testnet funds via faucet')}
                          data-testid="button-agent-faucet"
                        >
                          Request testnet funds via faucet
                        </Button>
                        <Button
                          variant="outline"
                          className="text-sm py-2"
                          onClick={() => handleAgentAction('Manage wallet details and balance checks')}
                          data-testid="button-agent-wallet"
                        >
                          Manage wallet details and balance checks
                        </Button>
                        <Button
                          variant="outline"
                          className="text-sm py-2"
                          onClick={() => handleAgentAction('Execute token transfers and trades')}
                          data-testid="button-agent-trades"
                        >
                          Execute token transfers and trades
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2">
                      <ChatInput 
                        onSubmit={handleChatSubmit} 
                        onQuickAction={handleActionClick}
                        isAgentMode={isAgentMode}
                        onExitAgent={exitAgentMode}
                        isSwapModeActive={isSwapModeActive}
                        isLiquidityModeActive={isLiquidityModeActive}
                        onSwapModeRequest={ensureSwapShortcut}
                        onSwapModeExit={exitSwapMode}
                        onLiquidityModeRequest={ensureLiquidityShortcut}
                        onLiquidityModeExit={exitLiquidityMode}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
      ) : (
        /* Centered layout for States 1 & 2 */
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* State 1: Not Connected - Show Hero Message */}
            {!account && (
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold text-foreground" data-testid="text-welcome-title">
                  Meet Mantua.AI,
                </h1>
                <h2 className="text-4xl font-semibold text-foreground" data-testid="text-welcome-subtitle">
                  your personal DeFi Assistant
                </h2>
                <p className="text-lg text-muted-foreground mt-6" data-testid="text-connect-prompt">
                  Connect your wallet to get started
                </p>
              </div>
            )}

            {/* State 2: Connected but No Prompt - Show Greeting */}
            {account && !hasPrompted && !currentChat && (
              <div className="space-y-6">
                <h1 className="text-3xl font-semibold text-foreground" data-testid="text-greeting">
                  Hi, {shortenedAddress}
                </h1>
                <p className="text-lg text-muted-foreground" data-testid="text-ask-prompt">
                  What can I help you with today?
                </p>
              </div>
            )}

            {/* Chat Input - Only available when wallet is connected */}
            {account && (
              <div className="space-y-6">
                <ChatInput 
                  onSubmit={handleChatSubmit} 
                  onQuickAction={handleActionClick}
                  isAgentMode={isAgentMode}
                  onExitAgent={exitAgentMode}
                  isSwapModeActive={isSwapModeActive}
                  isLiquidityModeActive={isLiquidityModeActive}
                  onSwapModeRequest={ensureSwapShortcut}
                  onSwapModeExit={exitSwapMode}
                  onLiquidityModeRequest={ensureLiquidityShortcut}
                  onLiquidityModeExit={exitLiquidityMode}
                />
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
