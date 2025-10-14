// Updated AddProjectDialog component with validation fix
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { projectApi, CreateProjectRequest } from "@/api/apiService";

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
  rera_number: string;
  has_rental_income: boolean;
  website_url?: string;
}

interface AddProjectDialogProps {
  onSuccess?: () => void;
}

export function AddProjectDialog({ onSuccess }: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      status: "available",
      property_type: "residential",
      has_rental_income: false,
      available_units: 0,
      total_units: 1, // Start with at least 1
    },
  });

  const [totalUnits, availableUnits] = watch([
    "total_units",
    "available_units",
  ]);
  const propertyType = watch("property_type");

  // Calculate sold units automatically
  const soldUnits = totalUnits - availableUnits;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  // Validate units before submission
  const validateUnits = (total: number, available: number) => {
    if (available > total) {
      return "Available units cannot exceed total units";
    }
    return true;
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      // Validate units before submission
      const unitsValidation = validateUnits(
        data.total_units,
        data.available_units
      );
      if (unitsValidation !== true) {
        toast({
          title: "Validation Error",
          description: unitsValidation,
          variant: "destructive",
        });
        return;
      }

      // Calculate sold units based on available units
      const calculatedSoldUnits = data.total_units - data.available_units;

      // Create the complete project data with all required fields
      const projectData: CreateProjectRequest = {
        ...data,
        sold_units: calculatedSoldUnits, // Calculate dynamically
        reserved_units: 0, // Always 0 for new projects
        pricing_details: {
          rent_per_sqft: 0,
          sale_price_per_sqft: 0,
          maintenance_per_sqft: 0,
        },
        quick_info: {},
        gallery_images: [],
        key_highlights: [],
        features: [],
        investment_highlights: [],
        amenities: [],
        building_permission: "",
        long_description: data.long_description || data.description,
        website_url: data.website_url || "",
        is_active: true, // Set to true for new projects
      };

      console.log("Submitting project data:", projectData);

      const response = await projectApi.createProject(
        projectData,
        selectedImages
      );

      toast({
        title: "Project Added",
        description:
          response.message || "New project has been successfully created.",
      });

      reset();
      setSelectedImages([]);
      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.detail || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update available units when total units change
  const handleTotalUnitsChange = (value: number) => {
    if (value < availableUnits) {
      setValue("available_units", value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Project Title *
                </Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter project title"
                  className="w-full"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location *
                </Label>
                <Input
                  id="location"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  placeholder="Enter project location"
                  className="w-full"
                />
                {errors.location && (
                  <p className="text-sm text-destructive">
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Enter project description"
                rows={3}
                className="w-full resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="long_description" className="text-sm font-medium">
                Long Description
              </Label>
              <Textarea
                id="long_description"
                {...register("long_description")}
                placeholder="Enter detailed project description"
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status *</Label>
                <Select
                  onValueChange={(value) => setValue("status", value as any)}
                  defaultValue="available"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold_out">Sold Out</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Property Type *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("property_type", value as any)
                  }
                  defaultValue="residential"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select property type" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price" className="text-sm font-medium">
                  Base Price (₹) *
                </Label>
                <Input
                  id="base_price"
                  type="number"
                  {...register("base_price", {
                    required: "Base price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be greater than 0" },
                  })}
                  placeholder="Enter base price"
                  className="w-full"
                />
                {errors.base_price && (
                  <p className="text-sm text-destructive">
                    {errors.base_price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_units" className="text-sm font-medium">
                  Total Units *
                </Label>
                <Input
                  id="total_units"
                  type="number"
                  {...register("total_units", {
                    required: "Total units is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Must have at least 1 unit" },
                    onChange: (e) =>
                      handleTotalUnitsChange(Number(e.target.value)),
                  })}
                  placeholder="Enter total units"
                  className="w-full"
                />
                {errors.total_units && (
                  <p className="text-sm text-destructive">
                    {errors.total_units.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="available_units"
                  className="text-sm font-medium"
                >
                  Available Units *
                </Label>
                <Input
                  id="available_units"
                  type="number"
                  {...register("available_units", {
                    required: "Available units is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Cannot be negative" },
                    max: {
                      value: totalUnits,
                      message: "Cannot exceed total units",
                    },
                  })}
                  placeholder="Enter available units"
                  className="w-full"
                />
                {errors.available_units && (
                  <p className="text-sm text-destructive">
                    {errors.available_units.message}
                  </p>
                )}
                {totalUnits > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Sold units: {soldUnits} (auto-calculated)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rera_number" className="text-sm font-medium">
                  RERA Number
                </Label>
                <Input
                  id="rera_number"
                  {...register("rera_number")}
                  placeholder="Enter RERA number"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url" className="text-sm font-medium">
                  Website URL
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  {...register("website_url")}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has_rental_income"
                checked={watch("has_rental_income")}
                onCheckedChange={(checked) =>
                  setValue("has_rental_income", checked)
                }
                disabled={propertyType === "plot" || propertyType === "land"}
              />
              <Label
                htmlFor="has_rental_income"
                className="text-sm font-medium"
              >
                Has Rental Income
              </Label>
            </div>
            {(propertyType === "plot" || propertyType === "land") && (
              <p className="text-sm text-muted-foreground">
                Rental income is not available for plot and land properties
              </p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>

            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium">
                Project Images
              </Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full"
              />
              {selectedImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedImages.length} image(s) selected:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedImages.map((file, index) => (
                      <p
                        key={index}
                        className="text-xs text-muted-foreground truncate"
                      >
                        {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                reset();
                setSelectedImages([]);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Add Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
