import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ValidationResponse {
  status: 'VALID' | 'INVALID';
  reason: string;
  normalizedValue: string;
  timestamp: string;
  details: {
    type: 'PAN' | 'AADHAAR';
    originalInput: string;
    categoryCode?: string;
    categoryName?: string;
    maskedValue?: string;
    [key: string]: any;
  };
}

export interface Stats {
  totalValidations: number;
  totalValid: number;
  totalInvalid: number;
  successRate: number;
  pan: {
    total: number;
    valid: number;
    invalid: number;
  };
  aadhaar: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export const validatePAN = async (value: string): Promise<ValidationResponse> => {
  const response = await api.post<ValidationResponse>('/pan/validate', { value });
  return response.data;
};

export const validateAadhaar = async (value: string): Promise<ValidationResponse> => {
  const response = await api.post<ValidationResponse>('/aadhaar/validate', { value });
  return response.data;
};

export const getHistory = async (search?: string): Promise<ValidationResponse[]> => {
  const response = await api.get<ValidationResponse[]>('/history', {
    params: search ? { search } : {},
  });
  return response.data;
};

export const clearHistory = async (): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>('/history');
  return response.data;
};

export const getStatistics = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/statistics');
  return response.data;
};

export default api;
