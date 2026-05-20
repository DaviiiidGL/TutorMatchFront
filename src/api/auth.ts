// src/api/auth.ts

import { api } from './client';
import type { LoginFormData, RegisterFormData, AuthResponse } from '../types';

export async function loginUser(formData: LoginFormData): Promise<AuthResponse> {
  const data = await api.post<{ token: string }>('/auth/login', {
    email: formData.email,
    password: formData.password
  });

  // Guardar el token para las demás peticiones
  localStorage.setItem('token', data.token);

  // Decodificar el payload del JWT para sacar email y rol
  const payload = JSON.parse(atob(data.token.split('.')[1]));

  return {
    success: true,
    message: `Bienvenid@, ${payload.email}`,
    user: {
      id: payload.nameid,       
      email: payload.email,
      name: payload.email,      
      role: payload.role ?? ''
    }
  };
}

export async function registerUser(formData: RegisterFormData): Promise<AuthResponse> {
  const data = await api.post<{ message: string }>('/auth/register', {
    email: formData.email,
    password: formData.password,
    role: formData.role
  });

  return {
    success: true,
    message: data.message,
    user: {
      id: 0,
      email: formData.email,
      name: formData.name,
      role: formData.role
    }
  };
}

export function logoutUser(): void {
  localStorage.removeItem('token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}