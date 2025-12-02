// import { Project } from '@/types/admin';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Card } from '@/components/ui/card';
// import { MapPin, Building, Calendar, CreditCard } from 'lucide-react';

// interface ProjectDetailsModalProps {
//   project: Project | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
//   if (!project) return null;

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'available':
//         return 'bg-success text-success-foreground';
//       case 'sold_out':
//         return 'bg-destructive text-destructive-foreground';
//       case 'coming_soon':
//         return 'bg-warning text-warning-foreground';
//       default:
//         return 'bg-muted text-muted-foreground';
//     }
//   };

//   const formatPrice = (price: number) => {
//     if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
//     if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
//     return `₹${price.toLocaleString()}`;
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold">{project.title}</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Status and Basic Info */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <MapPin className="w-4 h-4 text-muted-foreground" />
//               <span className="text-sm text-muted-foreground">{project.location}</span>
//             </div>
//             <Badge className={getStatusColor(project.status)}>
//               {project.status.replace('_', ' ').toUpperCase()}
//             </Badge>
//           </div>

//           {/* Description */}
//           {project.description && (
//             <Card className="p-4">
//               <h4 className="font-semibold mb-2">Description</h4>
//               <p className="text-sm text-muted-foreground">{project.description}</p>
//             </Card>
//           )}

//           {/* Key Details Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Card className="p-4">
//               <div className="flex items-center space-x-2 mb-2">
//                 <CreditCard className="w-4 h-4 text-primary" />
//                 <h4 className="font-semibold">Pricing</h4>
//               </div>
//               <p className="text-lg font-bold text-primary">{formatPrice(project.base_price)}</p>
//               <p className="text-xs text-muted-foreground">Base price</p>
//             </Card>

//             <Card className="p-4">
//               <div className="flex items-center space-x-2 mb-2">
//                 <Building className="w-4 h-4 text-primary" />
//                 <h4 className="font-semibold">Property Type</h4>
//               </div>
//               <p className="text-sm font-medium capitalize">{project.property_type.replace('_', ' ')}</p>
//             </Card>

//             <Card className="p-4">
//               <h4 className="font-semibold mb-2">Sqft Overview</h4>
//               <div className="space-y-1 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Total Sqft:</span>
//                   <span className="font-medium">{project.total_units}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Available:</span>
//                   <span className="font-medium text-success">{project.available_units}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Sold:</span>
//                   <span className="font-medium text-primary">{project.sold_units}</span>
//                 </div>
//               </div>
//             </Card>

//   <Card className="p-4">
//     <div className="flex items-center space-x-2 mb-2">
//       <Calendar className="w-4 h-4 text-primary" />
//       <h4 className="font-semibold">Project Info</h4>
//     </div>
//     <div className="space-y-1 text-sm">
//       {project.rera_number && (
//         <div>
//           <span className="text-muted-foreground">RERA: </span>
//           <span className="font-medium">{project.rera_number}</span>
//         </div>
//       )}
//       <div>
//         <span className="text-muted-foreground">Created: </span>
//         <span className="font-medium">
//           {new Date(project.created_at).toLocaleDateString()}
//         </span>
//       </div>
//     </div>
//   </Card>
// </div>

//           {/* Progress Bar */}
//           <Card className="p-4">
//             <h4 className="font-semibold mb-3">Sales Progress</h4>
//             <div className="w-full bg-muted rounded-full h-2">
//               <div 
//                 className="bg-primary h-2 rounded-full transition-all duration-300"
//                 style={{ 
//                   width: `${(project.sold_units / project.total_units) * 100}%` 
//                 }}
//               />
//             </div>
//             <div className="flex justify-between text-xs text-muted-foreground mt-2">
//               <span>0 Sqft</span>
//               <span>{Math.round((project.sold_units / project.total_units) * 100)}% sold</span>
//               <span>{project.total_units} Sqft</span>
//             </div>
//           </Card>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }



// components/Projects/ProjectDetailsModal.tsx
import { useState, useEffect } from "react";
import { Project } from "@/types/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Building,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { schemeApi } from "@/api/apiService"; // assuming your apiService is exported as projectApi

interface Scheme {
  id: string;
  project_id: string;
  scheme_type: "single_payment" | "installment";
  scheme_name: string;
  area_sqft: number;
  booking_advance: number | null;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  monthly_rental_income: number;
  created_at: string;
  updated_at: string;
}

interface SchemeListResponse {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  total_schemes: number;
  total_invertment_amount: number;
  schemes: Scheme[];
}

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailsModalProps) {
  const [schemesData, setSchemesData] = useState<SchemeListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 3; // Adjust as needed

  const fetchSchemes = async (page: number) => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      // Using your existing API method
      const data = await schemeApi.getAllSchemesByProject(project.id, page, limit);
      setSchemesData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load investment schemes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && project) {
      setCurrentPage(1);
      fetchSchemes(1);
    } else {
      setSchemesData(null);
      setError(null);
    }
  }, [isOpen, project]);

  const handlePrevPage = () => {
    if (schemesData?.is_previous) {
      setCurrentPage((p) => p - 1);
      fetchSchemes(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (schemesData?.is_next) {
      setCurrentPage((p) => p + 1);
      fetchSchemes(currentPage + 1);
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "N/A";
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{project.location}</span>
            </div>
            <Badge className="text-sm px-3 py-1">
              {project.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>

          {/* Description */}
          {project.description && (
            <Card className="p-5 bg-gray-50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </Card>
          )}

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Base Price</p>
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(project.base_price)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Building className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="text-lg font-semibold capitalize">
                    {project.property_type.replace("_", " ")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Availability / Total Sqft</p>
                <p className="text-2xl font-bold">
                  {project.available_units} / {project.total_units}
                </p>
                <p className="text-xs text-muted-foreground">Sqft available</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Project Info</h4>
              </div>
              <div className="space-y-1 text-sm">
                {project.rera_number && (
                  <div>
                    <span className="text-muted-foreground">RERA: </span>
                    <span className="font-medium">{project.rera_number}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Created: </span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>


          {/* Sales Progress */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Sales Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {Math.round((project.sold_units / project.total_units) * 100)}% Sold
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(project.sold_units / project.total_units) * 100}%`,
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Investment Schemes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Investment Schemes</h3>
              {schemesData && (
                <p className="text-sm text-muted-foreground">
                  {schemesData.total_schemes} schemes • Total Investment:{" "}
                  {formatPrice(schemesData.total_invertment_amount)}
                </p>
              )}
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                    <Skeleton className="h-20 w-full mt-4 rounded-lg" />
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button onClick={() => fetchSchemes(currentPage)} variant="outline" className="mt-3">
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && schemesData?.schemes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No investment schemes found for this project.
              </div>
            )}

            {!loading && schemesData?.schemes.length > 0 && (
              <>
                {/* Schemes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {schemesData.schemes.map((scheme) => (
                    <Card
                      key={scheme.id}
                      className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border hover:border-primary/30"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${scheme.is_active ? "bg-green-500" : "bg-gray-400"
                          }`}
                      />

                      <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {scheme.scheme_name}
                          </h4>
                          <Badge className={getStatusColor(scheme.is_active)}>
                            {scheme.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <Badge variant="secondary" className="text-xs">
                          {scheme.scheme_type === "single_payment"
                            ? "Single Payment"
                            : "Installment"}
                        </Badge>

                        <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Area</span>
                            <span className="font-semibold flex items-center">
                              <Building2 className="w-4 h-4 mr-1 text-primary" />
                              {scheme.area_sqft.toLocaleString()} sqft
                            </span>
                          </div>

                          {scheme.booking_advance !== null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Booking</span>
                              <span className="font-bold text-green-600">
                                {formatPrice(scheme.booking_advance)}
                              </span>
                            </div>
                          )}

                          {scheme.scheme_type === "installment" && scheme.total_installments && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tenure</span>
                                <span className="font-medium">
                                  {scheme.total_installments} months
                                </span>
                              </div>
                              {scheme.monthly_installment_amount && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Monthly EMI</span>
                                  <span className="font-bold text-blue-600">
                                    {formatPrice(scheme.monthly_installment_amount)}
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">Rental from</span>
                            <Badge variant="outline">
                              Month {scheme.rental_start_month}
                            </Badge>
                          </div>

                          <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                            <span className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              {formatDate(scheme.start_date)}
                            </span>
                            {scheme.end_date && (
                              <span>{formatDate(scheme.end_date)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!schemesData.is_previous}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-sm font-medium">
                    Page {schemesData.page} of {schemesData.total_pages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!schemesData.is_next}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
}