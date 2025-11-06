import {
  X,
  Building,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PurchasedUnit } from "@/types/admin";

interface UnitDetailsModalProps {
  unit: PurchasedUnit | null;
  isOpen: boolean;
  onClose: () => void;
  projectMap: Record<string, string>;
  schemeMap: Record<string, string>;
}

export function UnitDetailsModal({
  unit,
  isOpen,
  onClose,
  projectMap,
  schemeMap,
}: UnitDetailsModalProps) {
  if (!unit) return null;

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

  // Get project name from ID
  const getProjectName = (projectId: string) => {
    return projectMap[projectId] || projectId;
  };

  // Get scheme name from ID
  const getSchemeName = (schemeId: string) => {
    return schemeMap[schemeId] || schemeId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            Unit Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Unit Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {unit.unit_number}
                </h1>
                <p className="text-gray-600 mt-1">
                  Floor {unit.floor_number} • {unit.total_area_sqft} sqft
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={`px-3 py-1 ${getStatusColor(unit.payment_status)}`}
                >
                  {unit.payment_status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge
                  className={`px-3 py-1 ${getStatusColor(unit.unit_status)}`}
                >
                  {unit.unit_status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Information */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Financial Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Investment:</span>
                    <span className="font-semibold">
                      {formatCurrency(unit.total_investment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rental:</span>
                    <span className="font-semibold">
                      {formatCurrency(unit.monthly_rental)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(unit.user_paid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance Amount:</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(unit.balance_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Units:</span>
                    <span className="font-semibold">
                      {unit.number_of_units}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Important Dates
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium">
                      {formatDate(unit.purchase_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rental Start:</span>
                    <span className="font-medium">
                      {formatDate(unit.rental_start_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created At:</span>
                    <span className="font-medium">
                      {formatDate(unit.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated At:</span>
                    <span className="font-medium">
                      {formatDate(unit.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership & IDs */}
            <div className="space-y-6">
              {/* Ownership */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Ownership Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ownership Type:</span>
                    <span className="font-medium">
                      {unit.is_joint_ownership
                        ? "Joint Ownership"
                        : "Single Ownership"}
                    </span>
                  </div>

                  {unit.is_joint_ownership &&
                    unit.joint_owners &&
                    unit.joint_owners.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Joint Owners:
                        </h4>
                        <div className="space-y-2">
                          {unit.joint_owners.map((owner, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 capitalize">
                                  {owner.relation}
                                </span>
                              </div>
                              <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                                {owner.user_profile_id.slice(0, 8)}...
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Project & Scheme Info */}
              {/* <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Project & Scheme
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project:</span>
                    <span
                      className="font-medium text-right max-w-[200px] truncate"
                      title={getProjectName(unit.project_id)}
                    >
                      {getProjectName(unit.project_id)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheme:</span>
                    <span
                      className="font-medium text-right max-w-[200px] truncate"
                      title={getSchemeName(unit.scheme_id)}
                    >
                      {getSchemeName(unit.scheme_id)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchaser ID:</span>
                    <span className="font-mono text-sm">
                      {unit.purchaser_user_id}
                    </span>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </Button>
            {/* <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Edit Unit
            </Button> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
