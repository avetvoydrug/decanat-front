import api from './axios';

export interface User {
    username: string;
    role: string;
  }
  
export interface LoginData {
  login: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
    // const response = await api.post('/login', data);
    // return response.data;
// mock
    return {access_token: "1"}
};

export const getMe = async (): Promise<User> => {
//   const response = await api.get('/me');
//   return response.data;
// mock
    return {username: "Valera", role: "admin"}
};

export const logout = () => {
  localStorage.removeItem('access_token');
};