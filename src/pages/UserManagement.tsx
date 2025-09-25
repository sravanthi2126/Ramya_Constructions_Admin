import { useState } from 'react';
import { Eye, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { UserProfileModal } from '@/components/Users/UserProfileModal';
import { mockUsers } from '@/data/mockData';
import { User } from '@/types/admin';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getUserTypeColor = (type: string) => {
    return type === 'subscriber' 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-secondary text-secondary-foreground';
  };

  const getKycStatusColor = (status?: string) => {
    if (!status) return 'bg-muted text-muted-foreground';
    switch (status) {
      case 'verified':
        return 'bg-success text-success-foreground';
      case 'partial':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.is_active).length,
    subscribers: mockUsers.filter(u => u.user_type === 'subscriber').length,
    verified: mockUsers.filter(u => u.profile?.kyc_verification_status === 'verified').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts, profiles, and KYC verification
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.subscribers}</p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.verified}</p>
            <p className="text-sm text-muted-foreground">KYC Verified</p>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Users</h2>
            <div className="text-sm text-muted-foreground">
              {stats.active}/{stats.total} active users
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.phone_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || 'Not provided'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getUserTypeColor(user.user_type)}>
                        {user.user_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.profile ? (
                        <Badge className={getKycStatusColor(user.profile.kyc_verification_status)}>
                          {user.profile.kyc_verification_status.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.is_active ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={user.is_active ? 'text-destructive hover:text-destructive' : 'text-success hover:text-success'}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}