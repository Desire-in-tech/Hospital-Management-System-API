export type UserRole = "admin" | "doctor" | "patient";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  hospital_id: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterData {
  hospital_name: string;
  hospital_slug: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  hospital_slug: string;
  email: string;
  password: string;
}

export interface ApiError {
  detail?: string;
}
