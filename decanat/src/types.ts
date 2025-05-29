export interface User {
    username: string;
    role: string;
  }
  
export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}