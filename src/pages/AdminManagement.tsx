// import { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Users, Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { useToast } from '@/hooks/use-toast';

// interface Admin {
//   id: string;
//   name: string;
//   email: string;
//   created_at?: string;
//   updated_at?: string;
// }

// interface AdminFormData {
//   name: string;
//   email: string;
//   password: string;
// }

// export default function AdminManagement() {
//   const [admins, setAdmins] = useState<Admin[]>([]);
//   const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
//   const [formData, setFormData] = useState<AdminFormData>({
//     name: '',
//     email: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const { toast } = useToast();

//   // Fetch admins from backend (you'll need to add a GET endpoint)
//   useEffect(() => {
//     // TODO: Add GET /api/admins endpoint in backend to fetch all admins
//     // For now, we'll rely on manual updates after create/update/delete
//   }, []);

//   // Basic email validation
//   const validateEmail = (email: string) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const resetForm = () => {
//     setFormData({ name: '', email: '', password: '' });
//     setShowPassword(false);
//   };

//   // Create admin
//   const handleCreateAdmin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateEmail(formData.email)) {
//       toast({
//         title: 'Invalid email',
//         description: 'Please enter a valid email address.',
//         variant: 'destructive',
//       });
//       return;
//     }
//     if (formData.password.length < 6) {
//       toast({
//         title: 'Invalid password',
//         description: 'Password must be at least 6 characters long.',
//         variant: 'destructive',
//       });
//       return;
//     }
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('admin_token');

//       const response = await fetch('http://127.0.0.1:8000/api/admins/create', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` }),
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast({
//           title: 'Success',
//           description: result.message || 'Admin created successfully!',
//         });

//         // Use the actual admin data returned from backend
//         if (result.data) {
//           const newAdmin: Admin = {
//             id: result.data.id,
//             name: result.data.name,
//             email: result.data.email,
//             created_at: result.data.created_at,
//             updated_at: result.data.updated_at
//           };
//           setAdmins((prev) => [...prev, newAdmin]);
//         }

//         setIsCreateDialogOpen(false);
//         resetForm();
//       } else {
//         toast({
//           title: `Error ${response.status}`,
//           description: result.detail || 'Failed to create admin.',
//           variant: 'destructive',
//         });
//       }
//     } catch (error: any) {
//       console.error('Error:', error);
//       toast({
//         title: 'Network Error',
//         description: error.message || 'Unable to connect to the server. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update admin
//   const handleUpdateAdmin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedAdmin) return;
//     if (!validateEmail(formData.email)) {
//       toast({
//         title: 'Invalid email',
//         description: 'Please enter a valid email address.',
//         variant: 'destructive',
//       });
//       return;
//     }
//     if (formData.password && formData.password.length < 6) {
//       toast({
//         title: 'Invalid password',
//         description: 'Password must be at least 6 characters long.',
//         variant: 'destructive',
//       });
//       return;
//     }
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('admin_token');
//       if (!token) {
//         toast({
//           title: 'Authentication Error',
//           description: 'No token found. Please log in first.',
//           variant: 'destructive',
//         });
//         return;
//       }

//       const response = await fetch(`http://127.0.0.1:8000/api/admins/${selectedAdmin.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           password: formData.password || undefined,
//         }),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast({
//           title: 'Success',
//           description: result.message || 'Admin updated successfully!',
//         });

//         // Use the actual updated data from backend
//         if (result.data) {
//           setAdmins((prev) =>
//             prev.map((admin) =>
//               admin.id === selectedAdmin.id
//                 ? {
//                     id: result.data.id,
//                     name: result.data.name,
//                     email: result.data.email,
//                     created_at: result.data.created_at,
//                     updated_at: result.data.updated_at
//                   }
//                 : admin
//             )
//           );
//         }

//         setIsEditDialogOpen(false);
//         resetForm();
//         setSelectedAdmin(null);
//       } else {
//         toast({
//           title: `Error ${response.status}`,
//           description: result.detail || 'Failed to update admin.',
//           variant: 'destructive',
//         });
//       }
//     } catch (error: any) {
//       console.error('Update Error:', error);
//       toast({
//         title: 'Network Error',
//         description: error.message || 'Unable to connect to the server. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete admin
//   const handleDeleteAdmin = async () => {
//     if (!selectedAdmin) return;

//     try {
//       setLoading(true);
//       const token = localStorage.getItem('admin_token');
//       if (!token) {
//         toast({
//           title: 'Authentication Error',
//           description: 'No token found. Please log in first.',
//           variant: 'destructive',
//         });
//         return;
//       }

//       const response = await fetch(`http://127.0.0.1:8000/api/admins/${selectedAdmin.id}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const result = await response.json();

//       if (response.ok) {
//         toast({
//           title: 'Success',
//           description: result.message || 'Admin deleted successfully!',
//         });

//         setAdmins((prev) => prev.filter((admin) => admin.id !== selectedAdmin.id));
//         setIsDeleteDialogOpen(false);
//         setSelectedAdmin(null);
//       } else {
//         toast({
//           title: `Error ${response.status}`,
//           description: result.detail || 'Failed to delete admin.',
//           variant: 'destructive',
//         });
//       }
//     } catch (error: any) {
//       toast({
//         title: 'Network Error',
//         description: error.message || 'Unable to connect to the server. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEditDialog = (admin: Admin) => {
//     setSelectedAdmin(admin);
//     setFormData({
//       name: admin.name,
//       email: admin.email,
//       password: '',
//     });
//     setIsEditDialogOpen(true);
//   };

//   const openDeleteDialog = (admin: Admin) => {
//     setSelectedAdmin(admin);
//     setIsDeleteDialogOpen(true);
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
//           <p className="text-muted-foreground mt-1">
//             Manage system administrators and their permissions
//           </p>
//         </div>
//         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="w-4 h-4 mr-2" />
//               Add New Admin
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Admin</DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleCreateAdmin} className="space-y-4">
//               <div>
//                 <Label htmlFor="create-name">Full Name</Label>
//                 <Input
//                   id="create-name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="Enter full name"
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="create-email">Email</Label>
//                 <Input
//                   id="create-email"
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   placeholder="Enter email address"
//                   required
//                 />
//               </div>
//               <div className="relative">
//                 <Label htmlFor="create-password">Password</Label>
//                 <Input
//                   id="create-password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   placeholder="Enter password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={togglePasswordVisibility}
//                   className="absolute right-2 top-8 text-gray-500"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//               <div className="flex justify-end space-x-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setIsCreateDialogOpen(false);
//                     resetForm();
//                   }}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={loading}>
//                   {loading ? 'Creating...' : 'Create Admin'}
//                 </Button>
//               </div>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card className="p-6">
//         <div className="flex items-center space-x-3 mb-6">
//           <div className="p-2 bg-primary/10 rounded-lg">
//             <Users className="w-6 h-6 text-primary" />
//           </div>
//           <div>
//             <h3 className="font-semibold text-lg">System Administrators</h3>
//             <p className="text-sm text-muted-foreground">
//               {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
//             </p>
//           </div>
//         </div>

//         {admins.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-muted-foreground">No admins found. Create your first admin above.</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {admins.map((admin) => (
//               <div
//                 key={admin.id}
//                 className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
//               >
//                 <div className="flex-1">
//                   <h4 className="font-medium">{admin.name}</h4>
//                   <p className="text-sm text-muted-foreground">{admin.email}</p>
//                   <div className="flex space-x-4 mt-1 text-xs text-muted-foreground">
//                     <span>ID: {admin.id}</span>
//                     {admin.updated_at && (
//                       <span>Updated: {new Date(admin.updated_at).toLocaleDateString()}</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => openEditDialog(admin)}
//                     disabled={loading}
//                   >
//                     <Edit className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => openDeleteDialog(admin)}
//                     disabled={loading}
//                     className="text-destructive hover:text-destructive"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Admin</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleUpdateAdmin} className="space-y-4">
//             <div>
//               <Label htmlFor="edit-name">Full Name</Label>
//               <Input
//                 id="edit-name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 placeholder="Enter full name"
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="edit-email">Email</Label>
//               <Input
//                 id="edit-email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 placeholder="Enter email address"
//                 required
//               />
//             </div>
//             <div className="relative">
//               <Label htmlFor="edit-password">Password</Label>
//               <Input
//                 id="edit-password"
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 placeholder="Enter new password (leave blank to keep current)"
//               />
//               <button
//                 type="button"
//                 onClick={togglePasswordVisibility}
//                 className="absolute right-2 top-8 text-gray-500"
//               >
//                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//               </button>
//             </div>
//             <div className="flex justify-end space-x-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setIsEditDialogOpen(false);
//                   resetForm();
//                   setSelectedAdmin(null);
//                 }}
//                 disabled={loading}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={loading}>
//                 {loading ? 'Updating...' : 'Update Admin'}
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Admin</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete admin "{selectedAdmin?.name}"? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel
//               onClick={() => {
//                 setIsDeleteDialogOpen(false);
//                 setSelectedAdmin(null);
//               }}
//               disabled={loading}
//             >
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDeleteAdmin}
//               disabled={loading}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               {loading ? 'Deleting...' : 'Delete'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { adminApi, Admin, ApiError } from "@/api/apiService";

interface AdminFormData {
  name: string;
  email: string;
  password: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingAdmins, setFetchingAdmins] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalAdmins: 0,
  });
  const { toast } = useToast();

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, [pagination.page]);

  const fetchAdmins = async () => {
    try {
      setFetchingAdmins(true);
      const response = await adminApi.getAllAdmins(
        pagination.page,
        pagination.limit
      );

      setAdmins(response.admins);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.total_pages,
        totalAdmins: response.total_admins,
      }));
    } catch (error) {
      handleApiError(error, "Failed to fetch admins");
    } finally {
      setFetchingAdmins(false);
    }
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    if (error instanceof ApiError) {
      // Handle specific status codes
      switch (error.status) {
        case 401:
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          // Optionally redirect to login
          // window.location.href = '/login';
          break;
        case 403:
          toast({
            title: "Permission Denied",
            description:
              error.detail ||
              "You do not have permission to perform this action.",
            variant: "destructive",
          });
          break;
        case 404:
          toast({
            title: "Not Found",
            description:
              error.detail || "The requested resource was not found.",
            variant: "destructive",
          });
          break;
        case 400:
          toast({
            title: "Invalid Request",
            description:
              error.detail || "Please check your input and try again.",
            variant: "destructive",
          });
          break;
        case 0:
          // Network error
          toast({
            title: "Connection Error",
            description: error.detail,
            variant: "destructive",
          });
          break;
        default:
          toast({
            title: `Error ${error.status}`,
            description: error.detail || defaultMessage,
            variant: "destructive",
          });
      }
    } else {
      toast({
        title: "Unexpected Error",
        description: defaultMessage,
        variant: "destructive",
      });
    }
    console.error("API Error:", error);
  };

  // Updated email validation with stricter rules (enforces @, valid domain, and TLD like .com/.in)
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = (isUpdate: boolean = false): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Validation Error",
        description:
          "Please enter a valid email address (must include @ and end with a domain like .com or .in).",
        variant: "destructive",
      });
      return false;
    }

    if (!isUpdate && formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (isUpdate && formData.password && formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
    setShowPassword(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await adminApi.createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Success",
        description: response.message || "Admin created successfully!",
      });

      // Refresh the admin list
      await fetchAdmins();

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      handleApiError(error, "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    if (!validateForm(true)) return;

    try {
      setLoading(true);

      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await adminApi.updateAdmin(selectedAdmin.id, updateData);

      toast({
        title: "Success",
        description: response.message || "Admin updated successfully!",
      });

      // Refresh the admin list
      await fetchAdmins();

      setIsEditDialogOpen(false);
      resetForm();
      setSelectedAdmin(null);
    } catch (error) {
      handleApiError(error, "Failed to update admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      setLoading(true);
      const response = await adminApi.deleteAdmin(selectedAdmin.id);

      toast({
        title: "Success",
        description: response.message || "Admin deleted successfully!",
      });

      // Refresh the admin list
      await fetchAdmins();

      setIsDeleteDialogOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      handleApiError(error, "Failed to delete admin");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Management
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Manage system administrators and their permissions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={fetchAdmins}
              disabled={fetchingAdmins}
              className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${fetchingAdmins ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm">
                  <Plus className="w-4 h-4" />
                  Add New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md sm:max-w-lg">
                <DialogHeader className="border-b border-gray-200 pb-4">
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Add New Admin
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4 p-1">
                  <div className="space-y-2">
                    <Label
                      htmlFor="create-name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="create-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="create-email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email *
                    </Label>
                    <Input
                      id="create-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      required
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="create-password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="create-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password (min. 6 characters)"
                        required
                        className="border-gray-300 focus:border-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        resetForm();
                      }}
                      disabled={loading}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        "Create Admin"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">System Administrators</h3>
            <p className="text-sm text-muted-foreground">
              {pagination.totalAdmins} admin
              {pagination.totalAdmins !== 1 ? "s" : ""} registered
            </p>
          </div>
        </div>

        {fetchingAdmins ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No admins found. Create your first admin above.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{admin.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {admin.email}
                    </p>
                    <div className="flex space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>ID: {admin.id.slice(0, 8)}...</span>
                      {admin.updated_at && (
                        <span>
                          Updated:{" "}
                          {new Date(admin.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(admin)}
                      disabled={loading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(admin)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || fetchingAdmins}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages || fetchingAdmins
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAdmin} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="relative">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-8 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                  setSelectedAdmin(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Admin"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete admin "{selectedAdmin?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedAdmin(null);
              }}
              disabled={loading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
