import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: Building2 },
  { name: 'Schemes', href: '/schemes', icon: TrendingUp },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Admin Management', href: '/admin', icon: Settings },
];

export function AdminSidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Mock logout functionality
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-50 h-full bg-sidebar-bg border-r border-sidebar-hover transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-hover">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-sidebar-foreground font-semibold text-lg">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-hover"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col h-full">
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white",
                  isActive && "bg-sidebar-accent text-white shadow-sm",
                  isCollapsed && "justify-center"
                )
              }
            >
              <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-sidebar-hover">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full text-sidebar-foreground hover:bg-destructive hover:text-white",
              isCollapsed && "px-0"
            )}
          >
            <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
}