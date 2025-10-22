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

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  follow_up_date: string | null;
  created_at: string;
}

const ContactInquiry = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-white border-l-[#4CAF50] text-gray-900";
      case "error":
        return "bg-white border-l-[#F44336] text-gray-900";
      case "warning":
        return "bg-white border-l-[#FF9800] text-gray-900";
      default:
        return "bg-white border-l-[#2196F3] text-gray-900";
    }
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-[#4CAF50]" />;
      case "error":
        return <X className="w-5 h-5 text-[#F44336]" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-[#FF9800]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#2196F3]" />;
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams();
      if (status && status !== "all") query.append("status", status);
      if (startDate) query.append("start_date", startDate);

      const apiUrl = `http://localhost:8001/api/contact-inquiry/?${query.toString()}`;
      console.log("Fetching:", apiUrl);

      const res = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();
      console.log("Response:", data);
      setInquiries(data.data || []);
    } catch (err: any) {
      console.error("Error fetching inquiries:", err);
      setError(`Failed to fetch inquiries: ${err.message}`);
      showToast("Failed to fetch inquiries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching inquiries on mount...");
    fetchInquiries();
  }, []);

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    setUpdatingId(inquiryId);
    try {
      const response = await fetch(
        `http://localhost:8000/api/contact-inquiry/update-status/${inquiryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("admin_token") || ""
            }`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Status update response:", data);

      // Update local state
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === inquiryId
            ? {
                ...inquiry,
                status: newStatus,
                follow_up_date: data.data.follow_up_date,
              }
            : inquiry
        )
      );

      // Update selected inquiry if it's the one being viewed
      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                follow_up_date: data.data.follow_up_date,
              }
            : null
        );
      }

      showToast(`Inquiry marked as ${newStatus}`, "success");
    } catch (err: any) {
      console.error("Error updating status:", err);
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "converted":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const openInquiryDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailsOpen(true);
  };

  const closeInquiryDetails = () => {
    setIsDetailsOpen(false);
    setSelectedInquiry(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-[100] max-w-sm w-full rounded-lg shadow-lg border-l-4 ${getToastStyles()} transform transition-all duration-300 ease-in-out`}
        >
          <div className="p-4 flex items-start gap-3">
            <div className="flex-shrink-0">{getToastIcon()}</div>
            <div className="flex-1">
              <p className="font-medium text-sm">{toast.message}</p>
            </div>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="flex-shrink-0 text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 sm:p-3 rounded-xl shadow-lg">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                Contact Inquiries
              </h1>
              <p className="text-gray-600 ml-0 sm:ml-14 text-sm sm:text-base">
                Manage and track customer inquiries
              </p>
            </div>
            <Button
              onClick={fetchInquiries}
              disabled={loading}
              variant="outline"
              className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="border-b bg-emerald-50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Status
                </label>
                <Select
                  onValueChange={(value) => setStatus(value)}
                  defaultValue="all"
                >
                  <SelectTrigger className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Inquiries</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchInquiries}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filters
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading inquiries...</p>
          </div>
        ) : error ? (
          <Card className="shadow-xl border-0 bg-red-50">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 text-lg font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : inquiries.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-20">
              <div className="text-center">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">
                  No inquiries found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your filters
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {inquiries.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => openInquiryDetails(item)}
              >
                <div
                  className={`h-2 ${
                    item.status === "converted"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-blue-500 to-cyan-600"
                  }`}
                ></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.status === "converted"
                            ? "bg-gradient-to-br from-green-100 to-emerald-100"
                            : "bg-gradient-to-br from-blue-100 to-cyan-100"
                        }`}
                      >
                        <User
                          className={`w-5 h-5 ${
                            item.status === "converted"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {item.full_name}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(item.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 break-all line-clamp-1">
                      {item.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{item.phone}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 line-clamp-2 flex-1">
                      {item.message}
                    </p>
                  </div>

                  {item.follow_up_date && (
                    <div className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-amber-800 font-medium text-xs">
                        Follow-up: {item.follow_up_date}
                      </span>
                    </div>
                  )}

                  {/* Action Button - Only show for new inquiries */}
                  {item.status === "new" && (
                    <div className="pt-2 border-t border-gray-100">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateInquiryStatus(item.id, "converted");
                        }}
                        disabled={updatingId === item.id}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm py-2"
                      >
                        {updatingId === item.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Converted
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Details Modal */}
      {isDetailsOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className={`h-2 ${
                selectedInquiry.status === "converted"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-cyan-600"
              }`}
            ></div>

            <div className="px-6 py-4 flex justify-between items-center border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Inquiry Details
              </h3>
              <button
                onClick={closeInquiryDetails}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    selectedInquiry.status === "converted"
                      ? "bg-gradient-to-br from-green-100 to-emerald-100"
                      : "bg-gradient-to-br from-blue-100 to-cyan-100"
                  }`}
                >
                  <User
                    className={`w-6 h-6 ${
                      selectedInquiry.status === "converted"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900">
                    {selectedInquiry.full_name}
                  </h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        selectedInquiry.status
                      )}`}
                    >
                      {selectedInquiry.status.charAt(0).toUpperCase() +
                        selectedInquiry.status.slice(1)}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(selectedInquiry.created_at), "PPpp")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900 font-medium">
                        {selectedInquiry.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-gray-900 font-medium">
                        {selectedInquiry.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedInquiry.follow_up_date && (
                  <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Follow-up Date</p>
                      <p className="text-amber-800 font-medium">
                        {selectedInquiry.follow_up_date}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-900 leading-relaxed">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>

              {/* Action Button - Only show for new inquiries */}
              {selectedInquiry.status === "new" && (
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    onClick={() =>
                      updateInquiryStatus(selectedInquiry.id, "converted")
                    }
                    disabled={updatingId === selectedInquiry.id}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg"
                  >
                    {updatingId === selectedInquiry.id ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Mark as Converted
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactInquiry;
