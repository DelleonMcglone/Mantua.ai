import logoBlack from "@assets/Mantua logo black_1758235323665.png";
import logoWhite from "@assets/Mantua logo white_1758237422953.png";
import ChatInput from "./ChatInput";
import SwapPage from "@/pages/Swap";
import AddLiquidityPage from "@/pages/AddLiquidity";
import RemoveLiquidityPage from "@/pages/RemoveLiquidity";
import CollectFeesPage from "@/pages/CollectFees";
import AvailablePoolsPage, { type AvailablePool } from "@/pages/AvailablePools";
import AvailablePoolsPrompt from "@/components/liquidity/AvailablePoolsPrompt";
import { useState, useEffect, useRef, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation } from "wouter";
import { parseUserCommand } from "@/lib/intent";
import { HookConfig, HOOKS, HOOK_SYNONYMS, normalizeHook } from "@/lib/hookLibrary";
import { canonicalizeTokenSymbol, extractTokensFromText } from "@/lib/tokenParsing";
import { txUrl } from "@/utils/explorers";
import { baseSepolia } from "wagmi/chains";
import { AnalyzeResponseCard } from "@/components/analyze/AnalyzeResponseCard";
import { requestAnalyze, requestParseIntent, ApiError, type ParseIntentResponse } from "@/lib/api";
import { type AnalysisResponsePayload } from "@/types/analysis";

type ActionId = 'swap' | 'add-liquidity' | 'analyze' | 'remove-liquidity' | 'collect-fees';
type HookContext = "swap" | "liquidity";
type ActiveComponent = null | "swap" | "liquidity" | "available-pools" | "remove-liquidity" | "collect-fees";

interface SwapIntentState {
  sellToken?: string;
  buyToken?: string;
  selectedHook?: string;
  showCustomHook?: boolean;
  showCustomHookModal?: boolean;
  hookWarning?: string;
  hook?: HookConfig;
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
  hook?: HookConfig;
}

interface HookResolution {
  selectedHook?: string;
  showCustomHook?: boolean;
  showCustomHookModal?: boolean;
  hookWarning?: string;
  hook?: HookConfig;
}

const SINGLE_WORD_ACTIONS = ["swap", "analyze"] as const;
const MULTI_WORD_ACTIONS = ["add liquidity", "remove liquidity"] as const;
const AFFIRMATIVE_RESPONSES = new Set(["yes", "y", "yeah", "yep", "sure", "confirm", "correct"]);
const NEGATIVE_RESPONSES = new Set(["no", "n", "nope", "cancel"]);
const DISALLOWED_TOKENS = new Set(["WETH", "DAI"]);
const UNSUPPORTED_TOKEN_MESSAGE = "WETH and DAI are not currently supported on Mantua.AI.";

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

const HOOK_UNRECOGNIZED_MESSAGES: Record<HookContext, string> = {
  swap: `Unrecognized Hook — You asked to swap using a hook that isn’t in Mantua’s supported library yet. You can paste the hook’s address to validate it, pick a supported hook, or continue without a hook.`,
  liquidity: `You asked to Add Liquidity using a hook that isn't in Mantua's supported library yet.
You can paste the hook's address to validate it, pick a supported hook, or continue without a hook.`,
}; // SWAP FIX: unify unsupported hook messaging

const swapDefaults: Readonly<SwapIntentState> = {
  sellToken: "",
  buyToken: "",
  selectedHook: "no-hook",
  showCustomHook: false,
  showCustomHookModal: false,
  hook: undefined,
}; // SWAP: baseline swap configuration

const liquidityDefaults: Readonly<LiquidityIntentState> = {
  token1: "",
  token2: "",
  selectedHook: "no-hook",
  showCustomHook: false,
  hook: undefined,
}; // LIQUIDITY FIX: baseline liquidity configuration

export default function MainContent() {
  const [isDark, setIsDark] = useState(false);
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>(null);
  const [swapProps, setSwapProps] = useState<SwapIntentState | null>(null);
  const [liquidityProps, setLiquidityProps] = useState<LiquidityIntentState | null>(null); // LIQUIDITY FIX: track liquidity intent props
  const [isAnalyzeModeActive, setIsAnalyzeModeActive] = useState(false);
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);
  const { currentChat, addMessage, createNewChat } = useChatContext();
  const [location, navigate] = useLocation();
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
          hook: nextProps.hook ?? base.hook,
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
      setIsAnalyzeModeActive(false);
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
          hook: nextProps.hook ?? base.hook,
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
      setIsAnalyzeModeActive(false);
      setActiveComponent("liquidity");
    },
    [],
  ); // LIQUIDITY FIX: centralize liquidity activation

  const exitLiquidityMode = useCallback(() => {
    setActiveComponent(null);
    setLiquidityProps(null);
  }, []); // LIQUIDITY FIX: reset liquidity mode when dismissed

  const activateRemoveLiquidity = useCallback(() => {
    setSwapProps(null);
    setLiquidityProps(null);
    setIsAnalyzeModeActive(false);
    setActiveComponent("remove-liquidity");
  }, []);

  const exitRemoveLiquidityMode = useCallback(() => {
    setActiveComponent(null);
  }, []);

  const activateCollectFees = useCallback(() => {
    setSwapProps(null);
    setLiquidityProps(null);
    setIsAnalyzeModeActive(false);
    setActiveComponent("collect-fees");
  }, []);

  const exitCollectFeesMode = useCallback(() => {
    setActiveComponent(null);
  }, []);

  const activateAnalyzeMode = useCallback(() => {
    setActiveComponent(null);
    setSwapProps(null);
    setLiquidityProps(null);
    setIsAnalyzeModeActive(true);
  }, []);

  const exitAnalyzeMode = useCallback(() => {
    setIsAnalyzeModeActive(false);
  }, []);

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
  const isSwapModeActive = activeComponent === "swap"; // SWAP: synchronize swap mode state
  const isLiquidityModeActive = activeComponent === "liquidity" || activeComponent === "available-pools"; // LIQUIDITY FIX: synchronize add-liquidity mode
  const isRemoveLiquidityModeActive = activeComponent === "remove-liquidity";
  const isCollectFeesModeActive = activeComponent === "collect-fees";

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
    // SWAP FIX: Create chat if needed, just like handleChatSubmit does
    let chatForAction = currentChat;
    
    if (!chatForAction) {
      console.log(`[MainContent] No active chat found, creating new chat for action: ${actionId}`);
      const newChat = createNewChat();
      if (!newChat) return;
      chatForAction = newChat;
    }

    const activeChatId = chatForAction.id;
    pendingChatIdRef.current = activeChatId;

    if (actionId === 'analyze') {
      if (!isAnalyzeModeActive) {
        activateAnalyzeMode();
        addMessage(
          {
            content: "Analyze Mode engaged. Ask a market or onchain question for real-time insights.",
            sender: "assistant",
          },
          activeChatId,
        );
      }
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
      exitAnalyzeMode();
      activateSwap(); // SWAP FIX: normalize swap activation path
    }
    
    // Handle component activation for add-liquidity
    if (actionId === 'add-liquidity') {
      exitAnalyzeMode();
      activateLiquidity(); // LIQUIDITY FIX: normalize liquidity activation path
    }

    // Handle component activation for remove-liquidity
    if (actionId === 'remove-liquidity') {
      exitAnalyzeMode();
      activateRemoveLiquidity();
    }

    // Handle component activation for collect-fees
    if (actionId === 'collect-fees') {
      exitAnalyzeMode();
      activateCollectFees();
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

    if (normalizedSuggestion.startsWith("remove liquidity")) {
      handleActionClick("remove-liquidity");
      return;
    }

    if (normalizedSuggestion.startsWith("collect fees")) {
      handleActionClick("collect-fees");
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
        return ''; // Analyze mode provides dynamic responses

      case 'remove-liquidity':
        return ''; // No intro text for remove liquidity - just show component

      case 'collect-fees':
        return ''; // No intro text for collect fees - just show component
      
      default:
        // This should never happen with proper TypeScript typing
        const _exhaustiveCheck: never = actionId;
        return "";
    }
  };

  // SWAP FIX: derive hook metadata from free-form phrases (shared with liquidity flow)
  const resolveHookDetails = (phrase: string, context: HookContext): HookResolution => {
    const normalized = phrase.toLowerCase();
    const trimmed = phrase.trim();
    const unsupportedMessage = HOOK_UNRECOGNIZED_MESSAGES[context];
    const mentionsHook = normalized.includes("hook");

    if (!trimmed) return {};

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

    const sanitized = trimmed.replace(/hook$/i, "").trim();

    const directMatch = normalizeHook(sanitized) ?? normalizeHook(trimmed);
    if (directMatch) {
      return { selectedHook: directMatch.id, hook: directMatch };
    }

    for (const key of Object.keys(HOOKS)) {
      if (sanitized.includes(key)) {
        const hook = HOOKS[key];
        return { selectedHook: hook.id, hook };
      }
    }

    for (const alias of Object.keys(HOOK_SYNONYMS)) {
      if (sanitized.includes(alias)) {
        const canonical = HOOK_SYNONYMS[alias];
        const hook = HOOKS[canonical];
        if (hook) {
          return { selectedHook: hook.id, hook };
        }
      }
    }

    if (normalized.includes("custom")) {
      return {
        selectedHook: "custom",
        showCustomHook: true,
      };
    }

    if (!mentionsHook) {
      return {
        selectedHook: "no-hook",
        showCustomHook: false,
      };
    }

    return {
      selectedHook: "no-hook",
      showCustomHook: false,
      hookWarning: unsupportedMessage,
    };
  };

  // Intent parsing for swap commands
  const parseSwapIntent = (message: string): SwapIntentState | null => {
    const lowerMessage = message.toLowerCase().trim();
    if (!lowerMessage.startsWith("swap")) {
      return null;
    }

    const baseDetails = resolveHookDetails(lowerMessage, "swap");
    const parsed = parseUserCommand(message);
    if (parsed.hook) {
      baseDetails.selectedHook = parsed.hook.id;
      baseDetails.hook = parsed.hook;
      baseDetails.showCustomHook = false;
      baseDetails.showCustomHookModal = false;
      baseDetails.hookWarning = undefined;
    }

    let sellToken = swapDefaults.sellToken;
    let buyToken = swapDefaults.buyToken;

    const swapWithHookPattern =
      /swap\s+(?:(\d+(?:\.\d+)?)\s+)?([a-zA-Z0-9]+)\s+(?:to|for)\s+([a-zA-Z0-9]+)\s+with\s+(.+)/i;
    const swapTokensPattern =
      /swap\s+(?:(\d+(?:\.\d+)?)\s+)?([a-zA-Z0-9]+)\s+(?:to|for)\s+([a-zA-Z0-9]+)/i;

    const withHookMatch = message.match(swapWithHookPattern);
    if (withHookMatch) {
      sellToken = canonicalizeTokenSymbol(withHookMatch[2]);
      buyToken = canonicalizeTokenSymbol(withHookMatch[3]);
      const explicitHookPhrase = withHookMatch[4];
      Object.assign(baseDetails, resolveHookDetails(explicitHookPhrase, "swap"));
    } else {
      const tokensOnlyMatch = message.match(swapTokensPattern);
      if (tokensOnlyMatch) {
        sellToken = canonicalizeTokenSymbol(tokensOnlyMatch[2]);
        buyToken = canonicalizeTokenSymbol(tokensOnlyMatch[3]);
      }
    }

    if (!sellToken || !buyToken) {
      const extracted = extractTokensFromText(message);
      if (extracted?.tokenA && !sellToken) {
        sellToken = canonicalizeTokenSymbol(extracted.tokenA);
      }
      if (extracted?.tokenB && !buyToken) {
        buyToken = canonicalizeTokenSymbol(extracted.tokenB);
      }
    }

    if (parsed.tokenIn && !sellToken) {
      sellToken = canonicalizeTokenSymbol(parsed.tokenIn);
    }
    if (parsed.tokenOut && !buyToken) {
      buyToken = canonicalizeTokenSymbol(parsed.tokenOut);
    }

    return {
      sellToken,
      buyToken,
      selectedHook: baseDetails.selectedHook ?? swapDefaults.selectedHook,
      showCustomHook: baseDetails.showCustomHook ?? swapDefaults.showCustomHook,
      showCustomHookModal: baseDetails.showCustomHookModal ?? false,
      hookWarning: baseDetails.hookWarning,
      hook: baseDetails.hook,
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
    const parsed = parseUserCommand(message);
    if (parsed.hook) {
      baseDetails.selectedHook = parsed.hook.id;
      baseDetails.hook = parsed.hook;
      baseDetails.showCustomHook = false;
      baseDetails.hookWarning = undefined;
    }

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

    if ((!token1 || !token2) && parsed.tokenIn && parsed.tokenOut) {
      token1 = canonicalizeTokenSymbol(parsed.tokenIn);
      token2 = canonicalizeTokenSymbol(parsed.tokenOut);
    } else if (!token1 || !token2) {
      const extracted = extractTokensFromText(message);
      if (extracted?.tokenA && !token1) {
        token1 = canonicalizeTokenSymbol(extracted.tokenA);
      }
      if (extracted?.tokenB && !token2) {
        token2 = canonicalizeTokenSymbol(extracted.tokenB);
      }
    }

    return {
      token1,
      token2,
      selectedHook: baseDetails.selectedHook ?? liquidityDefaults.selectedHook,
      showCustomHook: baseDetails.showCustomHook ?? liquidityDefaults.showCustomHook,
      hookWarning: baseDetails.hookWarning,
      hook: baseDetails.hook,
    };
  };

  const runAnalyze = useCallback(
    async (question: string, chatId: string) => {
      setIsAnalyzeModeActive(true);
      setIsAnalyzeLoading(true);
      try {
        const response = await requestAnalyze(question);
        const analysisMessage = {
          content: response.summary,
          sender: "assistant" as const,
          component: {
            type: "analysis" as const,
            props: response as AnalysisResponsePayload,
          },
        };
        addMessage(analysisMessage, chatId);
      } catch (error) {
        const fallback =
          error instanceof ApiError
            ? error.message
            : "No data available for that query.";
        addMessage(
          {
            content: fallback,
            sender: "assistant",
          },
          chatId,
        );
      } finally {
        setIsAnalyzeLoading(false);
      }
    },
    [addMessage],
  );

  const handleParsedIntent = useCallback(
    async (intentResult: ParseIntentResponse, originalMessage: string, chatId: string) => {
      const params = intentResult.params ?? {};

      switch (intentResult.intent) {
        case "swap": {
          if (!isWalletConnected) {
            addMessage(
              {
                content: "Connect your wallet to execute swaps.",
                sender: "assistant",
              },
              chatId,
            );
            return;
          }
          const baseIntent = parseSwapIntent(originalMessage) ?? swapDefaults;
          const sellToken =
            typeof params.tokenIn === "string"
              ? canonicalizeTokenSymbol(params.tokenIn)
              : baseIntent.sellToken;
          const buyToken =
            typeof params.tokenOut === "string"
              ? canonicalizeTokenSymbol(params.tokenOut)
              : baseIntent.buyToken;
          let selectedHook =
            typeof params.hookId === "string" ? params.hookId : baseIntent.selectedHook;

          const nextIntent: SwapIntentState = {
            ...baseIntent,
            sellToken,
            buyToken,
          };

          if (selectedHook) {
            if (selectedHook.startsWith("0x")) {
              nextIntent.selectedHook = "custom";
              nextIntent.showCustomHook = true;
              nextIntent.showCustomHookModal = false;
            } else {
              nextIntent.selectedHook = selectedHook;
              nextIntent.showCustomHook = selectedHook === "custom";
            }
          }

          handleSwapIntent(nextIntent, chatId);
          return;
        }
        case "add_liquidity": {
          if (!isWalletConnected) {
            addMessage(
              {
                content: "Connect your wallet to manage liquidity positions.",
                sender: "assistant",
              },
              chatId,
            );
            return;
          }
          const baseIntent = parseLiquidityIntent(originalMessage) ?? liquidityDefaults;
          const tokenA =
            typeof params.tokenA === "string"
              ? canonicalizeTokenSymbol(params.tokenA)
              : baseIntent.token1;
          const tokenB =
            typeof params.tokenB === "string"
              ? canonicalizeTokenSymbol(params.tokenB)
              : baseIntent.token2;
          const nextIntent: LiquidityIntentState = {
            ...baseIntent,
            token1: tokenA,
            token2: tokenB,
          };

          const hookId =
            typeof params.hookId === "string" ? params.hookId : baseIntent.selectedHook;

          if (hookId) {
            if (hookId.startsWith("0x")) {
              nextIntent.selectedHook = "custom";
              nextIntent.showCustomHook = true;
            } else {
              nextIntent.selectedHook = hookId;
              nextIntent.showCustomHook = hookId === "custom";
            }
          }

          handleLiquidityIntent(nextIntent, chatId);
          return;
        }
        case "analyze": {
          activateAnalyzeMode();
          const normalized = originalMessage.trim().toLowerCase();
          if (normalized === "analyze" || normalized === "+ analyze") {
            return;
          }
          await runAnalyze(originalMessage, chatId);
          return;
        }
        default: {
          if (isAnalyzeModeActive) {
            await runAnalyze(originalMessage, chatId);
            return;
          }

          const swapIntent = parseSwapIntent(originalMessage);
          if (swapIntent) {
            if (!isWalletConnected) {
              addMessage(
                {
                  content: "Connect your wallet to execute swaps.",
                  sender: "assistant",
                },
                chatId,
              );
              return;
            }
            handleSwapIntent(swapIntent, chatId);
            return;
          }

          const liquidityIntent = parseLiquidityIntent(originalMessage);
          if (liquidityIntent) {
            if (!isWalletConnected) {
              addMessage(
                {
                  content: "Connect your wallet to manage liquidity positions.",
                  sender: "assistant",
                },
                chatId,
              );
              return;
            }
            handleLiquidityIntent(liquidityIntent, chatId);
            return;
          }

          // Check for pools command
          const poolsCommand = detectPoolsCommand(originalMessage);
          if (poolsCommand.detected) {
            activatePools(poolsCommand.tokenFilter);
            const filterMsg = poolsCommand.tokenFilter 
              ? `Showing pools for ${poolsCommand.tokenFilter.toUpperCase()}`
              : "Showing top liquidity pools";
            addMessage(
              {
                content: filterMsg,
                sender: "assistant",
              },
              chatId,
            );
            return;
          }

          addMessage(
            {
              content: getMockAssistantResponse(originalMessage),
              sender: "assistant",
            },
            chatId,
          );
        }
      }
    },
    [
      activateAnalyzeMode,
      activatePools,
      addMessage,
      detectPoolsCommand,
      handleLiquidityIntent,
      handleSwapIntent,
      isAnalyzeModeActive,
      isWalletConnected,
      navigate,
      runAnalyze,
    ],
  );

  // Handle chat input submission
  const handleChatSubmit = async (message: string) => {
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

    try {
      const intentResponse = await requestParseIntent(trimmedMessage);
      await handleParsedIntent(intentResponse, trimmedMessage, chatId);
    } catch (error) {
      console.error("[MainContent] Failed to parse intent", error);
      await handleParsedIntent(
        { intent: "unknown", params: {} },
        trimmedMessage,
        chatId,
      );
    }
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

      const sanitizedBuyAmount =
        payload.buyAmount.replace(/^\$/, "").trim() || payload.buyAmount;
      const explorerUrl = txUrl(baseSepolia.id, payload.transactionHash);

      const swapSummary = `Swapped ${payload.sellAmount} ${payload.sellToken} to ${payload.buyToken}.
Transaction successful!
You have received ${sanitizedBuyAmount} ${payload.buyToken}. [View Transaction →](${explorerUrl})`;

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
                {chatMessages.map((message) => {
                  if (message.component?.type === "analysis") {
                    const analysis = message.component.props as AnalysisResponsePayload;
                    return (
                      <div key={message.id} className="flex justify-start">
                        <div className="max-w-[90%] space-y-3">
                          <AnalyzeResponseCard
                            summary={analysis.summary || message.content}
                            metrics={analysis.metrics ?? []}
                            chart={analysis.chart}
                            source={analysis.source}
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
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
                  );
                })}
              
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
                          intentHook={swapProps?.hook}
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
                          intentHook={liquidityProps?.hook}
                          initialHookWarning={liquidityProps?.hookWarning}
                          inlineMode={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeComponent === 'remove-liquidity' && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-3">
                      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden" data-testid="component-remove-liquidity-active">
                        <RemoveLiquidityPage
                          onSuccess={(txHash) => {
                            const chatId = currentChat?.id ?? pendingChatIdRef.current;
                            if (chatId) {
                              addMessage(
                                {
                                  content: `✅ Liquidity removed successfully! Transaction: ${txUrl(baseSepolia.id, txHash)}`,
                                  sender: "assistant",
                                },
                                chatId
                              );
                            }
                            exitRemoveLiquidityMode();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeComponent === 'collect-fees' && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] space-y-3">
                      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden" data-testid="component-collect-fees-active">
                        <CollectFeesPage
                          onSuccess={(txHash) => {
                            const chatId = currentChat?.id ?? pendingChatIdRef.current;
                            if (chatId) {
                              addMessage(
                                {
                                  content: `✅ Fees collected successfully! Transaction: ${txUrl(baseSepolia.id, txHash)}`,
                                  sender: "assistant",
                                },
                                chatId
                              );
                            }
                            exitCollectFeesMode();
                          }}
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
                    <div className="space-y-2">
                      <ChatInput 
                        onSubmit={handleChatSubmit} 
                        onQuickAction={handleActionClick}
                        isSwapModeActive={isSwapModeActive}
                        isLiquidityModeActive={isLiquidityModeActive}
                        onSwapModeRequest={ensureSwapShortcut}
                        onSwapModeExit={exitSwapMode}
                        onLiquidityModeRequest={ensureLiquidityShortcut}
                        onLiquidityModeExit={exitLiquidityMode}
                        isAnalyzeModeActive={isAnalyzeModeActive}
                        onAnalyzeModeRequest={activateAnalyzeMode}
                        onAnalyzeModeExit={exitAnalyzeMode}
                        isRemoveLiquidityModeActive={isRemoveLiquidityModeActive}
                        onRemoveLiquidityModeRequest={() => handleActionClick('remove-liquidity')}
                        onRemoveLiquidityModeExit={exitRemoveLiquidityMode}
                        isCollectFeesModeActive={isCollectFeesModeActive}
                        onCollectFeesModeRequest={() => handleActionClick('collect-fees')}
                        onCollectFeesModeExit={exitCollectFeesMode}
                      />
                      {isAnalyzeModeActive && isAnalyzeLoading && (
                        <p className="text-xs text-muted-foreground px-2">
                          Gathering market data…
                        </p>
                      )}
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
                  isSwapModeActive={isSwapModeActive}
                  isLiquidityModeActive={isLiquidityModeActive}
                  onSwapModeRequest={ensureSwapShortcut}
                  onSwapModeExit={exitSwapMode}
                  onLiquidityModeRequest={ensureLiquidityShortcut}
                  onLiquidityModeExit={exitLiquidityMode}
                  isAnalyzeModeActive={isAnalyzeModeActive}
                  onAnalyzeModeRequest={activateAnalyzeMode}
                  onAnalyzeModeExit={exitAnalyzeMode}
                  isRemoveLiquidityModeActive={isRemoveLiquidityModeActive}
                  onRemoveLiquidityModeRequest={() => handleActionClick('remove-liquidity')}
                  onRemoveLiquidityModeExit={exitRemoveLiquidityMode}
                  isCollectFeesModeActive={isCollectFeesModeActive}
                  onCollectFeesModeRequest={() => handleActionClick('collect-fees')}
                  onCollectFeesModeExit={exitCollectFeesMode}
                />
                {isAnalyzeModeActive && isAnalyzeLoading && (
                  <p className="text-xs text-muted-foreground px-2 text-left">
                    Gathering market data…
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
