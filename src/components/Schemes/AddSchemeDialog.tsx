import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  schemeApi,
  CreateSchemeRequest,
  projectApi,
  Project,
} from "@/api/apiService.ts";

interface SchemeFormData {
  project_id: string;
  scheme_type: "single_payment" | "installment";
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days?: number;
  total_installments?: number;
  monthly_installment_amount?: number;
  rental_start_month: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export function AddSchemeDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [schemeType, setSchemeType] = useState<
    "single_payment" | "installment"
  >("single_payment");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SchemeFormData>({
    defaultValues: {
      scheme_type: "single_payment",
      is_active: true,
      rental_start_month: 1,
    },
  });

  // Watch scheme type to handle conditional fields
  const watchedSchemeType = watch("scheme_type");

  useEffect(() => {
    setSchemeType(watchedSchemeType);
  }, [watchedSchemeType]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (isOpen) {
        setIsLoading(true);
        try {
          const response = await projectApi.getAllProjects();
          setProjects(response.projects || []);
        } catch (err: any) {
          toast({
            title: "Error",
            description: "Failed to load projects",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
  }, [isOpen, toast]);

  const onSubmit = async (formData: SchemeFormData) => {
    try {
      // Prepare data based on scheme type
      const requestData: CreateSchemeRequest = {
        project_id: formData.project_id,
        scheme_type: formData.scheme_type,
        scheme_name: formData.scheme_name,
        area_sqft: Number(formData.area_sqft),
        booking_advance: Number(formData.booking_advance),
        rental_start_month: Number(formData.rental_start_month),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        // Conditional fields
        balance_payment_days:
          formData.scheme_type === "single_payment"
            ? Number(formData.balance_payment_days)
            : null,
        total_installments:
          formData.scheme_type === "installment"
            ? Number(formData.total_installments)
            : null,
        monthly_installment_amount:
          formData.scheme_type === "installment"
            ? Number(formData.monthly_installment_amount)
            : null,
      };

      await schemeApi.createScheme(requestData);

      toast({
        title: "Success!",
        description: "New investment scheme has been created successfully.",
        variant: "default",
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating scheme:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create scheme. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm transition-all duration-200">
          <Plus className="w-4 h-4" />
          Add New Scheme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white rounded-lg shadow-xl">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <DialogTitle className="text-xl font-bold text-gray-900">
            Add New Investment Scheme
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Create a new payment plan for your project
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="scheme_name"
                  className="text-sm font-medium text-gray-700"
                >
                  Scheme Name *
                </Label>
                <Input
                  id="scheme_name"
                  {...register("scheme_name", {
                    required: "Scheme name is required",
                    minLength: {
                      value: 2,
                      message: "Scheme name must be at least 2 characters",
                    },
                  })}
                  placeholder="Enter scheme name"
                  className={`border-gray-300 focus:border-blue-500 ${
                    errors.scheme_name
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.scheme_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.scheme_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Project *
                </Label>
                <Select
                  onValueChange={(value) => setValue("project_id", value)}
                >
                  <SelectTrigger
                    className={`border-gray-300 focus:border-blue-500 ${
                      errors.project_id
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg max-h-60">
                    {isLoading ? (
                      <div className="p-2 text-center text-gray-500">
                        Loading projects...
                      </div>
                    ) : projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="focus:bg-gray-50"
                        >
                          {project.title}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">
                        No projects found
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.project_id && (
                  <p className="text-sm text-red-600 mt-1">
                    Please select a project
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scheme Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-purple-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Scheme Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Scheme Type *
                </Label>
                <Select
                  defaultValue="single_payment"
                  onValueChange={(value: "single_payment" | "installment") => {
                    setValue("scheme_type", value);
                    setSchemeType(value);
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
                    <SelectValue placeholder="Select scheme type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="single_payment">
                      💰 Single Payment
                    </SelectItem>
                    <SelectItem value="installment">
                      📅 Installment Plan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="area_sqft"
                  className="text-sm font-medium text-gray-700"
                >
                  Area (Sqft) *
                </Label>
                <Input
                  id="area_sqft"
                  type="number"
                  {...register("area_sqft", {
                    required: "Area is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Area must be greater than 0" },
                  })}
                  placeholder="Enter area in sqft"
                  className={`border-gray-300 focus:border-blue-500 ${
                    errors.area_sqft
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.area_sqft && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.area_sqft.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="booking_advance"
                  className="text-sm font-medium text-gray-700"
                >
                  Booking Advance (₹) *
                </Label>
                <Input
                  id="booking_advance"
                  type="number"
                  {...register("booking_advance", {
                    required: "Booking advance is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Amount must be greater than 0" },
                  })}
                  placeholder="Enter booking advance"
                  className={`border-gray-300 focus:border-blue-500 ${
                    errors.booking_advance
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.booking_advance && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.booking_advance.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="rental_start_month"
                  className="text-sm font-medium text-gray-700"
                >
                  Rental Start Month *
                </Label>
                <Input
                  id="rental_start_month"
                  type="number"
                  {...register("rental_start_month", {
                    required: "Rental start month is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Month must be at least 1" },
                    max: { value: 12, message: "Month must be at most 12" },
                  })}
                  placeholder="Enter rental start month"
                  className={`border-gray-300 focus:border-blue-500 ${
                    errors.rental_start_month
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.rental_start_month && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.rental_start_month.message}
                  </p>
                )}
              </div>
            </div>

            {/* Conditional Fields */}
            {schemeType === "single_payment" && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label
                  htmlFor="balance_payment_days"
                  className="text-sm font-medium text-gray-700"
                >
                  Balance Payment Days *
                </Label>
                <Input
                  id="balance_payment_days"
                  type="number"
                  {...register("balance_payment_days", {
                    required:
                      "Balance payment days are required for single payment",
                    valueAsNumber: true,
                    min: { value: 1, message: "Days must be at least 1" },
                  })}
                  placeholder="Enter balance payment days"
                  className={`border-blue-300 focus:border-blue-500 ${
                    errors.balance_payment_days
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.balance_payment_days && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.balance_payment_days.message}
                  </p>
                )}
              </div>
            )}

            {schemeType === "installment" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <Label
                    htmlFor="total_installments"
                    className="text-sm font-medium text-gray-700"
                  >
                    Total Installments *
                  </Label>
                  <Input
                    id="total_installments"
                    type="number"
                    {...register("total_installments", {
                      required: "Total installments are required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Installments must be at least 1",
                      },
                    })}
                    placeholder="Enter total installments"
                    className={`border-purple-300 focus:border-purple-500 ${
                      errors.total_installments
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {errors.total_installments && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.total_installments.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="monthly_installment_amount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Monthly Installment (₹) *
                  </Label>
                  <Input
                    id="monthly_installment_amount"
                    type="number"
                    {...register("monthly_installment_amount", {
                      required: "Monthly installment amount is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Amount must be greater than 0",
                      },
                    })}
                    placeholder="Enter monthly installment amount"
                    className={`border-purple-300 focus:border-purple-500 ${
                      errors.monthly_installment_amount
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  {errors.monthly_installment_amount && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.monthly_installment_amount.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dates & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-1 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Dates & Status
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="start_date"
                  className="text-sm font-medium text-gray-700"
                >
                  Start Date *
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date", {
                    required: "Start date is required",
                  })}
                  className={`border-gray-300 focus:border-blue-500 ${
                    errors.start_date
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="end_date"
                  className="text-sm font-medium text-gray-700"
                >
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Switch
                id="is_active"
                defaultChecked={true}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label
                htmlFor="is_active"
                className="font-medium cursor-pointer text-gray-700"
              >
                Active Scheme
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="px-6 border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Scheme"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
