import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("admin_token");
        const userData = localStorage.getItem("admin_user");

        if (token && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        } else {
          clearAuthData();
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    // Remove ONLY authentication related data
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("auth_token");

    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    clearAuthData();
    // Use window.location for reliable redirect outside Router context
    window.location.href = "/login";
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
