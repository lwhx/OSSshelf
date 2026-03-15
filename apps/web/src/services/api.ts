import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import type {
  User,
  FileItem,
  Share,
  ApiResponse,
  AuthLoginParams,
  AuthRegisterParams,
  AuthResponse,
  FileListParams,
  ShareCreateParams,
} from '@r2shelf/shared';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (params: AuthLoginParams) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/login', params),
  
  register: (params: AuthRegisterParams) =>
    api.post<ApiResponse<AuthResponse>>('/api/auth/register', params),
  
  logout: () =>
    api.post<ApiResponse<{ message: string }>>('/api/auth/logout'),
  
  me: () =>
    api.get<ApiResponse<User>>('/api/auth/me'),
};

export const filesApi = {
  list: (params?: Partial<FileListParams>) =>
    api.get<ApiResponse<FileItem[]>>('/api/files', { params }),
  
  get: (id: string) =>
    api.get<ApiResponse<FileItem>>(`/api/files/${id}`),
  
  createFolder: (name: string, parentId?: string | null) =>
    api.post<ApiResponse<FileItem>>('/api/files', { name, parentId }),
  
  update: (id: string, data: { name?: string; parentId?: string | null }) =>
    api.put<ApiResponse<{ message: string }>>(`/api/files/${id}`, data),
  
  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/api/files/${id}`),
  
  upload: (file: File, parentId?: string | null, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }
    
    return api.post<ApiResponse<FileItem>>('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  download: (id: string) =>
    api.get(`/api/files/${id}/download`, { responseType: 'blob' }),
  
  preview: (id: string) =>
    api.get(`/api/files/${id}/preview`, { responseType: 'blob' }),
  
  previewUrl: (id: string) =>
    `${import.meta.env.VITE_API_URL || ''}/api/files/${id}/preview`,
  
  downloadUrl: (id: string) =>
    `${import.meta.env.VITE_API_URL || ''}/api/files/${id}/download`,
};

export const shareApi = {
  create: (params: ShareCreateParams) =>
    api.post<ApiResponse<Share>>('/api/share', params),
  
  get: (id: string, password?: string) =>
    api.get<ApiResponse<Share>>(`/api/share/${id}`, { params: { password } }),
  
  download: (id: string, password?: string) =>
    api.get(`/api/share/${id}/download`, { params: { password }, responseType: 'blob' }),
  
  downloadUrl: (id: string, password?: string) =>
    `${import.meta.env.VITE_API_URL || ''}/api/share/${id}/download${password ? `?password=${encodeURIComponent(password)}` : ''}`,
};

export default api;
