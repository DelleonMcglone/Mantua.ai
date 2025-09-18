import Sidebar from '../Sidebar';

export default function SidebarExample() {
  return (
    <div className="h-96">
      <Sidebar isOpen={true} onClose={() => console.log('Sidebar close')} />
    </div>
  );
}