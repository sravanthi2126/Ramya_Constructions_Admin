import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleProfile = () => {
    setShowProfileDropdown(false);
    // Navigate to profile page or show profile modal
    navigate('/admin/profile');
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    // Add your logout logic here
    // For example: clear tokens, redirect to login
    localStorage.removeItem('authToken'); // Example
    navigate('/login');
  };

  // Mock user data - replace with actual user data from context/store
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: null // You can add avatar URL here
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} />
      
      {/* Fixed Header */}
      <header 
        className={cn(
          "fixed top-0 right-0 z-40 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/60 transition-all duration-300 ease-in-out shadow-sm",
          isCollapsed ? "left-16" : "left-64"
        )}
      >
        <div className="flex items-center justify-end h-16 px-6">
          <div className="relative">
            {/* Profile Button */}
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-3 p-2 rounded-full hover:bg-white/60 transition-all duration-200 hover:shadow-sm"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-gray-600 transition-transform duration-200",
                showProfileDropdown && "rotate-180"
              )} />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-2">
                {/* User Info */}
                <div className="px-5 py-4 border-b border-gray-100/60">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfile}
                    className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-blue-50/70 transition-colors duration-200 group"
                  >
                    <User className="w-5 h-5 mr-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50/70 transition-colors duration-200 group"
                  >
                    <LogOut className="w-5 h-5 mr-4 text-red-500 group-hover:text-red-600 transition-colors" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className={cn(
          "transition-all duration-300 ease-in-out pt-16", // Added pt-16 for header space
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  );
}