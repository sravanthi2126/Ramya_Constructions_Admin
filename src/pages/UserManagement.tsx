
import { useState, useEffect } from "react";
import {
  Eye,
  UserCheck,
  UserX,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { UserProfileModal } from "@/components/Users/UserProfileModal";
import { User } from "@/types/admin";
import { userApi, UserSummary } from "@/api/apiService";

export default function UserManagement() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Toast
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const getToastStyles = () => {
    const styles = {
      success: "bg-white border-l-[#4CAF50] text-gray-900",
      error: "bg-white border-l-[#F44336] text-gray-900",
      warning: "bg-white border-l-[#FF9800] text-gray-900",
    };
    return styles[toast.type];
  };

  const getToastIcon = () => {
    const icons = {
      success: <Check className="w-5 h-5 text-[#4CAF50]" />,
      error: <X className="w-5 h-5 text-[#F44336]" />,
      warning: <AlertCircle className="w-5 h-5 text-[#FF9800]" />,
    };
    return icons[toast.type];
  };

  // Transform API user to frontend User type
  const transformUser = (apiUser: any, index: number): User => {
    const p = apiUser || {};
    return {
      id: p.user_id || `temp-${index}`,
      profile_id: p.user_profile_id, // ← important for unique keys
      name: `${p.name || ""} ${p.surname || ""}`.trim() || "Unknown User",
      email: p.email || "No email",
      phone_number: p.phone_number || "No phone",
      user_type: p.user_type || "free",
      is_active: p.status === "active" || p.status === "hold",
      profile: {
        id: p.user_profile_id || `profile-${index}`,
        user_id: p.user_id || `user-${index}`,
        kyc_verification_status: p.kyc_verification_status || "pending",
        first_name: p.name,
        last_name: p.surname,
        phone_number: p.phone_number,
        email: p.email,
        date_of_birth: p.dob,
        address: p.present_address?.street || "",
        city: p.present_address?.city || "",
        state: p.present_address?.state || "",
        pincode: p.present_address?.postal_code || p.permanent_address?.postal_code || "",
        country: p.present_address?.country || p.permanent_address?.country || "",
        pan_number: p.pan_number || "",
        aadhar_number: p.aadhar_number || "",
        gst_number: p.gst_number || "",
        passport_number: p.passport_number || "",
        account_details: p.account_details || {
          account_holder_name: "",
          bank_account_name: "",
          account_number: "",
          ifsc_code: "",
        },
        created_at: p.created_at,
        updated_at: p.updated_at,
      },
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  };

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userApi.getUsers(page, limit);
      const profiles = response.profiles || [];

      const transformed: User[] = profiles.map((p: any) => ({
        id: p.user_id,                    // This is the main user ID
        profile_id: p.user_profile_id,    // Unique per profile!
        name: `${p.name || ""} ${p.surname || ""}`.trim() || "Unknown User",
        email: p.email || "No email",
        phone_number: p.phone_number || "No phone",
        user_type: p.user_type || "individual",
        is_active: p.status === "success" || p.status === "active",
        profile: {
          id: p.user_profile_id,
          user_id: p.user_id,
          kyc_verification_status: p.kyc_verification_status || "pending",
          first_name: p.name,
          last_name: p.surname,
          phone_number: p.phone_number,
          email: p.email,
          date_of_birth: p.dob,
          address: p.present_address?.street || "",
          city: p.present_address?.city || "",
          state: p.present_address?.state || "",
          pincode: p.present_address?.postal_code || "",
          country: p.present_address?.country || "India",
          pan_number: p.pan_number || "",
          aadhar_number: p.aadhar_number || "",
          gst_number: p.gst_number || "",
          passport_number: p.passport_number || "",
          account_details: p.account_details || {
            account_holder_name: "",
            bank_account_name: "",
            account_number: "",
            ifsc_code: "",
          },
          created_at: p.created_at,
          updated_at: p.updated_at,
        },
        created_at: p.created_at,
      }));

      setUsers(transformed);
      setTotalRecords(response.total_profiles);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);

      showToast(`Loaded ${profiles.length} profiles`, "success");
    } catch (err: any) {
      setError("Failed to load users");
      showToast("Failed to load users", "error");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  // Fetch Summary
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const data = await userApi.getSummary();
      setSummary(data);
    } catch (err: any) {
      showToast("Failed to load summary", "warning");
    } finally {
      setLoadingSummary(false);
    }
  };

  // Handlers
  const handleKycAction = async (userId: string, status: "verified" | "rejected") => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? { ...u, profile: u.profile ? { ...u.profile, kyc_verification_status: status } : u.profile }
          : u
      )
    );
    showToast(`KYC ${status === "verified" ? "approved" : "rejected"}`, "success");
  };

  const handleActivation = async (userId: string, activate: boolean) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, is_active: activate } : u))
    );
    showToast(`User ${activate ? "activated" : "deactivated"}`, "success");
  };

  // Effects
  useEffect(() => {
    fetchSummary();
    fetchUsers(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchUsers(newPage);
    }
  };

  const getUserTypeColor = (type: string) =>
    type === "subscriber" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground";

  const getKycStatusColor = (status?: string) => {
    if (!status || status === "pending" || status === "partial")
      return "bg-muted text-muted-foreground";
    return status === "verified"
      ? "bg-success text-success-foreground"
      : "bg-destructive text-destructive-foreground";
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full rounded-lg shadow-lg border-l-4 ${getToastStyles()} animate-fade-in`}>
          <div className="p-4 flex items-start gap-3">
            {getToastIcon()}
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage users, KYC, and account status</p>
        </div>
        <Button onClick={() => { fetchSummary(); fetchUsers(currentPage); }} disabled={loading || loadingSummary}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-destructive/10 border-destructive p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 text-center"><p className="text-2xl font-bold">{summary?.total_users ?? "-"}</p><p className="text-sm text-muted-foreground">Total Users</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-success">{summary?.active_users ?? "-"}</p><p className="text-sm text-muted-foreground">Active</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-primary">{summary?.total_profiles ?? "-"}</p><p className="text-sm text-muted-foreground">Subscribers</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-success">{summary?.kyc_verified ?? "-"}</p><p className="text-sm text-muted-foreground">KYC Verified</p></Card>
        <Card className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{summary?.kyc_pending ?? "-"}</p><p className="text-sm text-muted-foreground">KYC Pending</p></Card>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">All Users</h2>
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, totalRecords)} of {totalRecords}
            </p>
          </div>

          {/* Desktop Table */}
          {/* Desktop Table */}
          <div className="hidden lg:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">User Information</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="w-[180px]">KYC Verification</TableHead>
                  <TableHead className="text-right w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {loading ? "Loading users..." : "No users found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.profile?.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm sm:text-base">
                            {user.name}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            ID: {user.id}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-xs sm:text-sm">
                            {user.phone_number}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getUserTypeColor(user.user_type)}>
                          {user.user_type.toUpperCase()}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            user.is_active
                              ? "bg-success text-success-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <div>
                            <Badge
                              className={getKycStatusColor(
                                user.profile?.kyc_verification_status
                              )}
                            >
                              {(
                                user.profile?.kyc_verification_status ||
                                "PENDING"
                              ).toUpperCase()}
                            </Badge>
                          </div>

                          {user.profile &&
                            !["verified", "rejected"].includes(
                              user.profile.kyc_verification_status
                            ) && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-success border-success hover:bg-success hover:text-white"
                                  onClick={() =>
                                    handleKycAction(user.id, "verified")
                                  }
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-destructive border-destructive hover:bg-destructive hover:text-white"
                                  onClick={() =>
                                    handleKycAction(user.id, "rejected")
                                  }
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs justify-start"
                            onClick={() => handleViewProfile(user)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 text-xs justify-start ${user.is_active
                              ? "text-destructive hover:text-destructive"
                              : "text-success hover:text-success"
                              }`}
                            onClick={() =>
                              handleActivation(user.id, !user.is_active)
                            }
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? "Loading users..." : "No users found"}
              </div>
            ) : (
              users.map((user) => (
                // <Card key={user.id} className="p-3 sm:p-4">
                <Card key={user.profile?.id} className="p-3 sm:p-4">
                  <div className="space-y-3">
                    {/* User Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm sm:text-base truncate">
                            {user.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <Badge className={getUserTypeColor(user.user_type)}>
                          {user.user_type.toUpperCase()}
                        </Badge>
                        <Badge
                          className={
                            user.is_active
                              ? "bg-success text-success-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 gap-1">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono">{user.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>

                    {/* KYC Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          KYC:
                        </span>
                        <Badge
                          className={getKycStatusColor(
                            user.profile?.kyc_verification_status
                          )}
                        >
                          {(
                            user.profile?.kyc_verification_status || "PENDING"
                          ).toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* KYC Actions */}
                    {user.profile &&
                      !["verified", "rejected"].includes(
                        user.profile.kyc_verification_status
                      ) && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 flex-1 text-xs text-success border-success hover:bg-success hover:text-white"
                            onClick={() => handleKycAction(user.id, "verified")}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept KYC
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 flex-1 text-xs text-destructive border-destructive hover:bg-destructive hover:text-white"
                            onClick={() => handleKycAction(user.id, "rejected")}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject KYC
                          </Button>
                        </div>
                      )}

                    {/* User Actions */}
                    <div className="flex space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 flex-1 text-xs"
                        onClick={() => handleViewProfile(user)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View Profile
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-8 flex-1 text-xs ${user.is_active
                          ? "text-destructive border-destructive hover:bg-destructive hover:text-white"
                          : "text-success border-success hover:bg-success hover:text-white"
                          }`}
                        onClick={() =>
                          handleActivation(user.id, !user.is_active)
                        }
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>


          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div >
      </Card >

      <UserProfileModal user={selectedUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div >
  );
}