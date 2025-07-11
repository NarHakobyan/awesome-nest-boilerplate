/**
 * Custom Axios instance for Orval-generated API client
 * 
 * This mutator provides a customized Axios instance with:
 * - Base URL configuration
 * - Authentication handling
 * - Request/response interceptors
 * - Error handling
 * - TypeScript types
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define base configuration
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://api.yourapp.com'  // Production API URL
  : process.env.USE_HTTPS === 'true'
  ? 'https://localhost:3443'   // HTTPS development
  : 'http://localhost:3000';   // HTTP development

// Create axios instance
export const customInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 second timeout
  
  // Default headers
  headers: {
    'Content-Type': 'application/json',
  },
  
  // Enable cookies for authentication
  withCredentials: true,
});

// Request interceptor
customInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add authentication token if available
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    
    // Add request ID for tracing
    config.headers = {
      ...config.headers,
      'X-Request-ID': generateRequestId(),
    };
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
customInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth token and redirect to login
          clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - show access denied message
          console.error('❌ Access denied');
          break;
          
        case 404:
          // Not found
          console.error('❌ Resource not found');
          break;
          
        case 422:
          // Validation error - extract validation messages
          const validationErrors = extractValidationErrors(data);
          console.error('❌ Validation errors:', validationErrors);
          break;
          
        case 500:
          // Server error
          console.error('❌ Server error');
          break;
          
        default:
          console.error(`❌ HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // Network error
      console.error('❌ Network Error:', error.message);
    } else {
      // Other error
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication helpers
function getAuthToken(): string | null {
  // Get token from localStorage, sessionStorage, or cookies
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token') || 
           sessionStorage.getItem('access_token');
  }
  
  // For server-side, you might get it from process.env or other sources
  return process.env.API_TOKEN || null;
}

function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
  }
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function extractValidationErrors(data: any): string[] {
  // Extract validation error messages from NestJS validation response
  if (data && Array.isArray(data.message)) {
    return data.message;
  }
  
  if (data && data.message) {
    return [data.message];
  }
  
  return ['Validation failed'];
}

// Export default for Orval
export default customInstance;

// Additional utility functions for API client

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

/**
 * Configure API base URL (useful for multi-environment setups)
 */
export function setApiBaseUrl(url: string): void {
  customInstance.defaults.baseURL = url;
}

/**
 * Add custom header to all requests
 */
export function addGlobalHeader(key: string, value: string): void {
  customInstance.defaults.headers.common[key] = value;
}

/**
 * Remove custom header from all requests
 */
export function removeGlobalHeader(key: string): void {
  delete customInstance.defaults.headers.common[key];
}

/**
 * File upload helper
 */
export function uploadFile(
  url: string, 
  file: File, 
  progressCallback?: (progress: number) => void
): Promise<AxiosResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  return customInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressCallback && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        progressCallback(progress);
      }
    },
  });
}

/**
 * Download file helper
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await customInstance.get(url, {
    responseType: 'blob',
  });
  
  if (typeof window !== 'undefined') {
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

/**
 * Type definitions for better TypeScript support
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
