import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Users, Database, Shield, Activity } from 'lucide-react';

export default function AdminManagement() {
  const adminFeatures = [
    {
      title: 'System Settings',
      description: 'Configure application settings and preferences',
      icon: Settings,
      status: 'Active',
      actions: ['Configure', 'View Logs']
    },
    {
      title: 'User Roles',
      description: 'Manage admin roles and permissions',
      icon: Users,
      status: 'Active',
      actions: ['Manage Roles', 'View Activity']
    },
    {
      title: 'Database Management',
      description: 'Monitor and manage database operations',
      icon: Database,
      status: 'Healthy',
      actions: ['View Stats', 'Backup']
    },
    {
      title: 'Security',
      description: 'Security settings and audit logs',
      icon: Shield,
      status: 'Secure',
      actions: ['Security Scan', 'Audit Logs']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
        <p className="text-muted-foreground mt-1">
          System administration and configuration
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">System Status</h3>
              <p className="text-sm text-muted-foreground">All systems operational</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Active Admins</h3>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Database className="w-6 h-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold">DB Health</h3>
              <p className="text-sm text-muted-foreground">98.9% uptime</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">No threats detected</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminFeatures.map((feature, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {feature.status}
                </Badge>
              </div>
              
              <div className="flex space-x-2">
                {feature.actions.map((action, actionIndex) => (
                  <Button key={actionIndex} variant="outline" size="sm">
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Admin Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'System backup completed', time: '2 hours ago', admin: 'System' },
            { action: 'New user role created', time: '5 hours ago', admin: 'Admin User' },
            { action: 'Database maintenance performed', time: '1 day ago', admin: 'System' },
            { action: 'Security scan completed', time: '2 days ago', admin: 'Security Bot' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">by {activity.admin}</p>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}