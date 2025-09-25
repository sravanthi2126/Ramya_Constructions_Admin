export interface User {
  id: string;
  phone_number: string;
  name: string;
  email?: string;
  user_type: 'viewer' | 'subscriber';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation?: string;
  annual_income?: string;
  pan_number: string;
  aadhar_number: string;
  kyc_verification_status: 'pending' | 'partial' | 'verified' | 'rejected';
  kyc_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  description?: string;
  status: 'available' | 'sold_out' | 'coming_soon';
  base_price: number;
  property_type: 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';
  total_units: number;
  available_units: number;
  sold_units: number;
  rera_number?: string;
  created_at: string;
  is_active: boolean;
}

export interface InvestmentScheme {
  id: string;
  project_id: string;
  scheme_type: 'single_payment' | 'installment';
  scheme_name: string;
  area_sqft: number;
  booking_advance?: number;
  balance_payment_days?: number;
  total_installments?: number;
  monthly_installment_amount?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  project?: Project;
}

export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  activeSchemes: number;
  totalInvestments: number;
  monthlyGrowth: number;
  userGrowth: number;
}