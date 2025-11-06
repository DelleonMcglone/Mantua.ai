import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { ChatManager, Chat, ChatMessage } from "@/lib/chatManager";

interface ChatContextType {
  currentChat: Chat | null;
  allChats: Chat[];
  isLoading: boolean;
  createNewChat: () => Chat | null;
  switchToChat: (chatId: string) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">, chatId?: string) => void;
  refreshChats: () => void;
  deleteChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, navigate] = useLocation();
  
  const chatManager = ChatManager.getInstance();

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Handle route changes
  useEffect(() => {
    handleRouteChange();
  }, [location]);

  const loadChats = () => {
    setIsLoading(true);
    try {
      const chats = chatManager.getAllChats();
      setAllChats(chats);
      
      // Load current chat if there's a current chat ID
      const currentChatId = chatManager.getCurrentChatId();
      if (currentChatId) {
        const chat = chatManager.loadChat(currentChatId);
        setCurrentChat(chat);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteChange = () => {
    // Parse chat ID from route like /chat/:id
    const chatMatch = location.match(/^\/chat\/(.+)$/);
    if (chatMatch) {
      const chatId = chatMatch[1];
      
      console.log(`[ChatContext] Route change detected: ${location}, chatId: ${chatId}`);
      
      if (chatId === 'new') {
        // Handle /chat/new - clear current chat and show empty state
        console.log(`[ChatContext] Route to /chat/new detected, clearing current chat`);
        setCurrentChat(null);
        chatManager.clearCurrentChatId();
      } else {
        // Only load if it's different from current chat
        if (!currentChat || currentChat.id !== chatId) {
          loadChatById(chatId);
        } else {
          console.log(`[ChatContext] Chat ${chatId} already loaded, skipping reload`);
        }
      }
    } else {
      // Not a chat route, clear current chat
      console.log(`[ChatContext] Not a chat route: ${location}, clearing current chat`);
      setCurrentChat(null);
    }
  };

  const createNewChat = (): Chat | null => {
    try {
      console.log(`[ChatContext] Creating new chat`);
      const newChat = chatManager.createNewChat();
      console.log(`[ChatContext] Created new chat:`, { id: newChat.id, title: newChat.title });
      setCurrentChat(newChat);
      setAllChats(chatManager.getAllChats());
      
      // Navigate to the new chat route only if we're not already there
      const currentPath = `/chat/${newChat.id}`;
      if (location !== currentPath) {
        console.log(`[ChatContext] Navigating to: ${currentPath}`);
        navigate(currentPath);
      }
      return newChat;
    } catch (error) {
      console.error("Error creating new chat:", error);
      return null;
    }
  };

  const switchToChat = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const loadChatById = (chatId: string) => {
    try {
      console.log(`[ChatContext] Loading chat by ID: ${chatId}`);
      const chat = chatManager.loadChat(chatId);
      if (chat) {
        console.log(`[ChatContext] Loaded chat:`, { id: chat.id, title: chat.title, messageCount: chat.messages.length });
        setCurrentChat(chat);
        chatManager.setCurrentChatId(chatId);
      } else {
        // Chat not found, redirect to new chat
        console.warn(`Chat ${chatId} not found, creating new chat`);
        navigate('/chat/new');
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      navigate('/chat/new');
    }
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">, chatId?: string) => {
    const targetChatId = chatId ?? currentChat?.id;
    if (!targetChatId) return;
    
    try {
      chatManager.addMessageToChat(targetChatId, message);
      
      // Reload the current chat and refresh all chats
      const updatedChat = chatManager.loadChat(targetChatId);
      if (updatedChat && currentChat?.id === targetChatId) {
        setCurrentChat(updatedChat);
      }
      setAllChats(chatManager.getAllChats());
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  const refreshChats = () => {
    loadChats();
  };

  const deleteChat = (chatId: string) => {
    try {
      chatManager.deleteChat(chatId);
      setAllChats(chatManager.getAllChats());
      
      // If we deleted the current chat, navigate to new chat
      if (currentChat?.id === chatId) {
        navigate('/chat/new');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const value: ChatContextType = {
    currentChat,
    allChats,
    isLoading,
    createNewChat,
    switchToChat,
    addMessage,
    refreshChats,
    deleteChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
