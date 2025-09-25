import { useState } from 'react';
import { Eye, MapPin, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ProjectDetailsModal } from '@/components/Projects/ProjectDetailsModal';
import { AddProjectDialog } from '@/components/Projects/AddProjectDialog';
import { mockProjects } from '@/data/mockData';
import { Project } from '@/types/admin';

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Projects</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all property projects
        </p>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">All Projects</h2>
          <p className="text-sm text-muted-foreground">
            {mockProjects.length} total projects
          </p>
        </div>
        <AddProjectDialog />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {project.location}
                  </div>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">
                    {project.property_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base Price:</span>
                  <div className="flex items-center font-semibold">
                    <IndianRupee className="w-4 h-4" />
                    {formatPrice(project.base_price)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Units:</span>
                  <span className="font-medium">
                    {project.available_units} / {project.total_units} available
                  </span>
                </div>

                {project.rera_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">RERA:</span>
                    <span className="font-medium text-xs">{project.rera_number}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewProject(project)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}