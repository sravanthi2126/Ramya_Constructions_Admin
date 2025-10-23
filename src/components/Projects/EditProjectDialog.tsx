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
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditProjectDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProjectFormData {
  title: string;
  location: string;
  description: string;
  long_description: string;
  status: "available" | "sold_out" | "coming_soon";
  base_price: number;
  property_type: "commercial" | "residential" | "plot" | "land" | "mixed_use";
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  rera_number: string;
  has_rental_income: boolean;
  website_url?: string;
  floor_number: number;
  project_code: string;
  building_permission: string;
}

export function EditProjectDialog({
  project,
  isOpen,
  onClose,
  onSuccess,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    location: "",
    description: "",
    long_description: "",
    status: "available",
    base_price: 0,
    property_type: "commercial",
    total_units: 0,
    available_units: 0,
    sold_units: 0,
    reserved_units: 0,
    rera_number: "",
    has_rental_income: false,
    website_url: "",
    floor_number: 1,
    project_code: "",
    building_permission: "",
  });

  const [existingImages, setExistingImages] = useState<
    Array<{ url: string; filename: string }>
  >([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
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
        total_units: project.total_units || 0,
        available_units: project.available_units || 0,
        sold_units: project.sold_units || 0,
        reserved_units: project.reserved_units || 0,
        rera_number: project.rera_number || "",
        has_rental_income: project.has_rental_income || false,
        website_url: project.website_url || "",
        floor_number: project.floor_number || 1,
        project_code: project.project_code || "",
        building_permission: project.building_permission || "",
      });

      // Set existing images
      setExistingImages(project.gallery_images || []);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare the update data
      const updateData = {
        ...formData,
        // Combine existing images (minus deleted ones) with new images
        gallery_images: [
          ...existingImages.filter((img) => !imagesToDelete.includes(img.url)),
          ...newImages.map((file) => ({
            url: URL.createObjectURL(file), // This will be replaced with actual URLs after upload
            filename: file.name,
          })),
        ],
      };

      await projectApi.updateProject(project.id, updateData, newImages);

      toast({
        title: "✅ Project Updated",
        description: "Project has been successfully updated.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "❌ Update Failed",
        description:
          error.detail || "Failed to update project. Please try again.",
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

  const handleNewImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setNewImages((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageUrl: string) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const restoreImage = (imageUrl: string) => {
    setImagesToDelete((prev) => prev.filter((url) => url !== imageUrl));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "sold_out":
        return "bg-red-100 text-red-800 border-red-200";
      case "coming_soon":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case "residential":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "commercial":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "plot":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "land":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "mixed_use":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_code">Project Code *</Label>
                <Input
                  id="project_code"
                  value={formData.project_code}
                  onChange={(e) =>
                    handleChange("project_code", e.target.value.toUpperCase())
                  }
                  className="uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor_number">Floor Number *</Label>
                <Input
                  id="floor_number"
                  type="number"
                  value={formData.floor_number}
                  onChange={(e) =>
                    handleChange("floor_number", parseInt(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long_description">Long Description</Label>
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
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Project Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
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
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Property Type *</Label>
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
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="mixed_use">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
                <Badge className={getPropertyTypeColor(formData.property_type)}>
                  {formData.property_type.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (₹) *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="total_units">Total Units *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="available_units">Available Units *</Label>
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
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Additional Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rera_number">RERA Number</Label>
                <Input
                  id="rera_number"
                  value={formData.rera_number}
                  onChange={(e) => handleChange("rera_number", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleChange("website_url", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Switch
                checked={formData.has_rental_income}
                onCheckedChange={(checked) =>
                  handleChange("has_rental_income", checked)
                }
                disabled={
                  formData.property_type === "plot" ||
                  formData.property_type === "land"
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="has_rental_income"
                  className="text-sm font-medium"
                >
                  Has Rental Income
                </Label>
                <p className="text-xs text-gray-500">
                  Enable if this project offers rental income opportunities
                </p>
              </div>
            </div>

            {(formData.property_type === "plot" ||
              formData.property_type === "land") && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Rental income is not available for plot and land properties
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Images Management */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Project Images
            </h3>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-3">
                <Label>Existing Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {existingImages.map((image, index) => {
                    const isMarkedForDeletion = imagesToDelete.includes(
                      image.url
                    );
                    return (
                      <div
                        key={index}
                        className={`relative group rounded-lg p-2 border-2 ${
                          isMarkedForDeletion
                            ? "border-red-300 bg-red-50 opacity-60"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                          <img
                            src={image.url}
                            alt={`Project image ${index + 1}`}
                            className="object-cover rounded-md w-full h-full"
                          />
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {image.filename || `Image ${index + 1}`}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={
                            isMarkedForDeletion ? "default" : "destructive"
                          }
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() =>
                            isMarkedForDeletion
                              ? restoreImage(image.url)
                              : markImageForDeletion(image.url)
                          }
                        >
                          {isMarkedForDeletion ? (
                            <span className="text-xs">↶</span>
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                        </Button>
                        {isMarkedForDeletion && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Badge variant="destructive" className="text-xs">
                              To be deleted
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div className="space-y-3">
              <Label>Add New Images</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="new-images"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG (Max 10MB each)
                    </p>
                  </div>
                  <Input
                    id="new-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {newImages.map((file, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-100 rounded-lg p-2 border"
                    >
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          className="object-cover rounded-md w-full h-full"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Project...
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
