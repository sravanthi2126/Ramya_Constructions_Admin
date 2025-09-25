import { Project } from '@/types/admin';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, Building, Calendar, CreditCard } from 'lucide-react';

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success text-success-foreground';
      case 'sold_out':
        return 'bg-destructive text-destructive-foreground';
      case 'coming_soon':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{project.location}</span>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Description */}
          {project.description && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </Card>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Pricing</h4>
              </div>
              <p className="text-lg font-bold text-primary">{formatPrice(project.base_price)}</p>
              <p className="text-xs text-muted-foreground">Base price</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Building className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Property Type</h4>
              </div>
              <p className="text-sm font-medium capitalize">{project.property_type.replace('_', ' ')}</p>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">Units Overview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Units:</span>
                  <span className="font-medium">{project.total_units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium text-success">{project.available_units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sold:</span>
                  <span className="font-medium text-primary">{project.sold_units}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Project Info</h4>
              </div>
              <div className="space-y-1 text-sm">
                {project.rera_number && (
                  <div>
                    <span className="text-muted-foreground">RERA: </span>
                    <span className="font-medium">{project.rera_number}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created: </span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Sales Progress</h4>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(project.sold_units / project.total_units) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0 units</span>
              <span>{Math.round((project.sold_units / project.total_units) * 100)}% sold</span>
              <span>{project.total_units} units</span>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}