import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Save, Edit, X, Mail, Calendar, Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi, ApiResponse, Admin, UpdateAdminRequest } from "../api/apiService";

interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export function AdminProfile() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response: ApiResponse<Admin> = await adminApi.getMyProfile();
      
      if (response.data) {
        const profileData: AdminProfileData = {
          id: response.data.id,
          name: response.data.name || '',
          email: response.data.email,
          created_at: response.data.created_at || '',
          updated_at: response.data.updated_at || ''
        };
        
        setProfile(profileData);
        setFormData({
          name: response.data.name || '',
          email: response.data.email,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.detail || 'Failed to load profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage({ type: '', text: '' });

      // Create the update data exactly as backend expects
      const updateData: UpdateAdminRequest = {
        name: formData.name || undefined,
        email: formData.email || undefined,
      };

      // Only include password if it's provided and not empty
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      console.log('Sending update data:', updateData);

      const response: ApiResponse<Admin> = await adminApi.updateAdmin(
        profile?.id || '', 
        updateData
      );

      if (response.data) {
        const updatedProfile: AdminProfileData = {
          id: response.data.id,
          name: response.data.name || '',
          email: response.data.email,
          created_at: response.data.created_at || '',
          updated_at: response.data.updated_at || ''
        };
        
        setProfile(updatedProfile);
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        
        // Refresh the profile data to get updated timestamps
        setTimeout(() => {
          fetchProfile();
        }, 500);
      }
    } catch (error: any) {
      console.error('Update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.detail || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      password: '',
      confirmPassword: ''
    });
    setMessage({ type: '', text: '' });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-300",
            message.type === 'error' 
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          )}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {message.type === 'error' ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Shield className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Lock className="w-5 h-5 text-gray-700" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">Change Password</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        Leave password fields empty if you don't want to change your password.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                            placeholder="Enter new password (optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 border-t">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                        <User className="w-10 h-10 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{profile?.name || 'No Name'}</h3>
                        <p className="text-gray-600 flex items-center justify-center sm:justify-start space-x-2 mt-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm sm:text-base break-all">{profile?.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Member Since</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Last Updated</span>
                        </div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {profile?.updated_at ? formatDate(profile.updated_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium text-gray-700">Role</span>
                  <span className="text-sm font-bold text-gray-900">Administrator</span>
                </div>
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
}