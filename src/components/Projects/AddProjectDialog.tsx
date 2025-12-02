// components/Projects/AddProjectDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X, Upload, AlertCircle, CheckCircle2, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProjectFormData {
  title: string;
  location: string;
  description: string;
  long_description: string;
  status: "available" | "sold_out" | "coming_soon";
  base_price: number;
  property_type: "commercial" | "residential" | "Plot";
  total_units: number;
  available_units: number;
  rera_number: string;
  has_rental_income: boolean;
  website_url?: string;
  floor_number: number;
  project_code: string;
  gst_percentage?: number;
  gst_type?: "inclusive" | "exclusive";
}

interface AddProjectDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddProjectDialog({
  onSuccess,
  children,
}: AddProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedBrochures, setSelectedBrochures] = useState<File[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      status: "available",
      property_type: "residential",
      has_rental_income: false,
      available_units: 0,
      total_units: 1,
      floor_number: 1,
      project_code: "",
      gst_percentage: 18, // Default GST percentage
      gst_type: "inclusive", // Default GST type
    },
  });

  const [totalUnits, availableUnits] = watch([
    "total_units",
    "available_units",
  ]);
  const propertyType = watch("property_type");

  const soldUnits = totalUnits - availableUnits;

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const fileType = file.type;
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        return validImageTypes.includes(fileType);
      });
      
      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid Files",
          description: "Only JPG, PNG, JPEG, GIF, and WEBP images are allowed",
          variant: "destructive",
        });
      }
      
      setSelectedImages((prev) => [...prev, ...validFiles]);
    }
    event.target.value = ''; // Reset input
  };

  const handleBrochureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const fileType = file.type;
        const validTypes = [
          'image/jpeg', 'image/png', 'image/jpg', 
          'application/pdf', 
          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        return validTypes.includes(fileType);
      });
      
      if (validFiles.length !== files.length) {
        toast({
          title: "Invalid Files",
          description: "Only JPG, PNG, PDF files are allowed",
          variant: "destructive",
        });
      }
      
      setSelectedBrochures((prev) => [...prev, ...validFiles]);
    }
    event.target.value = ''; // Reset input
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeBrochure = (index: number) => {
    setSelectedBrochures((prev) => prev.filter((_, i) => i !== index));
  };

  const validateUnits = (total: number, available: number) => {
    if (available > total) {
      return "Available sqft cannot be greater than total sqft.";
    }
    return true;
  };

  const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image/')) {
      return '🖼️';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊';
    }
    return '📎';
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      // Validate units
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
        setIsLoading(false);
        return;
      }

      // Validate file sizes (10MB limit for images, 20MB for brochures)
      const oversizedImages = selectedImages.filter(img => !validateFileSize(img, 10));
      const oversizedBrochures = selectedBrochures.filter(brochure => !validateFileSize(brochure, 20));
      
      if (oversizedImages.length > 0 || oversizedBrochures.length > 0) {
        toast({
          title: "File Size Error",
          description: "Images must be ≤10MB, Brochures must be ≤20MB",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const calculatedSoldUnits = data.total_units - data.available_units;

      const projectData: CreateProjectRequest = {
        ...data,
        sold_units: calculatedSoldUnits,
        reserved_units: 0,
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
        building_permission: data.rera_number ? "Approved" : "Pending",
        long_description: data.long_description || data.description,
        website_url: data.website_url || "",
        is_active: true,
        brochure: [], // Initialize empty brochure array
        gst_percentage: data.gst_percentage || 18,
        gst_type: data.gst_type || "inclusive",
      };

      // Send both images and brochures
      const response = await projectApi.createProject(
        projectData,
        selectedImages,
        selectedBrochures // Add brochures parameter
      );

      toast({
        title: "✅ Project Added Successfully",
        description:
          response.message || "New project has been successfully created.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      reset();
      setSelectedImages([]);
      setSelectedBrochures([]);
      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "❌ Error Creating Project",
        description:
          error.detail || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotalUnitsChange = (value: number) => {
    if (value < availableUnits) {
      setValue("available_units", value);
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-lg">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900">
            Add New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
          {/* Basic Information */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-gray-700"
                >
                  Project Title *
                </Label>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Project title is required",
                  })}
                  placeholder="Enter project title"
                  className={`w-full ${errors.title ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project_code"
                  className="text-sm font-medium text-gray-700"
                >
                  Project Code *
                </Label>
                <Input
                  id="project_code"
                  {...register("project_code", {
                    required: "Project code is required",
                    pattern: {
                      value: /^[A-Z0-9]{3,5}$/,
                      message:
                        "Project code must be 3-5 uppercase letters or numbers",
                    },
                  })}
                  placeholder="e.g., PROJ1"
                  className={`w-full uppercase ${errors.project_code
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                    }`}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    setValue("project_code", value);
                  }}
                />
                {errors.project_code && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.project_code.message}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-700"
                >
                  Location *
                </Label>
                <Input
                  id="location"
                  {...register("location", {
                    required: "Location is required",
                  })}
                  placeholder="Enter project location"
                  className={`w-full ${errors.location ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                />
                {errors.location && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.location.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="floor_number"
                  className="text-sm font-medium text-gray-700"
                >
                  Floor Number *
                </Label>
                <Input
                  id="floor_number"
                  type="number"
                  {...register("floor_number", {
                    required: "Floor number is required",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Floor number cannot be negative",
                    },
                  })}
                  placeholder="e.g., 1, 2, 3, etc."
                  className={`w-full ${errors.floor_number
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                    }`}
                />
                {errors.floor_number && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.floor_number.message}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="gst_percentage"
                  className="text-sm font-medium text-gray-700"
                >
                  GST Percentage
                </Label>
                <Input
                  id="gst_percentage"
                  type="number"
                  step="0.01"
                  {...register("gst_percentage", {
                    valueAsNumber: true,
                    min: { value: 0, message: "GST cannot be negative" },
                    max: { value: 100, message: "GST cannot exceed 100%" },
                  })}
                  placeholder="e.g., 18"
                  className={`w-full ${errors.gst_percentage ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                />
                {errors.gst_percentage && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.gst_percentage.message}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  GST percentage for this project (default: 18%)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  GST Type
                </Label>
                <Select
                  onValueChange={(value) => setValue("gst_type", value as any)}
                  defaultValue="inclusive"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select GST type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white shadow-lg">
                    <SelectItem value="inclusive">Inclusive</SelectItem>
                    <SelectItem value="exclusive">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Whether GST is inclusive or exclusive of price
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description *
              </Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Enter project description"
                rows={3}
                className={`w-full resize-none ${errors.description ? "border-red-500 focus:ring-red-500" : ""
                  }`}
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="long_description"
                className="text-sm font-medium text-gray-700"
              >
                Long Description
              </Label>
              <Textarea
                id="long_description"
                {...register("long_description")}
                placeholder="Enter detailed project description"
                rows={3}
                className="w-full resize-none"
              />
              <p className="text-xs text-gray-500">
                Optional detailed description for the project
              </p>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Project Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Status *
                </Label>
                <Select
                  onValueChange={(value) => setValue("status", value as any)}
                  defaultValue="available"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white shadow-lg">
                    <SelectItem value="available">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Available
                      </div>
                    </SelectItem>
                    <SelectItem value="sold_out" >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Sold Out
                      </div>
                    </SelectItem>
                    <SelectItem value="coming_soon">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Coming Soon
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Property Type *
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("property_type", value as any)
                  }
                  defaultValue="residential"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white shadow-lg">
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={getPropertyTypeColor(watch("property_type"))}
                  >
                    {watch("property_type")?.replace("_", " ") || "Residential"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="base_price"
                  className="text-sm font-medium text-gray-700"
                >
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
                  className={`w-full ${errors.base_price ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                />
                {errors.base_price && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.base_price.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="total_units"
                  className="text-sm font-medium text-gray-700"
                >
                  Total Sqft *
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
                  className={`w-full ${errors.total_units
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                    }`}
                />
                {errors.total_units && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.total_units.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="available_units"
                  className="text-sm font-medium text-gray-700"
                >
                  Available Sqft *
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
                  className={`w-full ${errors.available_units
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                    }`}
                />
                {errors.available_units && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.available_units.message}
                  </div>
                )}
                {totalUnits > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Sold Sqft calculated: {soldUnits}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Additional Information
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="rera_number"
                  className="text-sm font-medium text-gray-700"
                >
                  RERA Number
                </Label>
                <Input
                  id="rera_number"
                  {...register("rera_number")}
                  placeholder="Enter RERA number"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Optional RERA registration number
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="website_url"
                  className="text-sm font-medium text-gray-700"
                >
                  Website URL
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  {...register("website_url")}
                  placeholder="https://example.com"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Optional project website URL
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Switch
                id="has_rental_income"
                checked={watch("has_rental_income")}
                onCheckedChange={(checked) =>
                  setValue("has_rental_income", checked)
                }
                disabled={propertyType === "plot"}
              />
              <div className="flex-1">
                <Label
                  htmlFor="has_rental_income"
                  className="text-sm font-medium text-gray-700"
                >
                  Has Rental Income
                </Label>
                <p className="text-xs text-gray-500">
                  Enable if this project offers rental income opportunities
                </p>
              </div>
            </div>
            {(propertyType === "plot") && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Rental income is not available for plot and land properties
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Images Upload */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Project Images
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload project images (JPG, PNG, JPEG, GIF, WEBP) - Max 10MB each
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="images"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload images</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG, GIF, WEBP (Max 10MB each)
                    </p>
                  </div>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {selectedImages.map((file, index) => (
                    <div
                      key={index}
                      className="relative group bg-gray-100 rounded-lg p-2 border"
                    >
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        title="Remove this image"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Brochures Upload */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Project Brochures
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload project brochures (PDF, JPG, PNG) - Max 20MB each
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="brochures"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload brochures</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG  (Max 20MB each)
                    </p>
                  </div>
                  <Input
                    id="brochures"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleBrochureSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedBrochures.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedBrochures.map((file, index) => (
                      <div
                        key={index}
                        className="relative group bg-gray-100 rounded-lg p-3 border"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Type: {file.type.split('/').pop()?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeBrochure(index)}
                          title="Remove this brochure"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {selectedBrochures.length > 0 && (
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {selectedBrochures.length} brochure{selectedBrochures.length !== 1 ? 's' : ''} selected. 
                        They will be uploaded along with the project.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                reset();
                setSelectedImages([]);
                setSelectedBrochures([]);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}