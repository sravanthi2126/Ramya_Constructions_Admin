import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  Users,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  UserCircle,
  Mail // ✅ Added Mail icon for Contact Inquiry
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Schemes', href: '/schemes', icon: TrendingUp },
  { name: 'Projects', href: '/projects', icon: Building2 },
  { name: 'Agents', href: '/agents', icon: UserCircle },
   { name: 'Contact Inquiry', href: '/contact-inquiry', icon: Mail }, 
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Admin Management', href: '/admin', icon: Settings },
];

export function AdminSidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-50 h-full bg-gradient-to-b from-teal-50 to-teal-100 border-r border-teal-200 shadow-md transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-teal-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-800 font-bold text-lg whitespace-nowrap">Ramya-Admin</span>
              <span className="text-sm text-gray-600 whitespace-nowrap">Constructions Panel</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-600 hover:text-teal-300 hover:bg-teal-50 rounded-full p-2 transition-colors duration-200"
        >
          {isCollapsed ? <Menu className="w-8 h-8" /> : <ChevronLeft className="w-8 h-8" />}
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
                  "flex items-center px-3 py-2.5 text-base font-medium rounded-xl transition-colors duration-200",
                  !isCollapsed && "text-gray-700 hover:bg-teal-50 hover:text-teal-400",
                  isActive && "bg-teal-400/10 text-teal-500 shadow-md border-l-4 border-teal-400",
                  isCollapsed && "justify-center"
                )
              }
            >
              <item.icon
                className={cn(
                  isCollapsed ? "w-12 h-12" : "w-6 h-6 mr-3",
                  !isCollapsed && "text-gray-700 group-hover:text-teal-400"
                )}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-teal-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              "w-full text-gray-700 transition-colors duration-200",
              !isCollapsed && "hover:bg-red-200/20 hover:text-red-500 rounded-xl py-2.5",
              isCollapsed && "px-0"
            )}
          >
            <LogOut
              className={cn(
                isCollapsed ? "w-12 h-12" : "w-6 h-6 mr-2",
                !isCollapsed && "text-gray-700 group-hover:text-red-500"
              )}
            />
            {!isCollapsed && <span className="text-base">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
