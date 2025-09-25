import { nanoid } from 'nanoid';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isAgentMode: boolean;
}

const CHATS_STORAGE_KEY = 'mantua_chats';
const CURRENT_CHAT_KEY = 'mantua_current_chat';

export class ChatManager {
  private static instance: ChatManager;
  
  static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
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
      title: 'Untitled Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isAgentMode: false,
    };

    this.saveChat(newChat);
    this.setCurrentChatId(chatId);
    return newChat;
  }

  // Save a chat to local storage
  saveChat(chat: Chat): void {
    const chats = this.getAllChats();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    chat.updatedAt = new Date();
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.unshift(chat); // Add new chats to the beginning
    }

    // Update title based on first user message if still untitled
    if (chat.title === 'Untitled Chat' && chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find(m => m.sender === 'user');
      if (firstUserMessage) {
        chat.title = this.truncateTitle(firstUserMessage.content);
      }
    }

    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
  }

  // Load a chat by ID
  loadChat(chatId: string): Chat | null {
    const chats = this.getAllChats();
    return chats.find(chat => chat.id === chatId) || null;
  }

  // Get all chats from local storage
  getAllChats(): Chat[] {
    try {
      const chatsData = localStorage.getItem(CHATS_STORAGE_KEY);
      if (!chatsData) return [];
      
      const chats = JSON.parse(chatsData);
      // Convert date strings back to Date objects and ensure data integrity
      return chats.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt || Date.now()),
        updatedAt: new Date(chat.updatedAt || Date.now()),
        messages: Array.isArray(chat.messages) ? chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp || Date.now()),
        })) : [],
        isAgentMode: Boolean(chat.isAgentMode),
      }));
    } catch (error) {
      console.error('Error loading chats from localStorage:', error);
      return [];
    }
  }

  // Delete a chat
  deleteChat(chatId: string): void {
    const chats = this.getAllChats().filter(chat => chat.id !== chatId);
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
    
    // If we deleted the current chat, clear the current chat ID
    if (this.getCurrentChatId() === chatId) {
      this.clearCurrentChatId();
    }
  }

  // Set current chat ID
  setCurrentChatId(chatId: string): void {
    localStorage.setItem(CURRENT_CHAT_KEY, chatId);
  }

  // Get current chat ID
  getCurrentChatId(): string | null {
    return localStorage.getItem(CURRENT_CHAT_KEY);
  }

  // Clear current chat ID
  clearCurrentChatId(): void {
    localStorage.removeItem(CURRENT_CHAT_KEY);
  }

  // Add a message to a chat
  addMessageToChat(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const chat = this.loadChat(chatId);
    if (!chat) return;

    const newMessage: ChatMessage = {
      id: nanoid(),
      timestamp: new Date(),
      ...message,
    };

    chat.messages.push(newMessage);
    this.saveChat(chat);
  }

  // Update Agent mode for a chat
  updateChatAgentMode(chatId: string, isAgentMode: boolean): void {
    const chat = this.loadChat(chatId);
    if (!chat) return;

    chat.isAgentMode = isAgentMode;
    this.saveChat(chat);
  }

  // Truncate title to a reasonable length
  private truncateTitle(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength - 3) + '...';
  }

  // Get recent chats (limit to last 10)
  getRecentChats(limit: number = 10): Chat[] {
    return this.getAllChats()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
}