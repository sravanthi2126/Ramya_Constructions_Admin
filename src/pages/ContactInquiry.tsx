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
import { Calendar, Mail, Phone, MessageSquare, Clock, User, Filter, RefreshCw } from "lucide-react";
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
      console.log("Updated inquiries:", data.data || []);
    } catch (err: any) {
      console.error("Error fetching inquiries:", err);
      setError(`Failed to fetch inquiries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Fetching inquiries on mount...");
    fetchInquiries();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            Contact Inquiries
          </h1>
          <p className="text-gray-600 ml-16">Manage and track customer inquiries</p>
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
                <p className="text-gray-500 text-lg font-medium mb-2">No inquiries found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inquiries.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-1 overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-2 rounded-lg">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {item.full_name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 break-all">{item.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700">{item.phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 line-clamp-2">{item.message}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                  
                  {item.follow_up_date && (
                    <div className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-amber-800 font-medium">
                        Follow-up: {item.follow_up_date}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(item.created_at), "PPpp")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInquiry;