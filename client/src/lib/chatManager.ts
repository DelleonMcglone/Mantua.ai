import { nanoid } from 'nanoid';
import { type AnalysisResponsePayload } from "@/types/analysis";

type ChatComponent =
  | {
      type: "swap";
      props?: {
        sellToken?: string;
        buyToken?: string;
        selectedHook?: string;
        showCustomHook?: boolean;
      };
    }
  | {
      type: "analysis";
      props: AnalysisResponsePayload;
    }
  | {
      type: "pools_list";
      props: Record<string, never>;
    };

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  component?: ChatComponent;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const CHAT_SESSION_KEY = "mantua_chat_history";
const LEGACY_CHATS_KEY = "mantua_chats";
const LEGACY_CURRENT_CHAT_KEY = "mantua_current_chat";

interface PersistedChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: string;
  component?: ChatMessage["component"];
}

interface PersistedChat {
  id: string;
  title: string;
  messages: PersistedChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatStorageSnapshot {
  chats: Chat[];
  currentChatId: string | null;
}

export class ChatManager {
  private static instance: ChatManager;
  
  static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  private get storage(): Storage | null {
    if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
      return null;
    }
    return window.localStorage;
  }

  private deserializeChat(rawChat: PersistedChat): Chat {
    const messages: ChatMessage[] = Array.isArray(rawChat.messages)
      ? rawChat.messages
          .map((msg): ChatMessage => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender === "assistant" ? "assistant" : "user",
            timestamp: new Date(msg.timestamp ?? Date.now()),
            component: msg.component,
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      : [];

    return {
      id: rawChat.id,
      title: rawChat.title ?? "Untitled Chat",
      messages,
      createdAt: new Date(rawChat.createdAt ?? Date.now()),
      updatedAt: new Date(rawChat.updatedAt ?? Date.now()),
    };
  }

  private serializeChat(chat: Chat): PersistedChat {
    return {
      id: chat.id,
      title: chat.title,
      messages: chat.messages.map(
        (message): PersistedChatMessage => ({
          id: message.id,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp.toISOString(),
          component: message.component,
        }),
      ),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    };
  }

  private getSnapshot(): ChatStorageSnapshot {
    const storage = this.storage;
    if (!storage) {
      return { chats: [], currentChatId: null };
    }

    try {
      const raw = storage.getItem(CHAT_SESSION_KEY);
      let parsed: { chats?: PersistedChat[]; currentChatId?: string | null } | null = null;
      let shouldPersist = false;

      if (raw) {
        parsed = JSON.parse(raw);
      } else {
        const legacyChatsRaw = storage.getItem(LEGACY_CHATS_KEY);
        if (legacyChatsRaw) {
          parsed = {
            chats: JSON.parse(legacyChatsRaw) as PersistedChat[],
            currentChatId: storage.getItem(LEGACY_CURRENT_CHAT_KEY),
          };
          shouldPersist = true;
        }
      }

      if (!parsed) {
        return { chats: [], currentChatId: null };
      }

      const chats = Array.isArray(parsed.chats)
        ? parsed.chats.map((chat) => this.deserializeChat(chat))
        : [];

      const snapshot: ChatStorageSnapshot = {
        chats: chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
        currentChatId: typeof parsed.currentChatId === "string" ? parsed.currentChatId : null,
      };

      if (shouldPersist) {
        this.writeSnapshot(snapshot);
        storage.removeItem(LEGACY_CHATS_KEY);
        storage.removeItem(LEGACY_CURRENT_CHAT_KEY);
      }

      return snapshot;
    } catch (error) {
      console.error("Error parsing chat snapshot:", error);
      return { chats: [], currentChatId: null };
    }
  }

  private writeSnapshot(snapshot: ChatStorageSnapshot): void {
    const storage = this.storage;
    if (!storage) return;

    try {
      const serialized = {
        currentChatId: snapshot.currentChatId,
        chats: snapshot.chats.map((chat) => this.serializeChat(chat)),
      };
      storage.setItem(CHAT_SESSION_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error("Error saving chat snapshot:", error);
    }
  }

  private updateSnapshot(
    updater: (snapshot: ChatStorageSnapshot) => ChatStorageSnapshot,
  ): ChatStorageSnapshot {
    const nextSnapshot = updater(this.getSnapshot());
    this.writeSnapshot(nextSnapshot);
    return nextSnapshot;
  }

  // Generate a unique chat ID
  generateChatId(): string {
    return nanoid(10);
  }

  // Create a new chat
  createNewChat(id?: string): Chat {
    const chatId = id || this.generateChatId();
    const newChat: Chat = {
      id: chatId,
      title: "Untitled Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.updateSnapshot((snapshot) => {
      const chats = [newChat, ...snapshot.chats.filter((chat) => chat.id !== newChat.id)];
      return {
        chats,
        currentChatId: chatId,
      };
    });

    return newChat;
  }

  // Save a chat to local storage
  saveChat(chat: Chat): void {
    const updatedChat: Chat = {
      ...chat,
      updatedAt: new Date(),
    };

    // Update title based on first user message if still untitled
    if (updatedChat.title === "Untitled Chat" && updatedChat.messages.length > 0) {
      const firstUserMessage = updatedChat.messages.find((m) => m.sender === "user");
      if (firstUserMessage) {
        updatedChat.title = this.truncateTitle(firstUserMessage.content);
      }
    }

    this.updateSnapshot((snapshot) => {
      const chats = [updatedChat, ...snapshot.chats.filter((c) => c.id !== updatedChat.id)];
      return {
        ...snapshot,
        chats,
      };
    });
  }

  // Load a chat by ID
  loadChat(chatId: string): Chat | null {
    const { chats } = this.getSnapshot();
    return chats.find((chat) => chat.id === chatId) || null;
  }

  // Get all chats from local storage
  getAllChats(): Chat[] {
    return this.getSnapshot().chats;
  }

  // Delete a chat
  deleteChat(chatId: string): void {
    this.updateSnapshot((snapshot) => {
      const chats = snapshot.chats.filter((chat) => chat.id !== chatId);
      const isCurrent = snapshot.currentChatId === chatId;
      return {
        chats,
        currentChatId: isCurrent ? null : snapshot.currentChatId,
      };
    });
  }

  // Set current chat ID
  setCurrentChatId(chatId: string): void {
    this.updateSnapshot((snapshot) => ({
      ...snapshot,
      currentChatId: chatId,
    }));
  }

  // Get current chat ID
  getCurrentChatId(): string | null {
    return this.getSnapshot().currentChatId;
  }

  // Clear current chat ID
  clearCurrentChatId(): void {
    this.updateSnapshot((snapshot) => ({
      ...snapshot,
      currentChatId: null,
    }));
  }

  // Add a message to a chat
  addMessageToChat(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const newMessage: ChatMessage = {
      id: nanoid(),
      timestamp: new Date(),
      ...message,
    };

    this.updateSnapshot((snapshot) => {
      const chats = snapshot.chats.map((chat) => {
        if (chat.id !== chatId) return chat;

        const updatedMessages = [...chat.messages, newMessage];
        const updatedChat: Chat = {
          ...chat,
          messages: updatedMessages,
          updatedAt: new Date(),
        };

        if (updatedChat.title === "Untitled Chat") {
          const firstUserMessage = updatedMessages.find((msg) => msg.sender === "user");
          if (firstUserMessage) {
            updatedChat.title = this.truncateTitle(firstUserMessage.content);
          }
        }

        return updatedChat;
      });

      return {
        ...snapshot,
        chats: chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
      };
    });
  }

  // Truncate title to a reasonable length
  private truncateTitle(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + "...";
  }

  // Get recent chats (limit to last 10)
  getRecentChats(limit: number = 10): Chat[] {
    return this.getAllChats()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
}
