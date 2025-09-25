import { User } from '@/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { User as UserIcon, Mail, Phone, MapPin, Briefcase, CreditCard, Shield } from 'lucide-react';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  if (!user) return null;

  const getKycStatusColor = (status: string) => {
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

  const getUserTypeColor = (type: string) => {
    return type === 'subscriber' 
      ? 'bg-primary text-primary-foreground' 
      : 'bg-secondary text-secondary-foreground';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>{user.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3 flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>Basic Information</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{user.phone_number}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">User Type</p>
                  <Badge className={getUserTypeColor(user.user_type)}>
                    {user.user_type.toUpperCase()}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={user.is_active ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Details - Only for subscribers */}
          {user.profile && (
            <>
              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Address Information</span>
                </h4>
                
                <div className="space-y-2">
                  <p className="font-medium">
                    {user.profile.first_name} {user.profile.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.profile.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.profile.city}, {user.profile.state} - {user.profile.pincode}
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Professional Information</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Occupation</p>
                    <p className="font-medium">{user.profile.occupation || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Annual Income</p>
                    <p className="font-medium">{user.profile.annual_income || 'Not provided'}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>KYC Information</span>
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Verification Status</span>
                    <Badge className={getKycStatusColor(user.profile.kyc_verification_status)}>
                      {user.profile.kyc_verification_status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">PAN Number</p>
                      <p className="font-medium font-mono text-sm">{user.profile.pan_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Aadhar Number</p>
                      <p className="font-medium font-mono text-sm">
                        {user.profile.aadhar_number.replace(/(\d{4})/g, '$1 ').trim()}
                      </p>
                    </div>
                  </div>
                  
                  {user.profile.kyc_verified_at && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">Verified On</p>
                      <p className="text-sm font-medium">
                        {new Date(user.profile.kyc_verified_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Account Timeline */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Account Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {new Date(user.updated_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}