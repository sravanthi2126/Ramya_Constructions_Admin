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
import { X, Upload, AlertCircle, FileText } from "lucide-react";
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
  property_type: "commercial" | "residential" | "plot";
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
  is_active: boolean;
  gst_percentage?: number;
  gst_type?: "inclusive" | "exclusive";
}

// Helper function to extract image URL
const extractImageUrl = (image: any): string => {
  if (!image) return "";
  
  if (typeof image === 'string') {
    return image;
  }
  
  if (typeof image === 'object') {
    if (image.url) {
      if (typeof image.url === 'string') {
        return image.url;
      }
      if (typeof image.url === 'object' && image.url.file_path) {
        return image.url.file_path;
      }
    }
    
    if (image.file_path) {
      return image.file_path;
    }
    
    return image.image_url || image.src || image.location || "";
  }
  
  return "";
};

// Helper to extract filename from URL
const getFilenameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').pop() || `image_${Date.now()}`;
  } catch {
    return `image_${Date.now()}`;
  }
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get file icon
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
    is_active: true,
    gst_percentage: 18,
    gst_type: "inclusive",
  });
console.log("formadata",formData)
  const [existingImages, setExistingImages] = useState<
    Array<{ url: string; filename: string; originalData: any; id?: string }>
  >([]);
  const [existingBrochures, setExistingBrochures] = useState<
    Array<{ url: string; filename: string; type: string; id?: string }>
  >([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newBrochures, setNewBrochures] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [brochuresToDelete, setBrochuresToDelete] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Process project data whenever project changes or dialog opens
useEffect(() => {
  if (project && isOpen) {
    console.log("=== EDITING PROJECT ===");
    console.log("Project ID:", project.id);
    console.log("Project is_active from API:", project.is_active);
    console.log("Raw gallery_images:", project.gallery_images);
    console.log("Raw brochure:", project.brochure);

    // Reset form data - USE BACKEND FIELD NAMES
    setFormData({
      title: project.title || "",
      location: project.location || "",
      description: project.description || "",
      long_description: project.long_description || "",
      status: project.status || "available",
      base_price: project.base_price || 0,
      property_type: project.property_type || "commercial",
      total_units: project.total_units || 0, // CHANGED: total_sqft -> total_units
      available_units: project.available_units || 0, // CHANGED: available_sqft -> available_units
      sold_units: project.sold_units || 0, // CHANGED: sold_sqft -> sold_units
      reserved_units: project.reserved_sqft || 0, // CHANGED: reserved_sqft -> reserved_units
      rera_number: project.rera_number || "",
      has_rental_income: project.has_rental_income || false,
      website_url: project.website_url || "",
      floor_number: project.floor_number || 1,
      project_code: project.project_code || "",
      building_permission: project.building_permission || "",
      is_active: project.is_active ?? true, // THIS SHOULD COME FROM BACKEND
      gst_percentage: project.gst_percentage || 18,
      gst_type: project.gst_type || "inclusive",
    });

    console.log("Form data set - is_active:", project.is_active ?? true);
      // Process gallery images
      const processedImages: Array<{ url: string; filename: string; id: string }> = [];

      if (project.gallery_images && Array.isArray(project.gallery_images)) {
        project.gallery_images.forEach((img: any, index: number) => {
          const imageUrl = extractImageUrl(img);
          if (imageUrl && imageUrl.trim() !== '') {
            processedImages.push({
              url: imageUrl,
              filename: getFilenameFromUrl(imageUrl),
              id: imageUrl
            });
          }
        });
      }

      console.log("Processed images:", processedImages.length, processedImages);
      
      // Process brochures
      const processedBrochures: Array<{ url: string; filename: string; type: string; id: string }> = [];
      
      if (project.brochure && Array.isArray(project.brochure)) {
        project.brochure.forEach((brochure: any, index: number) => {
          const brochureUrl = extractImageUrl(brochure);
          if (brochureUrl && brochureUrl.trim() !== '') {
            processedBrochures.push({
              url: brochureUrl,
              filename: brochure.filename || getFilenameFromUrl(brochureUrl),
              type: brochure.type || "application/pdf",
              id: brochureUrl
            });
          }
        });
      }
      
      console.log("Processed brochures:", processedBrochures.length, processedBrochures);

      // CRITICAL: Reset all image-related states
      setExistingImages(processedImages);
      setExistingBrochures(processedBrochures);
      setImagesToDelete([]);
      setBrochuresToDelete([]);
      setNewImages([]);
      setNewBrochures([]);
    }
  }, [project, isOpen]);

  // Additional useEffect to handle dialog close
  useEffect(() => {
    if (!isOpen) {
      // Reset all states when dialog closes
      setNewImages([]);
      setNewBrochures([]);
      setImagesToDelete([]);
      setBrochuresToDelete([]);
      setExistingImages([]);
      setExistingBrochures([]);
    }
  }, [isOpen]);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Prepare the form data
    const formDataToSend = new FormData();
    
    // 1. Prepare the project JSON data - Use correct field names matching backend
    const projectUpdateData: any = {
      title: formData.title,
      location: formData.location,
      description: formData.description,
      long_description: formData.long_description,
      status: formData.status,
      base_price: formData.base_price,
      property_type: formData.property_type,
      // Unit fields - ensure they're valid numbers
      total_sqft: formData.total_units > 0 ? formData.total_units : undefined,
      available_sqft: formData.available_units >= 0 ? formData.available_units : undefined,
      sold_sqft: formData.sold_units >= 0 ? formData.sold_units : undefined,
      reserved_sqft: formData.reserved_units >= 0 ? formData.reserved_units : undefined,
      rera_number: formData.rera_number,
      has_rental_income: formData.has_rental_income,
      website_url: formData.website_url,
      floor_number: formData.floor_number,
      project_code: formData.project_code,
      building_permission: formData.building_permission,
      is_active: formData.is_active,
      gst_percentage: formData.gst_percentage,
      gst_type: formData.gst_type,
      // Send URLs to delete
      images_to_remove: imagesToDelete,
      brochures_to_remove: brochuresToDelete,
    };

    // ALWAYS send gallery_images and brochure — even if empty arrays
const filteredGalleryImages = existingImages
  .filter(img => !imagesToDelete.includes(img.url))
  .map(img => ({
    url: { file_path: img.url },
    filename: img.filename
  }));

const filteredBrochures = existingBrochures
  .filter(brochure => !brochuresToDelete.includes(brochure.url))
  .map(brochure => ({
    url: { file_path: brochure.url },
    filename: brochure.filename,
    type: brochure.type || "application/pdf"
  }));

// CRITICAL: Always include these fields (can be empty arrays)
projectUpdateData.gallery_images = filteredGalleryImages;
projectUpdateData.brochure = filteredBrochures;
    // Remove undefined/null values
    const cleanedProjectUpdateData = Object.fromEntries(
      Object.entries(projectUpdateData).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    console.log('=== UPDATE SUBMISSION ===');
    console.log('Project ID:', project.id);
    console.log('Original formData:', formData);
    console.log('Cleaned projectUpdateData:', cleanedProjectUpdateData);
    console.log('total_sqft value:', cleanedProjectUpdateData.total_sqft);
    
    // 2. Append the project data as JSON string with field name "request"
    formDataToSend.append('request', JSON.stringify(cleanedProjectUpdateData));
    
    // 3. Debug: Log what's in FormData
    console.log('FormData entries:');
    for (let pair of formDataToSend.entries()) {
      if (pair[0] === 'request') {
        try {
          console.log(pair[0], JSON.parse(pair[1] as string));
        } catch (e) {
          console.log(pair[0], pair[1]);
        }
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    
    // 4. Append new images
    console.log('New images to upload:', newImages.length);
    newImages.forEach((file, index) => {
      console.log(`Image ${index}:`, file.name, file.size, file.type);
      formDataToSend.append('images', file);
    });

    // 5. Append new brochures
    console.log('New brochures to upload:', newBrochures.length);
    newBrochures.forEach((file, index) => {
      console.log(`Brochure ${index}:`, file.name, file.size, file.type);
      formDataToSend.append('brochures', file);
    });

    // 6. Call API with FormData
    console.log('Calling updateProject API...');
    const response = await projectApi.updateProject(project.id, formDataToSend);
    
    console.log('Update response:', response);
    console.log('Response message:', response.message);
    
    if (response.data) {
      console.log('Updated project data:', response.data);
      console.log('Updated is_active:', response.data.is_active);
      console.log('Updated total_sqft:', response.data.total_sqft);
    }

    toast({
      title: "✅ Project Updated",
      description: "Project has been successfully updated.",
      className: "bg-green-50 border-green-200 text-green-800",
    });

    // IMPORTANT: Reset all states before closing
    setNewImages([]);
    setNewBrochures([]);
    setImagesToDelete([]);
    setBrochuresToDelete([]);
    setExistingImages([]);
    setExistingBrochures([]);
    
    // Close dialog and trigger parent refresh
    onSuccess();
    
  } catch (error: any) {
    console.error("Error updating project:", error);
    
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    let errorMessage = "Failed to update project. Please try again.";
    
    if (error.detail) {
      errorMessage = error.detail;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    toast({
      title: "❌ Update Failed",
      description: errorMessage,
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
    event.target.value = '';
  };

  const handleNewBrochureSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setNewBrochures((prev) => [...prev, ...Array.from(files)]);
    }
    event.target.value = '';
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewBrochure = (index: number) => {
    setNewBrochures((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageUrl: string) => {
    console.log('Marking image for deletion:', imageUrl);
    setImagesToDelete((prev) => {
      if (!prev.includes(imageUrl)) {
        const newList = [...prev, imageUrl];
        console.log('New image deletion list:', newList);
        return newList;
      }
      return prev;
    });
  };

  const markBrochureForDeletion = (brochureUrl: string) => {
    console.log('Marking brochure for deletion:', brochureUrl);
    setBrochuresToDelete((prev) => {
      if (!prev.includes(brochureUrl)) {
        const newList = [...prev, brochureUrl];
        console.log('New brochure deletion list:', newList);
        return newList;
      }
      return prev;
    });
  };

  const restoreImage = (imageUrl: string) => {
    console.log('Restoring image:', imageUrl);
    setImagesToDelete((prev) => {
      const newList = prev.filter((url) => url !== imageUrl);
      console.log('Updated image deletion list:', newList);
      return newList;
    });
  };

  const restoreBrochure = (brochureUrl: string) => {
    console.log('Restoring brochure:', brochureUrl);
    setBrochuresToDelete((prev) => {
      const newList = prev.filter((url) => url !== brochureUrl);
      console.log('Updated brochure deletion list:', newList);
      return newList;
    });
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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter existing images to show only those not marked for deletion
  const visibleExistingImages = existingImages.filter(img => 
    !imagesToDelete.includes(img.url)
  );

  const visibleExistingBrochures = existingBrochures.filter(brochure =>
    !brochuresToDelete.includes(brochure.url)
  );

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = '';
    
    const parent = target.parentElement;
    if (parent) {
      parent.classList.add('bg-gray-100');
      parent.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="text-xs text-gray-500">Image not found</span>
        </div>
      `;
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setNewImages([]);
    setNewBrochures([]);
    setImagesToDelete([]);
    setBrochuresToDelete([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                    handleChange("floor_number", parseInt(e.target.value) || 1)
                  }
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gst_percentage">GST Percentage</Label>
                <Input
                  id="gst_percentage"
                  type="number"
                  step="0.01"
                  value={formData.gst_percentage || ""}
                  onChange={(e) =>
                    handleChange("gst_percentage", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  max="100"
                  placeholder="18"
                />
                <p className="text-xs text-gray-500">GST percentage for this project</p>
              </div>

              <div className="space-y-2">
                <Label>GST Type</Label>
                <Select
                  value={formData.gst_type || "inclusive"}
                  onValueChange={(value) => handleChange("gst_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST type" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white shadow-lg">
                    <SelectItem value="include">Inclusive</SelectItem>
                    <SelectItem value="exclude">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Whether GST is inclusive or exclusive of price</p>
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
                  <SelectContent className="z-50 bg-white shadow-lg">
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
                  <SelectContent className="z-50 bg-white shadow-lg">
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
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
                    handleChange("base_price", parseFloat(e.target.value) || 0)
                  }
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_units">Total Sqft *</Label>
                <Input
                  id="total_units"
                  type="number"
                  value={formData.total_units}
                  onChange={(e) =>
                    handleChange("total_units", parseInt(e.target.value))
                  }
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_units">Available Sqft *</Label>
                <Input
                  id="available_units"
                  type="number"
                  value={formData.available_units}
                  onChange={(e) =>
                    handleChange("available_units", parseInt(e.target.value))
                  }
                  required
                  min="0"
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
                  formData.property_type === "plot"
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

            {(formData.property_type === "plot") && (
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

            {/* Images marked for deletion */}
            {imagesToDelete.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {imagesToDelete.length} image{imagesToDelete.length !== 1 ? 's' : ''} marked for deletion.
                  <Button
                    type="button"
                    variant="link"
                    className="ml-2 h-auto p-0 text-amber-800 hover:text-amber-900"
                    onClick={() => setImagesToDelete([])}
                  >
                    Restore all
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Existing Images */}
            {visibleExistingImages.length > 0 ? (
              <div className="space-y-3">
                <Label>Existing Images ({visibleExistingImages.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {visibleExistingImages.map((image, index) => (
                    <div
                      key={image.id || index}
                      className="relative group rounded-lg p-2 border border-gray-200 bg-gray-50"
                    >
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          src={image.url}
                          alt={`Project image ${index + 1}`}
                          className="object-cover w-full h-full"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="mt-2">
                        {/* <p className="text-xs font-medium text-gray-700 truncate">
                          {image.filename}
                        </p> */}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => markImageForDeletion(image.url)}
                        title="Delete this image"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No images available for this project.
                </AlertDescription>
              </Alert>
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
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
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
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
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

          {/* Brochures Management */}
          <div className="space-y-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Project Brochures
            </h3>

            {/* Brochures marked for deletion */}
            {brochuresToDelete.length > 0 && (
              <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {brochuresToDelete.length} brochure{brochuresToDelete.length !== 1 ? 's' : ''} marked for deletion.
                  <Button
                    type="button"
                    variant="link"
                    className="ml-2 h-auto p-0 text-amber-800 hover:text-amber-900"
                    onClick={() => setBrochuresToDelete([])}
                  >
                    Restore all
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Existing Brochures */}
            {visibleExistingBrochures.length > 0 ? (
              <div className="space-y-3">
                <Label>Existing Brochures ({visibleExistingBrochures.length})</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleExistingBrochures.map((brochure, index) => (
                    <div
                      key={brochure.id || index}
                      className="relative group rounded-lg p-3 border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getFileIcon(brochure.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {brochure.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {brochure.type.split('/').pop()?.toUpperCase()}
                          </p>
                          <a
                            href={brochure.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 inline-block"
                          >
                            View Brochure
                          </a>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => markBrochureForDeletion(brochure.url)}
                        title="Delete this brochure"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No brochures available for this project.
                </AlertDescription>
              </Alert>
            )}

            {/* Add New Brochures */}
            <div className="space-y-3">
              <Label>Add New Brochures</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="new-brochures"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileText className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload brochures</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 20MB each)
                    </p>
                  </div>
                  <Input
                    id="new-brochures"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleNewBrochureSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {newBrochures.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {newBrochures.map((file, index) => (
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
                          onClick={() => removeNewBrochure(index)}
                          title="Remove this brochure"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {newBrochures.length > 0 && (
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        {newBrochures.length} brochure{newBrochures.length !== 1 ? 's' : ''} selected for upload.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active / Inactive Toggle */}
          <div className="p-4 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange("is_active", checked)}
              />
              <div>
                <Label className="text-sm font-medium">
                  Project Active Status
                </Label>
                <p className="text-xs text-gray-500">
                  Toggle to activate or deactivate this project
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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