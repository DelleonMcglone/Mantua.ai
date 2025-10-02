import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import { ActivityChatFeedback } from "@/components/ActivityChatFeedback";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-background">
      {/* Activity monitoring for chat feedback */}
      <ActivityChatFeedback />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <MainContent />
      </div>
    </div>
  );
}