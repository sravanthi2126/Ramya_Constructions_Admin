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

/**
 * USER MANAGEMENT COMPONENT
 */
export default function UserManagement() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error" | "warning",
  });

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

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
        return <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#4CAF50]" />;
      case "error":
        return <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#F44336]" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9800]" />;
      default:
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#2196F3]" />;
    }
  };

  // ==========================================
  // API FUNCTIONS
  // ==========================================

  /**
   * Fetches all user profiles from the backend API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("No admin token found. Please login again.");
      }

      const response = await fetch(
        "http://127.0.0.1:8001/api/admin/user_profiles/all?page=1&limit=100",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();

      // Handle different possible response structures
      let usersData: any[] = [];

      if (Array.isArray(responseData)) {
        usersData = responseData;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        usersData = responseData.data;
      } else if (responseData.users && Array.isArray(responseData.users)) {
        usersData = responseData.users;
      } else if (
        responseData.profiles &&
        Array.isArray(responseData.profiles)
      ) {
        usersData = responseData.profiles;
      } else {
        setUsers([]);
        showToast("No users found in the response", "warning");
        return;
      }

      // Transform API data to match frontend User type
      const transformedUsers: User[] = usersData.map((apiUser: any, index) => {
        const profileData = apiUser || {};

        // Create User object with proper typing
        const user: User = {
          id: profileData.user_id || `temp-${index}`,
          name:
            `${profileData.name || ""} ${profileData.surname || ""}`.trim() ||
            "Unknown User",
          email: profileData.email || "No email provided",
          phone_number: profileData.phone_number || "No phone provided",
          user_type: profileData.user_type || "free",
          is_active:
            profileData.status === "active" || profileData.status === "hold",
          profile: {
            id: profileData.user_profile_id || `profile-${index}`,
            user_id: profileData.user_id || `user-${index}`,
            kyc_verification_status:
              profileData.kyc_verification_status || "pending",
            first_name: profileData.name,
            last_name: profileData.surname,
            phone_number: profileData.phone_number,
            email: profileData.email,
            date_of_birth: profileData.dob,
            address: profileData.present_address?.street || "",
            city: profileData.present_address?.city || "",
            state: profileData.present_address?.state || "",
            pincode:
              profileData.present_address?.postal_code ||
              profileData.permanent_address?.postal_code ||
              "",
            zip_code: profileData.permanent_address?.postal_code || "",
            country:
              profileData.present_address?.country ||
              profileData.permanent_address?.country ||
              "",
            pan_number: profileData.pan_number || "",
            aadhar_number: profileData.aadhar_number || "",
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
          },
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
        };

        return user;
      });

      setUsers(transformedUsers);

      if (transformedUsers.length === 0) {
        showToast("No users found", "warning");
      } else {
        showToast(
          `Loaded ${transformedUsers.length} users successfully`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      const errorMessage = err.message || "Failed to load users";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles KYC verification actions (approve/reject)
   */
  const handleKycAction = async (
    userId: string,
    status: "verified" | "rejected"
  ) => {
    try {
      // Update local state optimistically
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                profile: user.profile
                  ? {
                      ...user.profile,
                      kyc_verification_status: status,
                    }
                  : null,
              }
            : user
        )
      );

      showToast(`KYC status updated to ${status}`, "success");

      // TODO: Implement actual API call when endpoint is available
      console.log(`Would update KYC for user ${userId} to ${status}`);
    } catch (err: any) {
      console.error("Error updating KYC status:", err);
      showToast("Failed to update KYC status", "error");
      fetchUsers(); // Refetch to get correct state
    }
  };

  /**
   * Handles user activation/deactivation
   */
  const handleActivation = async (userId: string, isActive: boolean) => {
    try {
      // Update local state optimistically
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, is_active: isActive } : user
        )
      );

      showToast(
        `User ${isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );

      // TODO: Implement actual API call when endpoint is available
      console.log(`Would update activation for user ${userId} to ${isActive}`);
    } catch (err: any) {
      console.error("Error updating user status:", err);
      showToast("Failed to update user status", "error");
      fetchUsers(); // Refetch to get correct state
    }
  };

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // ==========================================
  // UTILITY FUNCTIONS FOR STYLING
  // ==========================================

  const getUserTypeColor = (type: string) => {
    return type === "subscriber"
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground";
  };

  const getKycStatusColor = (status?: string) => {
    if (!status || status === "partial" || status === "pending") {
      return "bg-muted text-muted-foreground";
    }
    switch (status) {
      case "verified":
        return "bg-success text-success-foreground";
      case "rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // ==========================================
  // STATISTICS CALCULATION
  // ==========================================

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    subscribers: users.filter((u) => u.user_type === "subscriber").length,
    verified: users.filter(
      (u) => u.profile?.kyc_verification_status === "verified"
    ).length,
    pending: users.filter(
      (u) =>
        !u.profile?.kyc_verification_status ||
        u.profile.kyc_verification_status === "pending" ||
        u.profile.kyc_verification_status === "partial"
    ).length,
  };

  // ==========================================
  // EFFECT HOOKS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // COMPONENT RENDER
  // ==========================================

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-muted-foreground text-sm sm:text-base">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-[100] max-w-[90vw] sm:max-w-sm w-full rounded-lg shadow-lg border-l-4 ${getToastStyles()} transform transition-all duration-300 ease-in-out`}
        >
          <div className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0">{getToastIcon()}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() =>
                setToast({ show: false, message: "", type: "success" })
              }
              className="flex-shrink-0 text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage user accounts, profiles, and KYC verification
          </p>
        </div>
        <Button
          onClick={fetchUsers}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
          size="sm"
        >
          <RefreshCw
            className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`}
          />
          <span className="text-xs sm:text-sm">Refresh</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <div className="p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-destructive font-medium text-sm sm:text-base">
                Error loading users
              </p>
              <p className="text-destructive text-xs sm:text-sm break-words">
                {error}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              {stats.total}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Total Users
            </p>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-success">
              {stats.active}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Active Users
            </p>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
              {stats.subscribers}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Subscribers
            </p>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="text-center">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-success">
              {stats.verified}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              KYC Verified
            </p>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 col-span-2 lg:col-span-1">
          <div className="text-center">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-warning">
              {stats.pending}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              KYC Pending
            </p>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold">
              All Users ({users.length})
            </h2>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {stats.active}/{stats.total} active users
            </div>
          </div>

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
                    <TableRow key={user.id}>
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
                            className={`h-7 text-xs justify-start ${
                              user.is_active
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
          <div className="lg:hidden space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? "Loading users..." : "No users found"}
              </div>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="p-3 sm:p-4">
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
                        className={`h-8 flex-1 text-xs ${
                          user.is_active
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
        </div>
      </Card>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
