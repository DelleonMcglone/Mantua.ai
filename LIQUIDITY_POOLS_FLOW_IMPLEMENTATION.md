# Liquidity Pools Chat Flow - Implementation Plan

Complete implementation guide for the "liquidity pools" query flow in Mantua.AI chat.

## Overview

When users type "liquidity pools", "show me pools", "pools", or related queries, the system should:
1. Detect the intent immediately
2. Display an inline pools list component
3. Allow one-click access to Add Liquidity with pre-filled data
4. No generic text responses - direct UI rendering

## Current Status

### ✅ What Already Exists

1. **AvailablePools Page** - [client/src/pages/AvailablePools.tsx](client/src/pages/AvailablePools.tsx)
   - Full-page pool browser
   - Pool data structure defined
   - Search functionality
   - Table layout with pool stats

2. **AvailablePoolsPrompt Component** - [client/src/components/liquidity/AvailablePoolsPrompt.tsx](client/src/components/liquidity/AvailablePoolsPrompt.tsx)
   - Simple prompt with "View Pools" button
   - Currently just a navigation trigger

3. **Intent Parser** - [server/services/intent.ts](server/services/intent.ts)
   - Handles swap and add_liquidity intents
   - No "show_pools" intent yet

4. **MainContent Chat** - [client/src/components/MainContent.tsx](client/src/components/MainContent.tsx)
   - Handles swap and liquidity activation
   - Has activeComponent state management

## Implementation Tasks

### Task 1: Add "view_pools" Intent Type

**File:** [server/services/intent.ts](server/services/intent.ts)

**Changes:**
1. Add new intent type:
```typescript
export type IntentType =
  | "swap"
  | "add_liquidity"
  | "view_pools"  // NEW
  | "analyze"
  | "agent_action"
  | "unknown";
```

2. Add pool detection logic in `parseIntent()`:
```typescript
// Add BEFORE the swap check
if (
  normalized.includes("pools") ||
  normalized.includes("liquidity pool") ||
  normalized.includes("available pool") ||
  normalized.includes("show me pool") ||
  normalized.includes("view pool") ||
  (normalized.includes("liquidity") &&
   (normalized.includes("browse") || normalized.includes("explore")))
) {
  return {
    intent: "view_pools",
    params: {},
  };
}
```

### Task 2: Create Enhanced Inline Pools Component

**File:** [client/src/components/liquidity/InlinePoolsList.tsx](client/src/components/liquidity/InlinePoolsList.tsx) (NEW)

**Purpose:** Embeddable pools list for chat with hooks support

**Component Structure:**
```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Eye, Droplets } from "lucide-react";

interface Pool {
  id: string;
  token1: string;
  token2: string;
  fee: string;
  tvl: string;
  hook: string | null;
  hookDescription?: string;
  apr: string;
}

interface InlinePoolsListProps {
  onAddLiquidity: (pool: Pool) => void;
  onViewDetails?: (poolId: string) => void;
}

export function InlinePoolsList({ onAddLiquidity, onViewDetails }: InlinePoolsListProps) {
  // Pool data with hooks
  const POOLS: Pool[] = [
    {
      id: "eth-usdc-dynamic",
      token1: "ETH",
      token2: "USDC",
      fee: "0.3%",
      tvl: "$2.3M",
      hook: "Dynamic Fee Hook",
      hookDescription: "Adjusts fees based on volatility",
      apr: "12.7%"
    },
    {
      id: "cbeth-eth-twamm",
      token1: "cbETH",
      token2: "ETH",
      fee: "0.05%",
      tvl: "$1.1M",
      hook: "TWAMM Hook",
      hookDescription: "Time-weighted average market maker",
      apr: "8.4%"
    },
    {
      id: "wsteth-eth-intel",
      token1: "wstETH",
      token2: "ETH",
      fee: "0.05%",
      tvl: "$890K",
      hook: "Mantua Intel Hook",
      hookDescription: "AI-powered liquidity optimization",
      apr: "15.2%"
    },
    {
      id: "usdc-dai-mev",
      token1: "USDC",
      token2: "DAI",
      fee: "0.01%",
      tvl: "$420K",
      hook: "MEV Protection Hook",
      hookDescription: "Protects against MEV attacks",
      apr: "4.8%"
    },
    {
      id: "eth-usdc-no-hook",
      token1: "ETH",
      token2: "USDC",
      fee: "0.3%",
      tvl: "$1.8M",
      hook: null,
      apr: "10.1%"
    }
  ];

  return (
    <Card className="p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Droplets className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Available Liquidity Pools</h3>
        <Badge variant="outline" className="ml-auto">Base Sepolia</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Select a pool to add liquidity and start earning rewards.
      </p>

      {/* Pools Grid */}
      <div className="space-y-2">
        {POOLS.map((pool) => (
          <div
            key={pool.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          >
            {/* Pool Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {pool.token1} / {pool.token2}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {pool.fee}
                </Badge>
                {pool.hook && (
                  <Badge variant="outline" className="text-xs">
                    {pool.hook}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>TVL: {pool.tvl}</span>
                <span className="text-green-600 font-medium">APR: {pool.apr}</span>
                {pool.hookDescription && (
                  <span className="italic">{pool.hookDescription}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(pool.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => onAddLiquidity(pool)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Liquidity
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        💡 <strong>Tip:</strong> Pools with hooks offer enhanced functionality like dynamic fees, MEV protection, and TWAMM.
      </div>
    </Card>
  );
}
```

### Task 3: Update MainContent to Handle view_pools Intent

**File:** [client/src/components/MainContent.tsx](client/src/components/MainContent.tsx)

**Changes:**

1. Import the new component:
```typescript
import { InlinePoolsList } from "@/components/liquidity/InlinePoolsList";
```

2. Add state for tracking if pools view is active:
```typescript
const [isPoolsViewActive, setIsPoolsViewActive] = useState(false);
```

3. Add handler in `handleParsedIntent()`:
```typescript
case "view_pools": {
  setIsPoolsViewActive(true);
  setActiveComponent(null);
  setSwapProps(null);
  setLiquidityProps(null);
  setIsAnalyzeModeActive(false);

  // Add assistant message
  addMessage(
    {
      content: "Here are the available liquidity pools on Base Sepolia. Click 'Add Liquidity' to get started.",
      sender: "assistant",
      component: {
        type: "pools_list" as const,
        props: {},
      },
    },
    chatId
  );
  return;
}
```

4. Add pool selection handler:
```typescript
const handlePoolSelection = useCallback(
  (pool: Pool) => {
    const chatId = currentChat?.id ?? pendingChatIdRef.current;
    if (!chatId) return;

    // Convert pool selection to liquidity intent
    const liquidityIntent: LiquidityIntentState = {
      token1: pool.token1,
      token2: pool.token2,
      selectedHook: pool.hook ?
        normalizeHook(pool.hook)?.id ?? "no-hook" :
        "no-hook",
      hook: pool.hook ? normalizeHook(pool.hook) : undefined,
      showCustomHook: false,
    };

    setIsPoolsViewActive(false);
    activateLiquidity(liquidityIntent);

    addMessage(
      {
        content: `Adding liquidity to ${pool.token1}/${pool.token2} pool${pool.hook ? ` with ${pool.hook}` : ""}.`,
        sender: "assistant",
      },
      chatId
    );
  },
  [activateLiquidity, addMessage, currentChat?.id]
);
```

5. Render InlinePoolsList when pools view is active:
```typescript
{isPoolsViewActive && (
  <div className="flex justify-start">
    <div className="w-full max-w-full space-y-3">
      <InlinePoolsList
        onAddLiquidity={handlePoolSelection}
        onViewDetails={(poolId) => {
          // Optional: Show pool details modal or page
          console.log("View pool:", poolId);
        }}
      />
    </div>
  </div>
)}
```

### Task 4: Update Message Component Type

**File:** Check [client/src/contexts/ChatContext.tsx](client/src/contexts/ChatContext.tsx) or wherever Message type is defined

**Changes:**

Add "pools_list" to component types:
```typescript
interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: number;
  component?: {
    type: "analysis" | "pools_list"; // Add pools_list
    props: any;
  };
}
```

### Task 5: Handle Pools Component in Chat Messages

**File:** [client/src/components/MainContent.tsx](client/src/components/MainContent.tsx)

**In the message rendering section:**

```typescript
{chatMessages.map((message) => {
  // Handle pools_list component
  if (message.component?.type === "pools_list") {
    return (
      <div key={message.id} className="flex justify-start">
        <div className="w-full max-w-full space-y-3">
          <InlinePoolsList
            onAddLiquidity={handlePoolSelection}
            onViewDetails={(poolId) => {
              console.log("View pool:", poolId);
            }}
          />
        </div>
      </div>
    );
  }

  // Existing analysis component handling
  if (message.component?.type === "analysis") {
    // ... existing code
  }

  // Regular message rendering
  return (
    <div key={message.id} className={/* ... */}>
      {/* ... existing message rendering */}
    </div>
  );
})}
```

## User Flow Example

**User types:** "show me liquidity pools"

1. **Intent Detection:**
   - Server parseIntent() detects "view_pools"
   - Returns `{ intent: "view_pools", params: {} }`

2. **Chat Handler:**
   - `handleParsedIntent()` receives view_pools
   - Sets `isPoolsViewActive = true`
   - Adds assistant message with pools_list component

3. **UI Renders:**
   - InlinePoolsList component appears in chat
   - Shows 5 pools with hooks and stats
   - Each pool has "Add Liquidity" and "View" buttons

4. **User clicks "Add Liquidity" on ETH/USDC pool:**
   - `handlePoolSelection()` is called
   - Creates LiquidityIntentState with:
     - token1: "ETH"
     - token2: "USDC"
     - selectedHook: "dynamic-fee"
     - hook: DynamicFeeHook config
   - Calls `activateLiquidity()`
   - AddLiquidityPage renders with pre-filled data

5. **User completes liquidity addition:**
   - Form shows ETH/USDC pre-selected
   - Hook selector shows "Dynamic Fee Hook" pre-selected
   - User enters amounts and confirms

## Keywords Detection

The intent parser should detect these phrases:

- "liquidity pools"
- "liquidity pool"
- "pools"
- "show me pools"
- "available pools"
- "view pools"
- "browse pools"
- "explore pools"
- "hook pools"
- "show pools"
- "list pools"

## Pool Data Structure

```typescript
interface Pool {
  id: string;               // Unique identifier
  token1: string;           // First token symbol
  token2: string;           // Second token symbol
  fee: string;              // Fee tier (e.g., "0.3%")
  tvl: string;              // Total Value Locked (formatted)
  hook: string | null;      // Hook name or null
  hookDescription?: string;  // Hook description
  apr: string;              // Annual Percentage Rate
  volume24h?: string;       // Optional: 24h volume
  users?: string;           // Optional: Active users count
}
```

## Hook Types Supported

1. **Dynamic Fee Hook**
   - Adjusts fees based on market volatility
   - Best for volatile pairs

2. **TWAMM Hook**
   - Time-Weighted Average Market Maker
   - Best for large orders over time

3. **Mantua Intel Hook**
   - AI-powered liquidity optimization
   - Best for advanced users

4. **MEV Protection Hook**
   - Protects against MEV attacks
   - Best for stablecoin pairs

5. **No Hook**
   - Standard Uniswap v4 pool
   - Best for simple use cases

## Testing Checklist

- [ ] Type "liquidity pools" → InlinePoolsList appears
- [ ] Type "show me pools" → InlinePoolsList appears
- [ ] Type "pools" → InlinePoolsList appears
- [ ] Type "available pools" → InlinePoolsList appears
- [ ] Click "Add Liquidity" → AddLiquidityPage opens with pre-filled data
- [ ] Pre-filled token1 matches pool token1
- [ ] Pre-filled token2 matches pool token2
- [ ] Pre-filled hook matches pool hook
- [ ] Hook selector shows correct hook selected
- [ ] Can complete liquidity addition flow
- [ ] No generic text responses shown
- [ ] Pools display correctly on mobile
- [ ] Can search/filter pools (if implemented)
- [ ] "View" button shows pool details (if implemented)

## Files to Create/Modify

### Create:
1. `client/src/components/liquidity/InlinePoolsList.tsx` - New inline pools component

### Modify:
1. `server/services/intent.ts` - Add view_pools intent
2. `client/src/components/MainContent.tsx` - Add pools handling
3. `client/src/contexts/ChatContext.tsx` - Add pools_list component type (if needed)

## Benefits

1. **Immediate Visual Response** - No waiting, no text fallback
2. **One-Click Action** - Direct path from browse to add liquidity
3. **Pre-filled Forms** - Less user input required
4. **Hook Discovery** - Users learn about available hooks
5. **Better UX** - Seamless transition from chat to transaction

## Future Enhancements

1. **Real-time Data** - Fetch live pool data from Uniswap v4
2. **Pool Details Modal** - Click "View" to see charts and stats
3. **Filtering** - Filter by token, hook type, or APR
4. **Sorting** - Sort by TVL, APR, or volume
5. **User Pools** - Show pools where user has positions
6. **Pool Analytics** - Historical APR charts, IL calculator

## Summary

This implementation transforms the "liquidity pools" query from a dead-end into a complete user flow:

**Before:**
```
User: "show me pools"
Assistant: "I can help you with liquidity pools. What would you like to know?"
User: [stuck, no clear next step]
```

**After:**
```
User: "show me pools"
Assistant: [Shows InlinePoolsList with 5 pools]
User: [Clicks "Add Liquidity" on ETH/USDC]
Assistant: [Opens AddLiquidityPage with ETH/USDC pre-filled]
User: [Enters amounts and confirms]
Assistant: [Transaction succeeds]
```

Direct, actionable, and seamless! 🚀

---

**Implementation Status:** Ready to implement
**Estimated Time:** 2-3 hours
**Priority:** High (key user flow)
