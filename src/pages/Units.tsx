import { useState, useEffect } from "react";
import {
  Eye,
  Search,
  X,
  Plus,
  Filter,
  Download,
  Building,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  purchasedUnitApi,
  projectApi,
  schemeApi,
  legalAgreementsApi,
  LegalAgreement,
  CreateLegalAgreementRequest,
  UpdateLegalAgreementRequest,
} from "@/api/apiService";
import { PurchasedUnit, Project, Scheme } from "@/types/admin";
import { UnitDetailsModal } from "@/components/Units/UnitDetailsModal";
import { AddUnitDialog } from "@/components/Units/AddUnitDialog";

// Legal Agreements Dialog Component
const LegalAgreementsDialog = ({
  unit,
  isOpen,
  onClose,
}: {
  unit: PurchasedUnit;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [agreements, setAgreements] = useState<LegalAgreement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] =
    useState<LegalAgreement | null>(null);
  const { toast } = useToast();

  const fetchAgreements = async () => {
    if (!unit?.id) return;

    setIsLoading(true);
    try {
      const response = await legalAgreementsApi.getAgreementsByUnitId(unit.id);
      if (response.success && response.data) {
        setAgreements(response.data);
      } else {
        setAgreements([]);
      }
    } catch (error: any) {
      console.error("Error fetching agreements:", error);
      toast({
        title: "Error Loading Agreements",
        description:
          error.detail || error.message || "Failed to fetch agreements",
        variant: "destructive",
      });
      setAgreements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && unit?.id) {
      fetchAgreements();
    }
  }, [isOpen, unit?.id]);

  const handleCreateAgreement = () => {
    setSelectedAgreement(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditAgreement = (agreement: LegalAgreement) => {
    setSelectedAgreement(agreement);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAgreement = (agreement: LegalAgreement) => {
    setSelectedAgreement(agreement);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAgreement) return;

    try {
      const response = await legalAgreementsApi.deleteAgreement(
        selectedAgreement.id
      );
      if (response.success) {
        toast({
          title: "Success",
          description: "Legal agreement deleted successfully",
        });
        fetchAgreements();
        setIsDeleteDialogOpen(false);
        setSelectedAgreement(null);
      } else {
        throw new Error(response.message || "Failed to delete agreement");
      }
    } catch (error: any) {
      console.error("Error deleting agreement:", error);
      toast({
        title: "Error",
        description:
          error.detail || error.message || "Failed to delete agreement",
        variant: "destructive",
      });
    }
  };

  const getAgreementTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      agreement_of_sale: "Agreement of Sale",
      sale_deed: "Sale Deed",
      lease_agreement: "Lease Agreement",
      rental_agreement: "Rental Agreement",
      allotment_letter: "Allotment Letter",
      possession_letter: "Possession Letter",
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "signed":
        return "bg-green-100 text-green-800";
      case "executed":
        return "bg-red-100 text-red-800";
      case "pending_signature":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Legal Agreements - {unit?.unit_number}</DialogTitle>
            <DialogDescription>
              Manage legal agreements for this unit. Create, view, update, or
              delete agreements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Legal Agreements ({agreements.length})
              </h3>
              <Button
                onClick={handleCreateAgreement}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Agreement
              </Button>
            </div>

            {/* Agreements List */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : agreements.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No legal agreements found
                </p>
                <Button onClick={handleCreateAgreement}>
                  Create First Agreement
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {agreements.map((agreement) => (
                  <Card key={agreement.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">
                            {getAgreementTypeDisplay(agreement.agreement_type)}
                          </h4>
                          <Badge className={getStatusColor(agreement.status)}>
                            {agreement.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Document:{" "}
                            </span>
                            <span className="font-medium">
                              {agreement.document_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Agreement Date:{" "}
                            </span>
                            <span className="font-medium">
                              {formatDate(agreement.agreement_date)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Valid Until:{" "}
                            </span>
                            <span className="font-medium">
                              {formatDate(agreement.valid_until)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Signatories:{" "}
                            </span>
                            <span className="font-medium">
                              {agreement.signatories.join(", ")}
                            </span>
                          </div>
                        </div>

                        {agreement.file_path && (
                          <div className="pt-2">
                            <a
                              href={agreement.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              View Document
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAgreement(agreement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAgreement(agreement)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Agreement Dialog */}
      <CreateEditLegalAgreementDialog
        unit={unit}
        agreement={selectedAgreement}
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedAgreement(null);
        }}
        onSuccess={() => {
          fetchAgreements();
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedAgreement(null);
        }}
        isEdit={isEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Legal Agreement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this legal agreement? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Create/Edit Legal Agreement Dialog Component
// Create/Edit Legal Agreement Dialog Component
const CreateEditLegalAgreementDialog = ({
  unit,
  agreement,
  isOpen,
  onClose,
  onSuccess,
  isEdit = false,
}: {
  unit: PurchasedUnit;
  agreement: LegalAgreement | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEdit?: boolean;
}) => {
  const [formData, setFormData] = useState({
    agreement_type: "agreement_of_sale",
    document_name: "",
    signatories: ["", ""],
    agreement_date: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "draft" as "signed" | "executed" | "draft" | "pending_signature",
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (agreement && isEdit) {
      setFormData({
        agreement_type: agreement.agreement_type,
        document_name: agreement.document_name,
        signatories: [...agreement.signatories],
        agreement_date: agreement.agreement_date.split("T")[0],
        valid_until: agreement.valid_until.split("T")[0],
        status: agreement.status as
          | "signed"
          | "executed"
          | "draft"
          | "pending_signature",
      });
    } else {
      setFormData({
        agreement_type: "agreement_of_sale",
        document_name: "",
        signatories: ["", ""],
        agreement_date: new Date().toISOString().split("T")[0],
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "draft",
      });
      setFile(null);
    }
  }, [agreement, isEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit?.id) return;

    // Validate required fields
    const validSignatories = formData.signatories.filter(
      (s) => s.trim() !== ""
    );
    if (validSignatories.length < 2) {
      toast({
        title: "Validation Error",
        description: "At least 2 signatories are required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.document_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Document name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requestData: CreateLegalAgreementRequest = {
        unit_id: unit.id,
        agreement_type: formData.agreement_type,
        document_name: formData.document_name,
        signatories: validSignatories,
        agreement_date: formData.agreement_date,
        valid_until: formData.valid_until,
        status: formData.status,
      };

      if (isEdit && agreement) {
        const response = await legalAgreementsApi.updateAgreement(
          agreement.id,
          requestData,
          file || undefined
        );
        if (response.success) {
          toast({
            title: "Success",
            description: "Legal agreement updated successfully",
          });
          onSuccess();
        } else {
          throw new Error(response.message || "Failed to update agreement");
        }
      } else {
        if (!file) {
          toast({
            title: "Error",
            description: "Please select a file",
            variant: "destructive",
          });
          return;
        }
        const response = await legalAgreementsApi.createAgreement(
          requestData,
          file
        );
        if (response.success) {
          toast({
            title: "Success",
            description: "Legal agreement created successfully",
          });
          onSuccess();
        } else {
          throw new Error(response.message || "Failed to create agreement");
        }
      }
    } catch (error: any) {
      console.error("Error saving agreement:", error);
      toast({
        title: "Error",
        description:
          error.detail || error.message || "Failed to save agreement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignatoryChange = (index: number, value: string) => {
    const newSignatories = [...formData.signatories];
    newSignatories[index] = value;
    setFormData((prev) => ({ ...prev, signatories: newSignatories }));
  };

  const addSignatory = () => {
    setFormData((prev) => ({
      ...prev,
      signatories: [...prev.signatories, ""],
    }));
  };

  const removeSignatory = (index: number) => {
    if (formData.signatories.length <= 2) return;
    const newSignatories = formData.signatories.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, signatories: newSignatories }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {isEdit ? "Edit Legal Agreement" : "Create Legal Agreement"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEdit
              ? "Update the legal agreement details for this unit."
              : "Fill in the details below to create a new legal agreement."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Agreement Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.agreement_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, agreement_type: value }))
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10">
                    <SelectValue placeholder="Select agreement type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="agreement_of_sale" className="py-2">
                      Agreement of Sale
                    </SelectItem>
                    <SelectItem value="sale_deed" className="py-2">
                      sale_deed
                    </SelectItem>
                    <SelectItem value="rental_agreement" className="py-2">
                      rental_agreement
                    </SelectItem>
                    <SelectItem value="allotment_letter" className="py-2">
                      allotment_letter
                    </SelectItem>
                    <SelectItem value="possession_letter" className="py-2">
                      possession_letter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as any }))
                  }
                  required
                >
                  <SelectTrigger className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="draft" className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value="signed" className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        signed
                      </div>
                    </SelectItem>
                    <SelectItem value="executed" className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        executed
                      </div>
                    </SelectItem>
                    <SelectItem value="pending_signature" className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        pending_signature
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                Document Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.document_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    document_name: e.target.value,
                  }))
                }
                placeholder="Enter document name (e.g., Sale Agreement - Unit 101)"
                className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Agreement Dates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Agreement Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={formData.agreement_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agreement_date: e.target.value,
                    }))
                  }
                  className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Valid Until <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={formData.valid_until}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      valid_until: e.target.value,
                    }))
                  }
                  className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Signatories Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium text-gray-900">Signatories</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Minimum 2 required
              </span>
            </div>

            <div className="space-y-3">
              {formData.signatories.map((signatory, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1">
                    <label className="text-sm text-gray-600">
                      Signatory {index + 1}
                      {index < 2 && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <Input
                      placeholder={`Enter signatory ${index + 1} name`}
                      value={signatory}
                      onChange={(e) =>
                        handleSignatoryChange(index, e.target.value)
                      }
                      required={index < 2}
                      className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {formData.signatories.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSignatory(index)}
                      className="mt-6 text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addSignatory}
              className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Signatory
            </Button>

            {formData.signatories.filter((s) => s.trim() !== "").length < 2 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    At least 2 signatories are required for the agreement to be
                    valid.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Document Upload
            </h3>

            {!isEdit ? (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Document File <span className="text-red-500">*</span>
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Upload your document
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Supported formats: PDF, JPG, PNG, DOC, DOCX
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                        className="hidden"
                      />
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-block">
                        Choose File
                      </div>
                    </label>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-green-800">
                        {file.name}
                      </span>
                      <span className="text-xs text-green-600 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Update Document (Optional)
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Update document (optional)
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Leave empty to keep the current document
                    </p>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors inline-block">
                        Choose New File
                      </div>
                    </label>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-blue-800">
                        {file.name}
                      </span>
                      <span className="text-xs text-blue-600 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEdit ? "Updating..." : "Creating..."}
                </div>
              ) : isEdit ? (
                "Update Agreement"
              ) : (
                "Create Agreement"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Units Component with Legal Agreements Integration
export default function Units() {
  const [units, setUnits] = useState<PurchasedUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<PurchasedUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<PurchasedUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLegalAgreementsOpen, setIsLegalAgreementsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ownershipFilter, setOwnershipFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "byUser" | "byUnit">(
    "all"
  );
  const [userId, setUserId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [schemeMap, setSchemeMap] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Fetch projects and schemes for mapping IDs to names
  const fetchMappings = async () => {
    try {
      const [projectsResponse, schemesResponse] = await Promise.all([
        projectApi.getAllProjects(1, 100),
        schemeApi.getAllSchemes(undefined, 1, 100),
      ]);

      // Create project ID to name mapping
      const projectMapping: Record<string, string> = {};
      projectsResponse.projects.forEach((project) => {
        projectMapping[project.id] = project.title;
      });

      // Create scheme ID to name mapping
      const schemeMapping: Record<string, string> = {};
      schemesResponse.schemes.forEach((scheme) => {
        schemeMapping[scheme.id] = scheme.scheme_name;
      });

      setProjectMap(projectMapping);
      setSchemeMap(schemeMapping);
    } catch (error) {
      console.error("Error fetching mappings:", error);
    }
  };

  const fetchAllUnits = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await purchasedUnitApi.getAll();
      setUnits(data);
      setFilteredUnits(data);
      await fetchMappings(); // Fetch mappings after units
    } catch (err: any) {
      const errorMessage = err.detail || err.message || "Failed to fetch units";
      setError(errorMessage);
      toast({
        title: "Error Loading Units",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserUnits = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await purchasedUnitApi.getByUserId(userId);
      setUnits(data);
      setFilteredUnits(data);
      await fetchMappings();
    } catch (err: any) {
      const errorMessage =
        err.detail || err.message || "Failed to fetch user units";
      setError(errorMessage);
      toast({
        title: "Error Loading User Units",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnitByNumber = async () => {
    if (!unitNumber) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await purchasedUnitApi.getByUnitNumber(unitNumber);
      setUnits([data]);
      setFilteredUnits([data]);
      await fetchMappings();
    } catch (err: any) {
      const errorMessage = err.detail || err.message || "Failed to fetch unit";
      setError(errorMessage);
      toast({
        title: "Error Loading Unit",
        description: errorMessage,
        variant: "destructive",
      });
      setUnits([]);
      setFilteredUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllUnits();
    }
  }, [activeTab]);

  useEffect(() => {
    let filtered = units;

    if (searchTerm) {
      filtered = filtered.filter(
        (unit) =>
          unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.payment_status
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          unit.unit_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          projectMap[unit.project_id]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schemeMap[unit.scheme_id]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (unit) => unit.payment_status === statusFilter
      );
    }

    if (ownershipFilter !== "all") {
      filtered = filtered.filter((unit) =>
        ownershipFilter === "joint"
          ? unit.is_joint_ownership
          : !unit.is_joint_ownership
      );
    }

    setFilteredUnits(filtered);
  }, [units, searchTerm, statusFilter, ownershipFilter, projectMap, schemeMap]);

  const handleTabChange = (tab: "all" | "byUser" | "byUnit") => {
    setActiveTab(tab);
    setUnits([]);
    setFilteredUnits([]);
    setSearchTerm("");
    setUserId("");
    setUnitNumber("");
    setStatusFilter("all");
    setOwnershipFilter("all");
  };

  const handleViewUnit = (unit: PurchasedUnit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleLegalAgreements = (unit: PurchasedUnit) => {
    setSelectedUnit(unit);
    setIsLegalAgreementsOpen(true);
  };

  const handleUnitAdded = () => {
    if (activeTab === "all") {
      fetchAllUnits();
    }
    toast({
      title: "✅ Success",
      description: "Unit created successfully",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setOwnershipFilter("all");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "none":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "advance_paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "partially_paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fully_paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "payment_ongoing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get project name from ID
  const getProjectName = (projectId: string) => {
    return projectMap[projectId] || projectId;
  };

  // Get scheme name from ID
  const getSchemeName = (schemeId: string) => {
    return schemeMap[schemeId] || schemeId;
  };

  // Loading Skeleton
  const UnitSkeleton = () => (
    <Card className="p-6">
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
        <div className="pt-4 border-t">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </Card>
  );

  if (isLoading && units.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <UnitSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Purchased Units
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage and view all purchased property units
        </p>
      </div>

      {/* Tabs and Controls */}
      <Card className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => handleTabChange("all")}
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All Units
              </button>
              <button
                onClick={() => handleTabChange("byUser")}
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "byUser"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                By User ID
              </button>
              <button
                onClick={() => handleTabChange("byUnit")}
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === "byUnit"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                By Unit Number
              </button>
            </nav>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by unit number, project, scheme, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 w-full"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Tab-specific inputs */}
            {activeTab === "byUser" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={fetchUserUnits}
                  disabled={!userId}
                  className="w-full sm:w-auto"
                >
                  Load Units
                </Button>
              </div>
            )}

            {activeTab === "byUnit" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Enter Unit Number"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={fetchUnitByNumber}
                  disabled={!unitNumber}
                  className="w-full sm:w-auto"
                >
                  Load Unit
                </Button>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="advance_paid">Advance Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={ownershipFilter}
                onValueChange={setOwnershipFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ownership Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single Ownership</SelectItem>
                  <SelectItem value="joint">Joint Ownership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchTerm ||
              statusFilter !== "all" ||
              ownershipFilter !== "all") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {error && units.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-800 text-sm">{error}</div>
        </div>
      )}

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredUnits.map((unit) => (
          <Card
            key={unit.id}
            className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 group"
          >
            <div className="space-y-4">
              {/* Header with Unit Number and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-base md:text-lg leading-tight truncate group-hover:text-primary transition-colors"
                    title={unit.unit_number}
                  >
                    {unit.unit_number}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>Floor {unit.floor_number}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge
                    className={`text-xs px-2 py-1 ${getStatusColor(
                      unit.payment_status
                    )}`}
                  >
                    {unit.payment_status.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge
                    className={`text-xs px-2 py-1 ${getStatusColor(
                      unit.unit_status
                    )}`}
                  >
                    {unit.unit_status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Unit Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Project:
                  </span>
                  <span
                    className="font-medium text-right max-w-[120px] truncate"
                    title={getProjectName(unit.project_id)}
                  >
                    {getProjectName(unit.project_id)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scheme:</span>
                  <span
                    className="font-medium text-right max-w-[120px] truncate"
                    title={getSchemeName(unit.scheme_id)}
                  >
                    {getSchemeName(unit.scheme_id)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Investment:
                  </span>
                  <span className="font-medium">
                    {formatCurrency(unit.total_investment)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">
                    {unit.total_area_sqft} sqft
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Rent:</span>
                  <span className="font-medium">
                    {formatCurrency(unit.monthly_rental)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paid/Balance:</span>
                  <span className="font-medium">
                    {formatCurrency(unit.user_paid)} /{" "}
                    {formatCurrency(unit.balance_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Ownership:
                  </span>
                  <span className="font-medium">
                    {unit.is_joint_ownership ? "Joint" : "Single"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Purchase:
                  </span>
                  <span>{formatDate(unit.purchase_date)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center mb-2"
                  onClick={() => handleViewUnit(unit)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center"
                  onClick={() => handleLegalAgreements(unit)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Legal Agreements
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredUnits.length === 0 && !isLoading && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <div className="text-muted-foreground mb-4 text-base md:text-lg">
            {units.length === 0
              ? "No purchased units found"
              : "No units match your filters"}
          </div>
          {units.length === 0 ? (
            <AddUnitDialog onSuccess={handleUnitAdded}>
              <Button>Create Your First Unit</Button>
            </AddUnitDialog>
          ) : (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Legal Agreements Dialog */}
      <LegalAgreementsDialog
        unit={selectedUnit!}
        isOpen={isLegalAgreementsOpen}
        onClose={() => {
          setIsLegalAgreementsOpen(false);
          setSelectedUnit(null);
        }}
      />

      {/* Unit Details Modal */}
      <UnitDetailsModal
        unit={selectedUnit}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUnit(null);
        }}
        projectMap={projectMap}
        schemeMap={schemeMap}
      />
    </div>
  );
}
