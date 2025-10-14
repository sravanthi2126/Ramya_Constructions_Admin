// components/Projects/EditProjectDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Project } from "@/types/admin";
import { projectApi } from "@/api/apiService";
import { useToast } from "@/hooks/use-toast";

interface EditProjectDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProjectDialog({
  project,
  isOpen,
  onClose,
  onSuccess,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    long_description: "",
    status: "available",
    base_price: 0,
    property_type: "commercial",
    has_rental_income: false,
    total_units: 0,
    available_units: 0,
    sold_units: 0,
    reserved_units: 0,
    rera_number: "",
    building_permission: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        location: project.location || "",
        description: project.description || "",
        long_description: project.long_description || "",
        status: project.status || "available",
        base_price: project.base_price || 0,
        property_type: project.property_type || "commercial",
        has_rental_income: project.has_rental_income || false,
        total_units: project.total_units || 0,
        available_units: project.available_units || 0,
        sold_units: project.sold_units || 0,
        reserved_units: project.reserved_units || 0,
        rera_number: project.rera_number || "",
        building_permission: project.building_permission || "",
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await projectApi.updateProject(project.id, formData);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.detail || "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="long_description">Detailed Description</Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) =>
                    handleChange("long_description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) =>
                    handleChange("property_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="mixed_use">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="base_price">Base Price (₹)</Label>
                <Input
                  id="base_price"
                  type="number"
                  value={formData.base_price}
                  onChange={(e) =>
                    handleChange("base_price", parseFloat(e.target.value))
                  }
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.has_rental_income}
                  onCheckedChange={(checked) =>
                    handleChange("has_rental_income", checked)
                  }
                />
                <Label htmlFor="rental-income">Has Rental Income</Label>
              </div>
            </div>
          </div>

          {/* Unit Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="total_units">Total Units</Label>
              <Input
                id="total_units"
                type="number"
                value={formData.total_units}
                onChange={(e) =>
                  handleChange("total_units", parseInt(e.target.value))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="available_units">Available Units</Label>
              <Input
                id="available_units"
                type="number"
                value={formData.available_units}
                onChange={(e) =>
                  handleChange("available_units", parseInt(e.target.value))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="sold_units">Sold Units</Label>
              <Input
                id="sold_units"
                type="number"
                value={formData.sold_units}
                onChange={(e) =>
                  handleChange("sold_units", parseInt(e.target.value))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="reserved_units">Reserved Units</Label>
              <Input
                id="reserved_units"
                type="number"
                value={formData.reserved_units}
                onChange={(e) =>
                  handleChange("reserved_units", parseInt(e.target.value))
                }
                required
              />
            </div>
          </div>

          {/* Legal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rera_number">RERA Number</Label>
              <Input
                id="rera_number"
                value={formData.rera_number}
                onChange={(e) => handleChange("rera_number", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="building_permission">Building Permission</Label>
              <Input
                id="building_permission"
                value={formData.building_permission}
                onChange={(e) =>
                  handleChange("building_permission", e.target.value)
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
