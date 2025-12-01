import {
  X,
  Building,
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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

// export function UnitDetailsModal({
//   unit,
//   isOpen,
//   onClose,
//   projectMap,
//   schemeMap,
// }: UnitDetailsModalProps) {
//   if (!unit) return null;

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "none":
//         return "bg-gray-100 text-gray-800 border-gray-200";
//       case "advance_paid":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "partially_paid":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "fully_paid":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "payment_ongoing":
//         return "bg-orange-100 text-orange-800 border-orange-200";
//       case "completed":
//         return "bg-green-100 text-green-800 border-green-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   // Get project name from ID
//   const getProjectName = (projectId: string) => {
//     return projectMap[projectId] || projectId;
//   };

//   // Get scheme name from ID
//   const getSchemeName = (schemeId: string) => {
//     return schemeMap[schemeId] || schemeId;
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
//           <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
//             <Building className="h-6 w-6 text-blue-600" />
//             Unit Details
//           </DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Unit Header */}
//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   {unit.unit_number}
//                 </h1>
//                 <p className="text-gray-600 mt-1">
//                   Floor {unit.floor_number} • {unit.total_area_sqft} sqft
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <Badge
//                   className={`px-3 py-1 ${getStatusColor(unit.payment_status)}`}
//                 >
//                   {unit.payment_status.replace("_", " ").toUpperCase()}
//                 </Badge>
//                 <Badge
//                   className={`px-3 py-1 ${getStatusColor(unit.unit_status)}`}
//                 >
//                   {unit.unit_status.replace("_", " ").toUpperCase()}
//                 </Badge>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Financial Information */}
//             <div className="space-y-6">
//               <div className="bg-white border border-gray-200 rounded-lg p-4">
//                 <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   {/* <DollarSign className="w-5 h-5 text-green-600" /> */}
//                   Financial Details
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Total Investment:</span>
//                     <span className="font-semibold">
//                       {formatCurrency(unit.total_investment)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Monthly Rental:</span>
//                     <span className="font-semibold">
//                       {formatCurrency(unit.monthly_rental)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Amount Paid:</span>
//                     <span className="font-semibold text-green-600">
//                       {formatCurrency(unit.user_paid)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Balance Amount:</span>
//                     <span className="font-semibold text-orange-600">
//                       {formatCurrency(unit.balance_amount)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Number of Units:</span>
//                     <span className="font-semibold">
//                       {unit.number_of_units}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Dates */}
//               <div className="bg-white border border-gray-200 rounded-lg p-4">
//                 <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Calendar className="w-5 h-5 text-blue-600" />
//                   Important Dates
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Purchase Date:</span>
//                     <span className="font-medium">
//                       {formatDate(unit.purchase_date)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Rental Start:</span>
//                     <span className="font-medium">
//                       {formatDate(unit.rental_start_date)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Created At:</span>
//                     <span className="font-medium">
//                       {formatDate(unit.created_at)}
//                     </span>
//                   </div>
//                   {/* <div className="flex justify-between">
//                     <span className="text-gray-600">Updated At:</span>
//                     <span className="font-medium">
//                       {formatDate(unit.updated_at)}
//                     </span>
//                   </div> */}
//                 </div>
//               </div>
//             </div>

//             {/* Ownership & IDs */}
//             <div className="space-y-6">
//               <div className="bg-white border border-gray-200 rounded-lg p-4">
//                 <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Users className="w-5 h-5 text-purple-600" />
//                   Ownership Details
//                 </h3>

//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Ownership Type:</span>
//                     <span className="font-medium">
//                       {unit.is_joint_ownership ? "Joint Ownership" : "Single Ownership"}
//                     </span>
//                   </div>

//                   {/* Owner Name */}
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Owner Name:</span>

//                     {!unit.is_joint_ownership ? (
//                       <span className="font-medium capitalize">
//                         {unit.primary_purchaser_name}
//                       </span>
//                     ) : (
//                       <span className="font-medium capitalize">
//                         {unit.primary_purchaser_name}(P)
//                         {unit.joint_purchaser_name && ` / ${unit.joint_purchaser_name}`}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>




//             {/* Project & Scheme Info */}
//             {/* <div className="bg-white border border-gray-200 rounded-lg p-4">
//                 <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <MapPin className="w-5 h-5 text-red-600" />
//                   Project & Scheme
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Project:</span>
//                     <span
//                       className="font-medium text-right max-w-[200px] truncate"
//                       title={getProjectName(unit.project_id)}
//                     >
//                       {getProjectName(unit.project_id)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Scheme:</span>
//                     <span
//                       className="font-medium text-right max-w-[200px] truncate"
//                       title={getSchemeName(unit.scheme_id)}
//                     >
//                       {getSchemeName(unit.scheme_id)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600">Purchaser ID:</span>
//                     <span className="font-mono text-sm">
//                       {unit.purchaser_user_id}
//                     </span>
//                   </div>
//                 </div>
//               </div> */}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
//           <Button
//             onClick={onClose}
//             className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//           >
//             Close
//           </Button>
//           {/* <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//               Edit Unit
//             </Button> */}
//         </div>

//       </DialogContent>
//     </Dialog >
//   );
// }


export function UnitDetailsModal({
  unit,
  isOpen,
  onClose,
  projectMap,
  schemeMap,
  paymentData,               // <--- ADD THIS
  handleExport,              // <--- ADD THIS
  handleDownloadReceipt,     // <--- ADD THIS
  getTransactionTypeText,    // <--- ADD THIS
}: UnitDetailsModalProps & {
  paymentData?: any;
  handleExport?: () => void;
  handleDownloadReceipt?: (orderId: string) => void;
  getTransactionTypeText?: (type: string) => string;
}) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            Unit Details
          </DialogTitle>
        </DialogHeader>

        {/* ------------------ EXISTING DETAILS ------------------ */}
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
                <Badge className={`px-3 py-1 ${getStatusColor(unit.payment_status)}`}>
                  {unit.payment_status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={`px-3 py-1 ${getStatusColor(unit.unit_status)}`}>
                  {unit.unit_status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* 2 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Info */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Financial Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Investment:</span>
                    <span className="font-semibold">
                      {formatCurrency(unit.total_investment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Rental:</span>
                    <span className="font-semibold">
                      {formatCurrency(unit.monthly_rental)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(unit.user_paid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance Amount:</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(unit.balance_amount)}
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
                    <span>Purchase Date:</span>
                    <span>{formatDate(unit.purchase_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rental Start:</span>
                    <span>{formatDate(unit.rental_start_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ownership Details */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Ownership Details
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ownership Type:</span>
                    <span>
                      {unit.is_joint_ownership ? "Joint Ownership" : "Single Ownership"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Owner Name:</span>
                    {!unit.is_joint_ownership ? (
                      <span>{unit.primary_purchaser_name}</span>
                    ) : (
                      <span>
                        {unit.primary_purchaser_name}(P) / {unit.joint_purchaser_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* -------------- PAYMENT HISTORY SECTION ADDED -------------- */}
        {/* ----------------------------------------------------------- */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-card p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Payment History
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {paymentData?.total_payments || 0} total transactions
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                    Scheme_type :
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {(unit.scheme_type)}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    Export
                  </Button>
                  <Badge variant="secondary">
                    ID: {paymentData?.unit_number || "N/A"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {paymentData?.payments?.length > 0 ? (
                  <div className="divide-y divide-border/60">
                    {paymentData.payments
                      .slice()
                      .reverse()
                      .map((payment, index) => (
                        <div
                          key={payment.order_id}
                          className="p-4 hover:bg-muted/30 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold">
                                  {getTransactionTypeText(payment.transaction_type)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(payment.payment_date)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {formatCurrency(payment.amount)}
                              </p>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReceipt(payment.order_id)}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto opacity-40 mb-4" />
                    No payment history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ------------------ ACTION BUTTONS ------------------ */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <Button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
