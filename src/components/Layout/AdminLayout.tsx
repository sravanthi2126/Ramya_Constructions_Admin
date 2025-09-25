import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}