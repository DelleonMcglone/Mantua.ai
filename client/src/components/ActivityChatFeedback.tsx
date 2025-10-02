import { useEffect, useRef } from 'react';
import { useActivity } from '@/contexts/ActivityContext';
import { useChatContext } from '@/contexts/ChatContext';

export function ActivityChatFeedback() {
  const { activityMessages, clearActivityMessages } = useActivity();
  const { addMessage, currentChat } = useChatContext();
  const processedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentChat || activityMessages.length === 0) return;

    // Process new activity messages
    activityMessages.forEach((activityMsg, index) => {
      const messageKey = `${activityMsg.message}-${index}`;
      
      // Skip if already processed
      if (processedMessagesRef.current.has(messageKey)) return;
      
      // Determine link text based on message type
      const linkText = activityMsg.type === 'user' 
        ? 'View in User Activity' 
        : 'View in Agent Activity';
      
      // Add to chat as system message
      addMessage({
        sender: 'assistant',
        content: `${activityMsg.message}\n\n[${linkText} →](${activityMsg.link})`
      });
      
      // Mark as processed
      processedMessagesRef.current.add(messageKey);
    });
    
    // Clear activity messages after processing
    if (activityMessages.length > 0) {
      clearActivityMessages();
    }
  }, [activityMessages, currentChat, addMessage, clearActivityMessages]);

  return null; // This component doesn't render anything
}
