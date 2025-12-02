import { PurchasedUnit, BASE_URL_READ, API_PATHS, getAuthHeader, PurchasedUnitResponse, handleResponse, handleNetworkError, CreateUnitRequest, ApiResponse, BASE_URL_WRITE, projectApi, schemeApi, PaymentHistoryResponse } from "@/api/apiService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const purchasedUnitApi = {
  // Get purchased unit by unit number
  async getByUnitNumber(unitNumber: string): Promise<PurchasedUnit> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.PURCHASED_UNIT}/by-unit-number/${unitNumber}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...getAuthHeader(),
        }
      });

      const data: PurchasedUnitResponse = await handleResponse<PurchasedUnitResponse>(response);
      return data.data as PurchasedUnit;
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get purchased units by user ID
  async getByUserId(userId: string): Promise<PurchasedUnit[]> {
    try {
      const response = await fetch(`${BASE_URL_READ}${API_PATHS.PURCHASED_UNIT}/by-user/${userId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          ...getAuthHeader(),
        }
      });

      const data: PurchasedUnitResponse = await handleResponse<PurchasedUnitResponse>(response);
      return data.data as PurchasedUnit[];
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get all purchased units
  async getAll(page: number = 1, pageSize: number = 12): Promise<{
    data: PurchasedUnit[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.PURCHASED_UNIT}/all?page=${page}&page_size=${pageSize}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          }
        }
      );

      const result = await handleResponse<{
        message: string;
        data: PurchasedUnit[];
        total_purchased_units: number;
        page: number;
        page_size: number;
      }>(response);

      return {
        data: result.data,
        total: result.total_purchased_units,
        page: result.page,
        pageSize: result.page_size,
      };
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Create purchased unit
  async create(data: CreateUnitRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${BASE_URL_WRITE}${API_PATHS.PURCHASED_UNIT}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data)
      });

      return handleResponse<ApiResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get projects for dropdown
  async getProjectsForDropdown(): Promise<{ id: string; title: string; }[]> {
    try {
      const response = await projectApi.getAllProjects(1, 100);
      return response.projects.map(project => ({
        id: project.id,
        title: project.title
      }));
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  // Get schemes for dropdown (by project ID)
  async getSchemesForDropdown(projectId: string): Promise<{ id: string; scheme_name: string; }[]> {
    try {
      const response = await schemeApi.getAllSchemesByProject(projectId, 1, 100);
      return response.schemes.map(scheme => ({
        id: scheme.id,
        scheme_name: scheme.scheme_name
      }));
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async getAllPaymentsByUnitNumber(unitNumber: string): Promise<PaymentHistoryResponse> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}${API_PATHS.PAYMENTS}/all-payments?unit_number=${encodeURIComponent(unitNumber)}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      const data = await handleResponse<PaymentHistoryResponse>(response);
      return data;
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async getProjectsWithSchemes(): Promise<{
    project_id: string;
    project_name: string;
    schemes: { scheme_id: string; scheme_name: string; }[];
  }[]> {
    try {
      const response = await fetch(
        `${BASE_URL_READ}/api/projects/projects-with-schemes/all`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      const result = await handleResponse<{ projects: any[]; }>(response);
      return result.projects;
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};
