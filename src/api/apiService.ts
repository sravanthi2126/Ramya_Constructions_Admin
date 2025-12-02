// apiService.ts
// Updated with full Project interface and write operations for projects

// Base URLs
export const BASE_URL_WRITE = 'http://127.0.0.1:8000';
export const BASE_URL_READ = 'http://127.0.0.1:8001';

// API Paths
export const API_PATHS = {
  ADMINS: '/api/admins',
  ADMIN: '/api/admin',
  PROJECTS: '/api/projects',
  SCHEMES: '/api/schemes',
  INVESTMENT_SCHEMES: '/api/admin/investment-schemes',
  PURCHASED_UNIT: '/api/purchased-unit',
  PAYMENTS: '/api/payments',
  LEGAL_AGREEMENTS: '/api/legal-agreements',
  LEGAL_AGREEMENTS_LIST: '/api/legal-agreements/list',
  CONTACT_INQUIRY: '/api/contact-inquiry',
  USER_PROFILES: '/api/admin/user_profiles',
  USERMANAGEMENT: '/api/admin/usermanagement',
  AGENTS: '/api/admin/agents',
} as const;

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

export interface MonthlyInvestment {
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export interface DashboardSummaryResponse {
  total_projects: number;
  active_projects: number;
  active_schemes: number;
  purchased_units: number;
  total_investment: number;
  users_paid_amount: number;
  completed_investments: number;
  monthly_investment: MonthlyInvestment;
}

export interface ContactInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "in_progress" | "converted" | "closed";
  follow_up_date: string | null;
  created_at: string;
  updated_at?: string;
}


export interface ContactInquiryListResponse {
  message: string;
  meta: {
    page: number;
    limit: number;
    total_records: number;
  };
  data: ContactInquiry[];
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

export const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const handleResponse = async <T,>(response: Response): Promise<T> => {
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

export const handleNetworkError = (error: any): never => {
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
  // Create Admin (Write)
  async createAdmin(data: CreateAdminRequest): Promise<ApiResponse<Admin>> {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.ADMINS}/create`, {
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

  // Update Admin (Write)
  async updateAdmin(
    adminId: string,
    data: UpdateAdminRequest
  ): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.ADMINS}/${adminId}`, {
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

  // Delete Admin (Write)
  async deleteAdmin(adminId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.ADMINS}/${adminId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      return handleResponse<ApiResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get All Admins (Read)
  async getAllAdmins(
    page: number = 1,
    limit: number = 10
  ): Promise<AdminListResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.ADMIN}/all?page=${page}&limit=${limit}`,
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

  // Get Admin by ID (Read)
  async getAdminById(adminId: string): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.ADMIN}/${adminId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ApiResponse<Admin>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Current Admin Profile (Read)
  async getMyProfile(): Promise<ApiResponse<Admin>> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.ADMIN}/profile/me`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ApiResponse<Admin>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async getSummary(): Promise<DashboardSummaryResponse> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.ADMIN}/dashboard/summary`, {
        method: "GET",
        headers: getAuthHeader(),
      });

      return handleResponse<DashboardSummaryResponse>(response);
    } catch (err) {
      return handleNetworkError(err);
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
  total_active_schemes: number;
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

export const schemeApi = {
  // Get All Schemes (Read) - with optional project_id filter
  async getAllSchemes(
    page: number = 1,
    limit: number = 9,
    project_id?: string
  ): Promise<SchemeListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (project_id) {
        params.append('project_id', project_id);
      }

      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.INVESTMENT_SCHEMES}/all?${params.toString()}`,
        {
          method: 'GET',
          headers: getAuthHeader(),
        }
      );

      return handleResponse<SchemeListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Schemes by Project ID (Read)
  async getAllSchemesByProject(
    project_id: string,
    page: number = 1,
    limit: number = 3
  ): Promise<SchemeListResponse> {
    try {
      const params = new URLSearchParams({ project_id, page: page.toString(), limit: limit.toString() });
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.INVESTMENT_SCHEMES}/project?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<SchemeListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Scheme by ID (Read)
  async getSchemeById(schemeId: string): Promise<SchemeResponse> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.INVESTMENT_SCHEMES}/${schemeId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<SchemeResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Create Scheme (Write)
  async createScheme(data: CreateSchemeRequest): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.SCHEMES}/create`, {
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

  // Update Scheme (Write)
  async updateScheme(
    schemeId: string,
    data: UpdateSchemeRequest
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.SCHEMES}/${schemeId}`, {
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

  // Delete Scheme (Write)
  async deleteScheme(schemeId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.SCHEMES}/${schemeId}`, {
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

export interface JointOwner {
  user_profile_id: string;
  relation: string;
  share_percentage?: number;
}

export interface PurchasedUnit {
  id: string;
  unit_number: string;
  project_id: string;
  scheme_id: string;
  scheme_type: string;
  purchaser_user_id: string;
  user_profile_id: string | null;
  is_joint_ownership: boolean;
  joint_owners: JointOwner[] | null;
  number_of_units: number;
  total_area_sqft: number;
  total_investment: number;
  purchase_date: string;
  monthly_rental: number;
  rental_start_date: string;
  payment_status: 'none' | 'advance_paid' | 'partially_paid' | 'fully_paid';
  unit_status: 'none' | 'payment_ongoing' | 'completed';
  created_at: string;
  updated_at: string;
  user_paid: number;
  balance_amount: number;
  floor_number: number;
}

export interface PurchasedUnitResponse {
  message: string;
  data: PurchasedUnit | PurchasedUnit[];
}

export interface CreateUnitRequest {
  project_id: string;
  scheme_id: string;
  is_joint_ownership: boolean;
  number_of_units: number;
  purchaser_user_id?: string;
  joint_owners?: JointOwner[];
}

export interface Payment {
  transaction_type: "advance" | "installment" | "balance_payment" | "penalty" | "rebate";
  order_id: string;
  amount: number;
  payment_date: string;
  due_date: string | null;
  payment_method: string;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  installment_number: number | null;
  penalty_amount: number;
  rebate_amount: number;
  receipt_id: string | null;
}

export interface PaymentHistoryResponse {
  unit_number: string;
  total_payments: number;
  payments: Payment[];
  next_installment: {
    installment_number: number;
    due_date: string;
    amount: number;
  } | null;
}

// -------------------------------------------------------------------------------
// Legal Agreements API
// -------------------------------------------------------------------------------

export interface LegalAgreement {
  id: string;
  unit_id: string;
  agreement_type: string;
  document_name: string;
  file_path: string;
  signatories: string[];
  agreement_date: string;
  valid_until: string;
  status: 'draft' | 'executed' | 'signed' | 'pending_signature';
  uploaded_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLegalAgreementRequest {
  unit_id: string;
  agreement_type: string;
  document_name: string;
  agreement_date: string;
  valid_until: string;
  status: 'draft' | 'executed' | 'signed' | 'pending_signature';
}

export interface UpdateLegalAgreementRequest {
  unit_id?: string;
  agreement_type?: string;
  document_name?: string;
  signatories?: string[];
  agreement_date?: string;
  valid_until?: string;
  status?: 'draft' | 'pending_signature' | 'signed' | 'executed';
}

export interface LegalAgreementResponse {
  success: boolean;
  message: string;
  data: LegalAgreement;
}

export interface LegalAgreementListResponse {
  success: boolean;
  message: string;
  total: number;
  data: LegalAgreement[];
  page?: number;
  limit?: number;
  total_pages?: number;
}

export const legalAgreementsApi = {
  // Get All Legal Agreements with filters (Read)
  async getAllAgreements(
    unit_id?: string,
    agreement_type?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<LegalAgreementListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (unit_id) params.append('unit_id', unit_id);
      if (agreement_type) params.append('agreement_type', agreement_type);
      if (status) params.append('status', status);

      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.LEGAL_AGREEMENTS_LIST}/?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      return handleResponse<LegalAgreementListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Legal Agreements by Unit ID (Read)
  async getAgreementsByUnitId(unitId: string): Promise<LegalAgreementListResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.LEGAL_AGREEMENTS_LIST}/?unit_id=${unitId}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      return handleResponse<LegalAgreementListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Legal Agreement by ID (Read)
  async getAgreementById(agreementId: string): Promise<LegalAgreementResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.LEGAL_AGREEMENTS_LIST}/${agreementId}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      return handleResponse<LegalAgreementResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Create Legal Agreement (Write)
  async createAgreement(
    agreementData: CreateLegalAgreementRequest,
    file: File
  ): Promise<LegalAgreementResponse> {
    try {
      const formData = new FormData();

      // Append the agreement data as JSON
      formData.append("agreement", JSON.stringify(agreementData));

      // Append the file
      formData.append("file", file);

      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.LEGAL_AGREEMENTS}/create`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      return handleResponse<LegalAgreementResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update Legal Agreement (Write)
  async updateAgreement(
    agreementId: string,
    agreementData: UpdateLegalAgreementRequest,
    file?: File
  ): Promise<LegalAgreementResponse> {
    try {
      const formData = new FormData();

      // Append the agreement data as JSON
      formData.append("request", JSON.stringify(agreementData));

      // Append the file if provided
      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(
        `${BASE_URL_WRITE}${API_PATHS.LEGAL_AGREEMENTS}/${agreementId}`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeader(),
          },
          body: formData,
        }
      );

      return handleResponse<LegalAgreementResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Delete Legal Agreement (Write)
  async deleteAgreement(agreementId: string): Promise<LegalAgreementResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_WRITE}${API_PATHS.LEGAL_AGREEMENTS}/${agreementId}`,
        {
          method: "DELETE",
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      return handleResponse<LegalAgreementResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Download Agreement File (Read)
  async downloadAgreement(filePath: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.LEGAL_AGREEMENTS_LIST}/download/${encodeURIComponent(filePath)}`,
        {
          method: "GET",
          headers: getAuthHeader(),
        }
      );

      if (!response.ok) {
        throw new ApiError(response.status, "Failed to download file");
      }

      return await response.blob();
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
  total_sqft: number;      // CHANGED from total_units
  available_sqft: number;  // CHANGED from available_units
  sold_sqft: number;       // CHANGED from sold_units
  reserved_sqft: number;   // CHANGED from reserved_units
  rera_number: string;
  building_permission: string;
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

export const projectApi = {
  // Get All Projects (Read)
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
        `${BASE_URL_READ}${API_PATHS.PROJECTS}/all?${params.toString()}`,
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

  // Get Project by ID (Read)
  async getProjectById(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.PROJECTS}/${projectId}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ProjectResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get Projects by Property Type (Read)
  async getProjectsByPropertyType(
    propertyType: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ProjectListResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.PROJECTS}/property-type/${propertyType}?page=${page}&limit=${limit}`,
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

  // Get Projects by Status (Read)
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
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.PROJECTS}/by-status?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ProjectListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Search Projects (Read)
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
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.PROJECTS}/search?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeader(),
      });

      return handleResponse<ProjectListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Create Project (Write)
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

      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.PROJECTS}/create`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });

      return handleResponse<ProjectResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update Project (Write)
// Update Project (Write) - CORRECTED VERSION
async updateProject(
  projectId: string,
  formData: FormData  // Changed from (data: UpdateProjectRequest, images?: File[])
): Promise<ProjectResponse> {
  try {
    console.log('API: updateProject called with projectId:', projectId);
    console.log('API: FormData being sent:');
    
    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      if (pair[0] === 'request') {
        try {
          console.log(pair[0], JSON.parse(pair[1] as string));
        } catch {
          console.log(pair[0], pair[1]);
        }
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    
    const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.PROJECTS}/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeader(),  // Important: Don't set Content-Type header for FormData
      body: formData,
    });

    const result = await handleResponse<ProjectResponse>(response);
    console.log('API: Update response:', result);
    return result;
  } catch (error) {
    console.error('API: Update project error:', error);
    return handleNetworkError(error);
  }
},


  // Delete Project (Write)
  async deleteProject(projectId: string): Promise<ProjectResponse> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.PROJECTS}/${projectId}`, {
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

/* ----------------------------------------------
   CONTACT INQUIRY API
------------------------------------------------ */

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  status: string;
  created_at: string;
}

export interface InquiryListResponse {
  message: string;
  meta: {
    page: number;
    limit: number;
    total_records: number;
  };
  data: Inquiry[];
}

export const inquiryApi = {
  // Get all inquiries (Read)
  async getInquiries(
    page: number = 1,
    limit: number = 10,
    status?: string,
    startDate?: string
  ): Promise<InquiryListResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));

      if (status && status !== "all") params.append("status", status);
      if (startDate) params.append("start_date", startDate);

      const url = `${BASE_URL_READ}${API_PATHS.CONTACT_INQUIRY}/?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeader(),
      });

      return handleResponse<InquiryListResponse>(response);
    } catch (err) {
      return handleNetworkError(err);
    }
  },

  // Update Inquiry Status (Write)
  async updateStatus(
    inquiryId: string,
    status: string
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_WRITE}${API_PATHS.CONTACT_INQUIRY}/update-status/${inquiryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ status }),
        }
      );

      return handleResponse<ApiResponse>(response);
    } catch (err) {
      return handleNetworkError(err);
    }
  },
};

// -------------------------------------------------------------------------------
// User Management API
// -------------------------------------------------------------------------------

export interface UserProfileResponse {
  profiles: any[];
  total_profiles: number;
  page: number;
  limit: number;
  total_pages: number;
  is_previous: boolean;
  is_next: boolean;
}

export interface UserSummary {
  total_users: number;
  active_users: number;
  kyc_verified: number;
  kyc_pending: number;
  total_profiles: number;
}

export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  rera_id: string;
  specialization: string;
  commission_rate: string;
  status: string;
  pan_number?: string;
  aadhar_number?: string;
  experience_years?: number;
  about_text?: string;
  agent_documents?: any[];
  documents?: any[];
  files?: any[];
  rera_certificate?: string;
  pan_card?: string;
  aadhar_card?: string;
  resume_cv?: string;
}

export interface AgentResponse {
  agents: Agent[];
  page?: number;
  page_size?: number;
  total?: number;
  total_pages?: number;
}

export const userApi = {
  async getUsers(page = 1, limit = 20): Promise<UserProfileResponse> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const url = `${BASE_URL_READ}${API_PATHS.USER_PROFILES}/all?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();

      // Normalize to our expected shape
      return {
        profiles: json.profiles || [],
        total_profiles: json.total_profiles || 0,
        page: json.page || page,
        limit: json.limit || limit,
        total_pages: json.total_pages || 1,
        is_previous: json.is_previous || false,
        is_next: json.is_next || false,
      };
    } catch (err) {
      console.error("getUsers error:", err);
      throw err;
    }
  },

  async getSummary(): Promise<UserSummary> {
    const response = await fetch(`${BASE_URL_READ}${API_PATHS.USERMANAGEMENT}/summary`, {
      headers: { accept: "application/json", ...getAuthHeader() },
    });
    if (!response.ok) throw new Error("Summary failed");
    return response.json();
  },

  // 1. getAllAgents → Use WRITE server (8000)
  async getAllAgents(page = 1, pageSize = 10): Promise<AgentResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize)
    });

    // HARDCODE THE CORRECT PATH → /api/agents/all (NOT /api/admin/agents)
    const response = await fetch(`${BASE_URL_READ}${API_PATHS.AGENTS}/all?${params.toString()}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();

    return {
      agents: data.agents || [],
      page: data.page || page,
      page_size: data.page_size || pageSize,
      total: data.total || 0,
      total_pages: data.total_pages || 1,
    };
  } catch (err) {
    console.error("getAllAgents error:", err);
    throw err;
  }
},

  // 2. getAgentDetails → Use WRITE server (8000)
 async getAgentDetails(agentId: string): Promise<Agent> {
  try {
    const response = await fetch(`${BASE_URL_READ}/api/agents/${agentId}`, {  // ← /api/agents/
      method: "GET",
      headers: {
        accept: "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("getAgentDetails error:", err);
    throw err;
  }
},

  // 3. updateAgentStatus → Also must use WRITE server (8000) — currently using READ!
  async updateAgentStatus(agentId: string, newStatus: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.AGENTS}/update-status/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          ...getAuthHeader(),
        },
        body: new URLSearchParams({ status: newStatus }).toString(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      await response.json();
    } catch (err) {
      console.error("updateAgentStatus error:", err);
      throw err;
    }
  },
};

// -----------Contact Inquiry-----------

export const contactInquiryApi = {
  // Get all inquiries with filters
  async getAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    startDate?: string
  ): Promise<ContactInquiryListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status && status !== "all") params.append("status", status);
      if (startDate) params.append("start_date", startDate);

      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.CONTACT_INQUIRY}/?${params.toString()}`,
        {
          method: "GET",
          headers: getAuthHeader(),
        }
      );

      return handleResponse<ContactInquiryListResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Update inquiry status
  async updateStatus(
    inquiryId: string,
    status: string
  ): Promise<ApiResponse<{ follow_up_date?: string }>> {
    try {
      const response = await fetch(
        `${BASE_URL_WRITE}${API_PATHS.CONTACT_INQUIRY}/update-status/${inquiryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ status }),
        }
      );

      return handleResponse<ApiResponse<{ follow_up_date?: string }>>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};


export { ApiError };