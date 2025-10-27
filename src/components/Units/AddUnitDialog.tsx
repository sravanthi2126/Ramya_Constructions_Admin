import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, X, User, AlertCircle, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { purchasedUnitApi } from "@/api/apiService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitFormData {
  project_id: string;
  scheme_id: string;
  is_joint_ownership: boolean;
  number_of_units: number;
}

interface JointOwnerForm {
  user_profile_id: string;
  relation: string;
  share_percentage?: number;
}

interface ProjectOption {
  id: string;
  title: string;
}

interface SchemeOption {
  id: string;
  scheme_name: string;
}

interface AddUnitDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddUnitDialog({ onSuccess, children }: AddUnitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jointOwners, setJointOwners] = useState<JointOwnerForm[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [schemes, setSchemes] = useState<SchemeOption[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UnitFormData>({
    defaultValues: {
      is_joint_ownership: false,
      number_of_units: 1,
    },
  });

  const isJointOwnership = watch("is_joint_ownership");
  const selectedProjectId = watch("project_id");

  // Fetch projects when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Fetch schemes when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchSchemes(selectedProjectId);
    } else {
      setSchemes([]);
      setValue("scheme_id", "");
    }
  }, [selectedProjectId, setValue]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await purchasedUnitApi.getProjectsForDropdown();
      setProjects(projectsData);
    } catch (error: any) {
      toast({
        title: "❌ Error Loading Projects",
        description: error.detail || "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchSchemes = async (projectId: string) => {
    setLoadingSchemes(true);
    try {
      const schemesData = await purchasedUnitApi.getSchemesForDropdown(
        projectId
      );
      setSchemes(schemesData);
    } catch (error: any) {
      toast({
        title: "❌ Error Loading Schemes",
        description:
          error.detail || "Failed to load schemes for selected project",
        variant: "destructive",
      });
    } finally {
      setLoadingSchemes(false);
    }
  };

  const addJointOwner = () => {
    setJointOwners([...jointOwners, { user_profile_id: "", relation: "" }]);
  };

  const removeJointOwner = (index: number) => {
    setJointOwners(jointOwners.filter((_, i) => i !== index));
  };

  const updateJointOwner = (
    index: number,
    field: keyof JointOwnerForm,
    value: string
  ) => {
    const updated = [...jointOwners];
    updated[index] = { ...updated[index], [field]: value };
    setJointOwners(updated);
  };

  const onSubmit = async (data: UnitFormData) => {
    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        joint_owners: isJointOwnership ? jointOwners : undefined,
      };

      const response = await purchasedUnitApi.create(submitData);

      toast({
        title: "✅ Unit Created Successfully",
        description:
          response.message || "New unit has been successfully created.",
        className: "bg-green-50 border-green-200 text-green-800",
      });

      reset();
      setJointOwners([]);
      setSchemes([]);
      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating unit:", error);
      toast({
        title: "❌ Error Creating Unit",
        description: error.detail || "Failed to create unit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      reset();
      setJointOwners([]);
      setSchemes([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add New Unit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>

            {/* Project Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Project *
              </Label>
              <Select
                value={watch("project_id")}
                onValueChange={(value) => setValue("project_id", value)}
              >
                <SelectTrigger
                  className={errors.project_id ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      loadingProjects
                        ? "Loading projects..."
                        : "Select a project"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project_id && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.project_id.message}
                </div>
              )}
              {loadingProjects && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading projects...
                </div>
              )}
            </div>

            {/* Scheme Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Scheme *
              </Label>
              <Select
                value={watch("scheme_id")}
                onValueChange={(value) => setValue("scheme_id", value)}
                disabled={!selectedProjectId || loadingSchemes}
              >
                <SelectTrigger
                  className={errors.scheme_id ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={
                      !selectedProjectId
                        ? "Select a project first"
                        : loadingSchemes
                        ? "Loading schemes..."
                        : "Select a scheme"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {schemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      {scheme.scheme_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.scheme_id && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.scheme_id.message}
                </div>
              )}
              {loadingSchemes && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading schemes...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="number_of_units"
                className="text-sm font-medium text-gray-700"
              >
                Number of Units *
              </Label>
              <Input
                id="number_of_units"
                type="number"
                {...register("number_of_units", {
                  required: "Number of units is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Must have at least 1 unit" },
                })}
                className={errors.number_of_units ? "border-red-500" : ""}
              />
              {errors.number_of_units && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.number_of_units.message}
                </div>
              )}
            </div>
          </div>

          {/* Ownership Type */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50">
              <Switch
                id="is_joint_ownership"
                checked={isJointOwnership}
                onCheckedChange={(checked) =>
                  setValue("is_joint_ownership", checked)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="is_joint_ownership"
                  className="text-sm font-medium text-gray-700"
                >
                  Joint Ownership
                </Label>
                <p className="text-xs text-gray-500">
                  Enable if this unit has multiple owners
                </p>
              </div>
            </div>
          </div>

          {/* Joint Owners */}
          {isJointOwnership && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Joint Owners
                </h3>
                <Button
                  type="button"
                  onClick={addJointOwner}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <User className="w-4 h-4" />
                  Add Owner
                </Button>
              </div>

              <div className="space-y-4">
                {jointOwners.map((owner, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">
                        Owner {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeJointOwner(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          User Profile ID *
                        </Label>
                        <Input
                          value={owner.user_profile_id}
                          onChange={(e) =>
                            updateJointOwner(
                              index,
                              "user_profile_id",
                              e.target.value
                            )
                          }
                          placeholder="Enter user profile ID"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Relation *
                        </Label>
                        <Select
                          value={owner.relation}
                          onValueChange={(value) =>
                            updateJointOwner(index, "relation", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="son">Son</SelectItem>
                            <SelectItem value="daughter">Daughter</SelectItem>
                            <SelectItem value="brother">Brother</SelectItem>
                            <SelectItem value="sister">Sister</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Share Percentage
                      </Label>
                      <Input
                        type="number"
                        value={owner.share_percentage || ""}
                        onChange={(e) =>
                          updateJointOwner(
                            index,
                            "share_percentage",
                            e.target.value
                          )
                        }
                        placeholder="Enter share percentage"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || !watch("project_id") || !watch("scheme_id")
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Unit...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
