// src/pages/ContactInquiry.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  User,
  Filter,
  RefreshCw,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { contactInquiryApi, ContactInquiry } from "@/api/apiService";

const ContactInquiry = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalRecords, setTotalRecords] = useState(0);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const getToastStyle = () => {
    switch (toast.type) {
      case "success": return "bg-white border-l-4 border-green-500 text-gray-900";
      case "error": return "bg-white border-l-4 border-red-500 text-gray-900";
      case "warning": return "bg-white border-l-4 border-orange-500 text-gray-900";
      default: return "bg-white border-l-4 border-blue-500 text-gray-900";
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case "success": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error": return <X className="w-5 h-5 text-red-600" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contactInquiryApi.getAll(
        page,
        limit,
        statusFilter === "all" ? undefined : statusFilter,
        startDate || undefined
      );

      setInquiries(response.data);
      setTotalRecords(response.meta.total_records);
    } catch (err: any) {
      setError(err.message || "Failed to load inquiries");
      showToast("Failed to fetch inquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, statusFilter, startDate]);

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    setUpdatingId(inquiryId);
    try {
      const res = await contactInquiryApi.updateStatus(inquiryId, newStatus);

      setInquiries((prev) =>
        prev.map((i) =>
          i.id === inquiryId
            ? { ...i, status: newStatus as any, follow_up_date: res.data?.follow_up_date ?? i.follow_up_date }
            : i
        )
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) =>
          prev ? { ...prev, status: newStatus as any, follow_up_date: res.data?.follow_up_date ?? prev.follow_up_date } : null
        );
      }

      showToast(`Inquiry marked as ${newStatus.replace("_", " ")}`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "converted": return "bg-green-100 text-green-800 border-green-200";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openDetails = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailsOpen(true);
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[100] max-w-sm w-full rounded-lg shadow-2xl border-l-4 ${getToastStyle()} transform transition-all duration-300`}>
          <div className="p-4 flex items-start gap-3">
            {getToastIcon()}
            <p className="font-medium text-sm">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                Contact Inquiries
              </h1>
              <p className="text-gray-600 mt-2 ml-16">Manage and track all customer inquiries</p>
            </div>
            <Button onClick={fetchInquiries} disabled={loading} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur">
          <CardHeader className="bg-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Inquiries</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button onClick={() => setPage(1)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Filter className="w-4 h-4 mr-2" /> Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading / Error / Empty */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        ) : error ? (
          <Card className="text-center py-16 text-red-600 bg-red-50 border-red-200">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </Card>
        ) : inquiries.length === 0 ? (
          <Card className="text-center py-20 bg-white/80">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No inquiries found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </Card>
        ) : (
          <>
            {/* Inquiry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inquiries.map((inquiry) => (
                <Card
                  key={inquiry.id}
                  className="group hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur cursor-pointer overflow-hidden border-0"
                  onClick={() => openDetails(inquiry)}
                >
                  <div className={`h-2 ${inquiry.status === "converted" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-blue-500 to-cyan-600"}`} />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${inquiry.status === "converted" ? "bg-green-100" : "bg-blue-100"}`}>
                          <User className={`w-6 h-6 ${inquiry.status === "converted" ? "text-green-600" : "text-blue-600"}`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{inquiry.full_name}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(inquiry.created_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.replace("_", " ").charAt(0).toUpperCase() + inquiry.status.slice(1).replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 truncate">{inquiry.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{inquiry.phone}</span>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      <MessageSquare className="w-4 h-4 inline mr-2 text-gray-400" />
                      {inquiry.message}
                    </div>

                    {inquiry.follow_up_date && (
                      <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-800">
                          Follow-up: {format(new Date(inquiry.follow_up_date), "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}

                    {inquiry.status === "new" && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateInquiryStatus(inquiry.id, "converted");
                        }}
                        disabled={updatingId === inquiry.id}
                        className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {updatingId === inquiry.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Converted
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalRecords > limit && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailsOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsDetailsOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`h-2 ${selectedInquiry.status === "converted" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-blue-500 to-cyan-600"}`} />
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Inquiry Details</h2>
                <button onClick={() => setIsDetailsOpen(false)} className="text-2xl text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-lg ${selectedInquiry.status === "converted" ? "bg-green-100" : "bg-blue-100"}`}>
                    <User className={`w-8 h-8 ${selectedInquiry.status === "converted" ? "text-green-600" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedInquiry.full_name}</h3>
                    <p className="text-gray-500">{format(new Date(selectedInquiry.created_at), "PPP 'at' p")}</p>
                  </div>
                  <span className={`ml-auto px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(selectedInquiry.status)}`}>
                    {selectedInquiry.status.replace("_", " ").charAt(0).toUpperCase() + selectedInquiry.status.slice(1).replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedInquiry.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedInquiry.phone}</p>
                      </div>
                    </div>
                  </div>

                  {selectedInquiry.follow_up_date && (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-sm text-gray-600">Follow-up Date</p>
                          <p className="font-medium text-amber-800">
                            {format(new Date(selectedInquiry.follow_up_date), "PPP")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message
                  </p>
                  <div className="bg-gray-50 p-5 rounded-lg border">
                    <p className="text-gray-800 leading-relaxed">{selectedInquiry.message}</p>
                  </div>
                </div>

                {selectedInquiry.status === "new" && (
                  <Button
                    onClick={() => updateInquiryStatus(selectedInquiry.id, "converted")}
                    disabled={updatingId === selectedInquiry.id}
                    className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {updatingId === selectedInquiry.id ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Mark as Converted
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInquiry;