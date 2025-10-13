import { useState } from 'react';
import { Eye, UserCheck, UserX, Check, X } from 'lucide-react';
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

/**
 * USER MANAGEMENT COMPONENT
 * 
 * This component provides comprehensive user management functionality for admins:
 * - View all users in a table format
 * - Display user statistics (total, active, subscribers, KYC status)
 * - Manage KYC verification (approve/reject)
 * - Activate/deactivate user accounts
 * - View detailed user profiles
 */
export default function UserManagement() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  
  // Main users data - stores all user information
  const [users, setUsers] = useState<User[]>(mockUsers);
  
  // Modal state for user profile viewing
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  /**
   * Opens user profile modal for detailed view
   * @param user - The user whose profile to display
   */
  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  /**
   * Handles KYC verification actions (approve/reject)
   * Admin can change KYC status at any time for proper management
   * @param userId - ID of the user to update
   * @param status - New KYC status ('verified' or 'rejected')
   */
  const handleKycAction = (userId: string, status: 'verified' | 'rejected') => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId && user.profile
          ? {
              ...user,
              profile: {
                ...user.profile,
                kyc_verification_status: status,
              },
            }
          : user
      )
    );
    // NOTE: In production, this should trigger an API call to update the backend
  };

  // ==========================================
  // UTILITY FUNCTIONS FOR STYLING
  // ==========================================

  /**
   * Returns appropriate color class for user type badges
   * @param type - User type ('subscriber' or 'free')
   */
  const getUserTypeColor = (type: string) => {
    return type === 'subscriber' 
      ? 'bg-primary text-primary-foreground'     // Blue for subscribers
      : 'bg-secondary text-secondary-foreground'; // Gray for free users
  };

  /**
   * Returns appropriate color class for KYC status badges
   * @param status - KYC verification status
   */
  const getKycStatusColor = (status?: string) => {
    if (!status || status === 'partial' || status === 'pending') {
      return 'bg-muted text-muted-foreground'; // Neutral for undefined, partial, or pending
    }
    switch (status) {
      case 'verified':
        return 'bg-success text-success-foreground';      // Green for verified
      case 'rejected':
        return 'bg-destructive text-destructive-foreground'; // Red for rejected
      default:
        return 'bg-muted text-muted-foreground';          // Gray for unknown
    }
  };

  // ==========================================
  // STATISTICS CALCULATION
  // ==========================================

  // Calculate user statistics for dashboard cards
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    subscribers: users.filter(u => u.user_type === 'subscriber').length,
    verified: users.filter(u => u.profile?.kyc_verification_status === 'verified').length,
    pending: users.filter(u => u.profile?.kyc_verification_status === 'pending').length,
  };

  // ==========================================
  // COMPONENT RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      
      {/* ==========================================
          PAGE HEADER SECTION
          ========================================== */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage user accounts, profiles, and KYC verification
        </p>
      </div>

      {/* ==========================================
          STATISTICS DASHBOARD CARDS
          Shows key metrics at a glance
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        {/* Total Users Card */}
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </div>
        </Card>

        {/* Active Users Card */}
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>
        </Card>

        {/* Subscribers Card */}
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.subscribers}</p>
            <p className="text-sm text-muted-foreground">Subscribers</p>
          </div>
        </Card>

        {/* KYC Verified Users Card */}
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{stats.verified}</p>
            <p className="text-sm text-muted-foreground">KYC Verified</p>
          </div>
        </Card>

        {/* KYC Pending Users Card */}
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">KYC Pending</p>
          </div>
        </Card>
      </div>

      {/* ==========================================
          USERS DATA TABLE
          Main interface for managing users
          ========================================== */}
      <Card>
        <div className="p-6">
          
          {/* Table Header with Summary */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Users</h2>
            <div className="text-sm text-muted-foreground">
              {stats.active}/{stats.total} active users
            </div>
          </div>
          
          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              
              {/* Table Headers */}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">User Information</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="w-[180px]">KYC Verification</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              {/* Table Body - User Data Rows */}
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    
                    {/* User Information Column */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-base">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id}
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Details Column */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-mono text-sm">{user.phone_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email || 'No email provided'}
                        </div>
                      </div>
                    </TableCell>

                    {/* Account Type Column */}
                    <TableCell>
                      <Badge className={getUserTypeColor(user.user_type)}>
                        {user.user_type.toUpperCase()}
                      </Badge>
                    </TableCell>

                    {/* Account Status Column */}
                    <TableCell>
                      <Badge className={
                        user.is_active 
                          ? 'bg-success text-success-foreground' 
                          : 'bg-destructive text-destructive-foreground'
                      }>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>

                    {/* KYC Verification Column - Separate and Clear */}
                    <TableCell>
                      <div className="space-y-2">
                        {/* KYC Status Badge */}
                        <div>
                          {user.profile && user.profile.kyc_verification_status && ['verified', 'rejected'].includes(user.profile.kyc_verification_status) ? (
                            <Badge className={getKycStatusColor(user.profile.kyc_verification_status)}>
                              {user.profile.kyc_verification_status.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">
                              NO STATUS
                            </Badge>
                          )}
                        </div>
                        
                        {/* KYC Action Buttons */}
                        {user.profile && !['verified', 'rejected'].includes(user.profile.kyc_verification_status) && (
                          <div className="flex space-x-1">
                            {/* Accept KYC Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-success border-success hover:bg-success hover:text-white"
                              onClick={() => handleKycAction(user.id, 'verified')}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Accept
                            </Button>

                            {/* Reject KYC Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs text-destructive border-destructive hover:bg-destructive hover:text-white"
                              onClick={() => handleKycAction(user.id, 'rejected')}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* General Actions Column */}
                    <TableCell className="text-right">
                      <div className="flex flex-col space-y-1">
                        {/* View Profile Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs justify-start"
                          onClick={() => handleViewProfile(user)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>

                        {/* Account Activation Toggle Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs justify-start ${
                            user.is_active 
                              ? 'text-destructive hover:text-destructive' 
                              : 'text-success hover:text-success'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
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

      {/* ==========================================
          USER PROFILE MODAL
          Detailed view popup for selected user
          ========================================== */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}