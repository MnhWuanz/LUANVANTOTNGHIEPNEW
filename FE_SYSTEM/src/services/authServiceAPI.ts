import type { AxiosResponse } from 'axios';
import { api } from './axiosClient';

// 1. Định nghĩa kiểu dữ liệu cho User
export interface User {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TEACHER';
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
  };
}
export interface LogoutResponse {
  success: boolean;
  message: string;
}
const authAPI = {
  // Gán kiểu dữ liệu cho tham số đầu vào và kiểu trả về của hàm login
  async login(data: LoginRequest): Promise<AxiosResponse<LoginResponse>> {
    return api.post<LoginResponse>(`/login`, data);
  },
  async refresh(): Promise<AxiosResponse<LoginResponse>> {
    return api.post<LoginResponse>(`/refresh`);
  },
  async logout(): Promise<AxiosResponse<LogoutResponse>> {
    return api.post<LogoutResponse>(`/logout`);
  },
};
export default authAPI;
