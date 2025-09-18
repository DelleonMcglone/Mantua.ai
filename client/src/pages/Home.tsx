import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import { useState } from "react";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    console.log('Sidebar toggled:', !isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    console.log('Sidebar closed');
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main area */}
      <div className="flex flex-col flex-1 lg:ml-0">
        <Header onToggleSidebar={toggleSidebar} />
        <MainContent />
      </div>
    </div>
  );
}