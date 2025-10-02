import { useEffect, useRef } from 'react';
import { useActivity } from '@/contexts/ActivityContext';
import { useChatContext } from '@/contexts/ChatContext';
import { useLocation } from 'wouter';

export function ActivityChatFeedback() {
  const { activityMessages, clearActivityMessages } = useActivity();
  const { addMessage, currentChat } = useChatContext();
  const [, setLocation] = useLocation();
  const processedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentChat || activityMessages.length === 0) return;

    // Process new activity messages
    activityMessages.forEach((message, index) => {
      const messageKey = `${message}-${index}`;
      
      // Skip if already processed
      if (processedMessagesRef.current.has(messageKey)) return;
      
      // Add to chat as system message
      addMessage({
        sender: 'assistant',
        content: `Activity Update: ${message}\n\n[View Activity Details →](/user-activity)`
      });
      
      // Mark as processed
      processedMessagesRef.current.add(messageKey);
    });
    
    // Clear activity messages after processing
    if (activityMessages.length > 0) {
      clearActivityMessages();
    }
  }, [activityMessages, currentChat, addMessage, clearActivityMessages, setLocation]);

  return null; // This component doesn't render anything
}
