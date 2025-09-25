import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'mock_token');
        toast({
          title: 'Login successful',
          description: 'Welcome to the admin dashboard!',
        });
        navigate('/');
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-1">Demo Credentials:</p>
          <p className="text-xs text-muted-foreground">Email: admin@example.com</p>
          <p className="text-xs text-muted-foreground">Password: admin123</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Admin Dashboard v1.0 - Secure Access Portal
          </p>
        </div>
      </Card>
    </div>
  );
}