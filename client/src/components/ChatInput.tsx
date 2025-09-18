import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Settings } from "lucide-react";
import { useState } from "react";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      console.log('Message sent:', message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex items-center gap-2 p-4 border rounded-lg bg-background border-border">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          data-testid="button-chat-settings"
          onClick={() => console.log('Chat settings clicked')}
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What would you like to do today?"
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          data-testid="input-chat-message"
        />

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim()}
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}