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

// export interface Project {
//   [x: string]: string;
//   [x: string]: number;
//   [x: string]: boolean;
//   long_description: string;
//   id: string;
//   title: string;
//   location: string;
//   description?: string;
//   status: 'available' | 'sold_out' | 'coming_soon';
//   base_price: number;
//   property_type: 'commercial' | 'residential' | 'plot' | 'land' | 'mixed_use';
//   total_units: number;
//   available_units: number;
//   sold_units: number;
//   rera_number?: string;
//   created_at: string;
//   is_active: boolean;
// }

export interface Project {
  [key: string]: string | number | boolean | Project | undefined; // include types you need
  long_description: string;
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