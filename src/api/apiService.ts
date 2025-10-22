// apiService.ts
// Updated with full Project interface and write operations for projects

const API_BASE_URL_WRITE = 'http://127.0.0.1:8000/api/admins';
const API_BASE_URL_READ = 'http://127.0.0.1:8001/api/admin';

export interface Admin {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface AdminListResponse {
  message: string;
  total_admins: number;
  admins: Admin[];
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  detail?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public originalError?: any
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T,>(response: Response): Promise<T> => {
  let data: any;
  
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError(
      response.status,
      `Server returned ${response.status}: Unable to parse response`
    );
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.detail || data.message || 'An error occurred',
      data
    );
  }

  return data;
};

const handleNetworkError = (error: any): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    throw new ApiError(
      0,
      'Unable to connect to the server. Please check your connection and try again.'
    );
  }
  
  throw new ApiError(
    500,
    error.message || 'An unexpected error occurred'
  );
};

export const adminApi = {
  // Create Admin (Port 8000)
  async createAdmin(data: CreateAdminRequest): Promise<ApiResponse<Admin>> {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL_WRITE}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && getAuthHeader()),
        },
        body: JSON.stringify(data),
      });

      return handleResponse<ApiResponse<Admin>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update Admin (Port 8000)
  async updateAdmin(
    adminId: string,
    data: UpdateAdminRequest
  ): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${API_BASE_URL_WRITE}/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      return handleResponse<ApiResponse<Admin>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Delete Admin (Port 8000)
  async deleteAdmin(adminId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL_WRITE}/${adminId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      return handleResponse<ApiResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get All Admins (Port 8001)
  async getAllAdmins(
    page: number = 1,
    limit: number = 10
  ): Promise<AdminListResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL_READ}/all?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      return handleResponse<AdminListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Admin by ID (Port 8001)
  async getAdminById(adminId: string): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${API_BASE_URL_READ}/${adminId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ApiResponse<Admin>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Current Admin Profile (Port 8001)
  async getMyProfile(): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${API_BASE_URL_READ}/profile/me`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ApiResponse<Admin>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};

// -------------------------------------------------------------------------------
// Scheme-related code
// -------------------------------------------------------------------------------

export interface Scheme {
  id: string;
  project_id: string;
  scheme_type: 'single_payment' | 'installment';
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface SchemeListResponse {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  total_schemes: number;
  schemes: Scheme[];
}

export interface CreateSchemeRequest {
  project_id: string;
  scheme_type: 'single_payment' | 'installment';
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface SchemeResponse {
  message: string;
  scheme: Scheme;
}

export interface UpdateSchemeRequest {
  scheme_type: 'single_payment' | 'installment';
  scheme_name: string;
  area_sqft: number;
  booking_advance: number;
  balance_payment_days: number | null;
  total_installments: number | null;
  monthly_installment_amount: number | null;
  rental_start_month: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// Constants for Scheme APIs
const SCHEME_API_BASE_URL_WRITE = 'http://127.0.0.1:8000/api/schemes';
const SCHEME_API_BASE_URL_READ = 'http://127.0.0.1:8001/api/investment-schemes';

export const schemeApi = {
  // Get All Schemes (Port 8001) - with optional project_id filter
  async getAllSchemes(
    project_id?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SchemeListResponse> {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (project_id) {
        params.append('project_id', project_id);
      }
      const response = await fetch(`${SCHEME_API_BASE_URL_READ}/all?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<SchemeListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Schemes by Project ID (Port 8001)
  async getAllSchemesByProject(
    project_id: string,
    page: number = 1,
    limit: number = 5
  ): Promise<SchemeListResponse> {
    try {
      const params = new URLSearchParams({ project_id, page: page.toString(), limit: limit.toString() });
      const response = await fetch(`${SCHEME_API_BASE_URL_READ}/project?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<SchemeListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Scheme by ID (Port 8001)
  async getSchemeById(schemeId: string): Promise<SchemeResponse> {
      try {
        const response = await fetch(`${SCHEME_API_BASE_URL_READ}/${schemeId}`, {
          method: 'GET',
          headers: getAuthHeader(),
        });

        return handleResponse<SchemeResponse>(response);
      } catch (error) {
        return handleNetworkError(error);
      }
    },

  // Create Scheme (Port 8000)
  async createScheme(data: CreateSchemeRequest): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${SCHEME_API_BASE_URL_WRITE}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && getAuthHeader()),
        },
        body: JSON.stringify(data),
      });

      return handleResponse<ApiResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update Scheme (Port 8000)
  async updateScheme(
    schemeId: string,
    data: UpdateSchemeRequest
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`${SCHEME_API_BASE_URL_WRITE}/${schemeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      return handleResponse<ApiResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Delete Scheme (Port 8000)
 async deleteScheme(schemeId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${SCHEME_API_BASE_URL_WRITE}/${schemeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ is_active: false }),
      });

      return handleResponse<ApiResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};

// -------------------------------------------------------------------------------
// Project-related code
// -------------------------------------------------------------------------------

export interface PricingDetails {
  rent_per_sqft?: number;
  sale_price_per_sqft?: number;
  maintenance_per_sqft?: number;
  sqft?: number;
}

export interface GalleryImage {
  url: string;
  filename?: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface Amenity {
  name: string;
  description: string;
  icon: string;
}

export interface QuickInfo {
  possession_date?: string;
  construction_status?: string;
  floors_available?: string[];
  rera_number?: string;
  building_permission?: string;
}

export interface CreateProjectRequest {
  title: string;
  location: string;
  description: string;
  long_description: string;
  website_url: string;
  status: 'available' | 'sold_out' | 'coming_soon';
  base_price: number;
  property_type: 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';
  has_rental_income: boolean;
  pricing_details?: PricingDetails;
  quick_info?: QuickInfo;
  gallery_images?: GalleryImage[];
  key_highlights?: string[];
  features?: string[];
  investment_highlights?: string[];
  amenities?: Amenity[];
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  rera_number: string;
  building_permission: string;
  // Add these required fields
  floor_number: number;
  project_code: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  description: string;
  long_description: string;
  website_url: string;
  status: 'available' | 'sold_out' | 'coming_soon';
  base_price: number;
  property_type: 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';
  has_rental_income: boolean;
  pricing_details: PricingDetails | null;
  quick_info: QuickInfo | null;
  gallery_images: GalleryImage[] | null;
  key_highlights: string[] | null;
  features: string[] | null;
  investment_highlights: string[] | null;
  amenities: Amenity[] | null;
  total_units: number;
  available_units: number;
  sold_units: number;
  reserved_units: number;
  rera_number: string;
  building_permission: string;
  // Add these fields
  floor_number: number;
  project_code: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProjectResponse {
  message: string;
  data?: Project;
}

export interface ProjectListResponse {
  message: string;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
  total_projects: number;
  projects: Project[];
}

export interface UpdateProjectRequest {
  title?: string;
  location?: string;
  description?: string;
  long_description?: string;
  website_url?: string;
  status?: 'available' | 'sold_out' | 'coming_soon';
  base_price?: number;
  property_type?: 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';
  has_rental_income?: boolean;
  pricing_details?: PricingDetails;
  quick_info?: QuickInfo;
  gallery_images?: GalleryImage[];
  key_highlights?: string[];
  features?: string[];
  investment_highlights?: string[];
  amenities?: Amenity[];
  total_units?: number;
  available_units?: number;
  sold_units?: number;
  reserved_units?: number;
  rera_number?: string;
  building_permission?: string;
  is_active?: boolean;
}

const PROJECT_API_BASE_URL_READ = 'http://127.0.0.1:8001/api/projects';
const PROJECT_API_BASE_URL_WRITE = 'http://127.0.0.1:8000/api/projects';

export const projectApi = {
  // Get All Projects (Port 8001)
  async getAllProjects(
    page: number = 1,
    limit: number = 100,
    property_type?: string,
    status_filter?: string,
    min_price?: number,
    max_price?: number
  ): Promise<ProjectListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (property_type) params.append('property_type', property_type);
      if (status_filter) params.append('status_filter', status_filter);
      if (min_price) params.append('min_price', min_price.toString());
      if (max_price) params.append('max_price', max_price.toString());

      const response = await fetch(
        `${PROJECT_API_BASE_URL_READ}/all?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      return handleResponse<ProjectListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Project by ID (Port 8001)
  async getProjectById(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${PROJECT_API_BASE_URL_READ}/${projectId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ProjectResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Projects by Property Type (Port 8001)
  async getProjectsByPropertyType(
    propertyType: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProjectListResponse> {
    try {
      const response = await fetch(
        `${PROJECT_API_BASE_URL_READ}/property-type/${propertyType}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      return handleResponse<ProjectListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Projects by Status (Port 8001)
  async getProjectsByStatus(
    status: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProjectListResponse> {
    try {
      const params = new URLSearchParams({ 
        status, 
        page: page.toString(), 
        limit: limit.toString() 
      });
      const response = await fetch(`${PROJECT_API_BASE_URL_READ}/by-status?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ProjectListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Search Projects (Port 8001)
  async searchProjects(
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProjectListResponse> {
    try {
      const params = new URLSearchParams({ 
        search_term: searchTerm, 
        page: page.toString(), 
        limit: limit.toString() 
      });
      const response = await fetch(`${PROJECT_API_BASE_URL_READ}/search?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ProjectListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Create Project (Port 8000)
  async createProject(data: CreateProjectRequest, images?: File[]): Promise<ProjectResponse> {
    try {
      const formData = new FormData();
      
      // Add project data as JSON string
      formData.append('project', JSON.stringify(data));
      
      // Add images if provided
      if (images) {
        images.forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${PROJECT_API_BASE_URL_WRITE}/create`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      return handleResponse<ProjectResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update Project (Port 8000)
  async updateProject(
    projectId: string,
    data: UpdateProjectRequest,
    images?: File[]
  ): Promise<ProjectResponse> {
    try {
      const formData = new FormData();
      formData.append('request', JSON.stringify(data));
      
      if (images) {
        images.forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await fetch(`${PROJECT_API_BASE_URL_WRITE}/${projectId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: formData,
      });

      return handleResponse<ProjectResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Delete Project (Port 8000)
  async deleteProject(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${PROJECT_API_BASE_URL_WRITE}/${projectId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
       const result = await handleResponse<ProjectResponse>(response);
    
    // Ensure consistent response format
    return {
      message: result.message || 'Project deleted successfully',
      data: result.data
    };

    } catch (error) {
      return handleNetworkError(error);
    }
  },
};

export { ApiError };