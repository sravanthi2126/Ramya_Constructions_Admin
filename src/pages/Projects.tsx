// components/Projects/Projects.tsx
import { useState, useEffect } from "react";
import {
  Eye,
  MapPin,
  IndianRupee,
  Trash,
  Edit,
  Building,
  Calendar,
  Search,
  Filter,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectDetailsModal } from "@/components/Projects/ProjectDetailsModal";
import { AddProjectDialog } from "@/components/Projects/AddProjectDialog";
import { EditProjectDialog } from "@/components/Projects/EditProjectDialog";
import { projectApi } from "@/api/apiService";
import { Project } from "@/types/admin";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectApi.getAllProjects(1, 100);
      setProjects(response.projects);
      setFilteredProjects(response.projects);
    } catch (err: any) {
      const errorMessage =
        err.detail || "Failed to fetch projects. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.long_description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Apply property type filter
    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(
        (project) => project.property_type === propertyTypeFilter
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, propertyTypeFilter]);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await projectApi.deleteProject(projectId);
      toast({
        title: "Success",
        description: response.message || "Project deleted successfully",
      });
      fetchProjects(); // Refresh the list
    } catch (err: any) {
      const errorMessage =
        err.detail || "Failed to delete project. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleProjectAdded = () => {
    fetchProjects();
    toast({
      title: "Success",
      description: "Project created successfully",
    });
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    toast({
      title: "Success",
      description: "Project updated successfully",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPropertyTypeFilter("all");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
      case "sold_out":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300";
      case "coming_soon":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading Skeleton
  const ProjectSkeleton = () => (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="pt-4 border-t space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 p-4">
        <div className="text-center max-w-md">
          <div className="text-destructive text-lg font-semibold mb-2">
            Error Loading Projects
          </div>
          <div className="text-muted-foreground text-sm mb-4">{error}</div>
          <Button onClick={fetchProjects} size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Projects
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage and monitor all property projects
        </p>
      </div>

      {/* Stats and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">All Projects</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} of {projects.length} project
            {projects.length !== 1 ? "s" : ""}
            {(searchTerm ||
              statusFilter !== "all" ||
              propertyTypeFilter !== "all") &&
              " (filtered)"}
          </p>
        </div>
        <AddProjectDialog onSuccess={handleProjectAdded}>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </AddProjectDialog>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects by title, location, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="sold_out">Sold Out</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Type Filter */}
            <Select
              value={propertyTypeFilter}
              onValueChange={setPropertyTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="plot">Plot</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="mixed_use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchTerm ||
              statusFilter !== "all" ||
              propertyTypeFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="text-yellow-800 dark:text-yellow-300 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group"
          >
            <div className="space-y-4">
              {/* Header with Title and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors"
                    title={project.title}
                  >
                    {project.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate" title={project.location}>
                      {project.location}
                    </span>
                  </div>
                </div>
                <Badge
                  className={`ml-2 flex-shrink-0 text-xs px-2 py-1 ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              {/* Project Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    Type:
                  </span>
                  <span className="font-medium capitalize">
                    {project.property_type.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base Price:</span>
                  <div className="flex items-center font-semibold">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {formatPrice(project.base_price)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Units:</span>
                  <span className="font-medium">
                    {project.available_units} / {project.total_units} available
                  </span>
                </div>

                {project.rera_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">RERA:</span>
                    <span
                      className="font-medium text-xs truncate max-w-[120px]"
                      title={project.rera_number}
                    >
                      {project.rera_number}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created:</span>
                  <span>{formatDate(project.created_at)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>
                    {Math.round(
                      (project.sold_units / project.total_units) * 100
                    )}
                    % sold
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (project.sold_units / project.total_units) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProject(project)}
                    className="text-xs sm:text-sm"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProject(project)}
                    className="text-xs sm:text-sm"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs sm:text-sm"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Trash className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-12 sm:py-16 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground mb-4 text-lg">
            {projects.length === 0
              ? "No projects found"
              : "No projects match your filters"}
          </div>
          {projects.length === 0 ? (
            <AddProjectDialog onSuccess={handleProjectAdded}>
              <Button>Create Your First Project</Button>
            </AddProjectDialog>
          ) : (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
      />

      {/* Edit Project Dialog */}
      {selectedProject && (
        <EditProjectDialog
          project={selectedProject}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedProject(null);
          }}
          onSuccess={handleProjectUpdated}
        />
      )}
    </div>
  );
}
