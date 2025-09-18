import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-background">
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