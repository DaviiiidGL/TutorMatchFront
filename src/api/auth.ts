// src/api/auth.ts

import { api } from './client';
import type { LoginFormData, RegisterFormData, AuthResponse } from '../types';

// Mapeo: rol del front (minúscula) → rol que espera el back (mayúscula inicial)
function toBackendRole(role: string): string {
  const map: Record<string, string> = {
    student: 'Student',
    tutor:   'Tutor',
    both:    'Student', // "both" no existe en el back, fallback a Student
  };
  return map[role] ?? 'Student';
}

// Mapeo inverso: rol del JWT (mayúscula) → rol interno del front (minúscula)
function toFrontendRole(role: string): string {
  const map: Record<string, string> = {
    Student: 'student',
    Tutor:   'tutor',
    Admin:   'tutor',
  };
  return map[role] ?? 'student';
}

export async function loginUser(formData: LoginFormData): Promise<AuthResponse> {
  const data = await api.post<{ token: string }>('/auth/login', {
    email:    formData.email,
    password: formData.password,
  });

  // Guardar el token para las demás peticiones
  localStorage.setItem('token', data.token);

  // Decodificar el payload del JWT
  const payload = JSON.parse(atob(data.token.split('.')[1]));

  // .NET usa claim types con URL larga para Role y NameIdentifier
  const rawRole: string =
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    payload.role ??
    'Student';

  const userId: string =
    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
    payload.nameid ??
    '';

  return {
    success: true,
    message: `Bienvenid@, ${payload.email}`,
    user: {
      id:    userId,
      email: payload.email,
      name:  payload.email,
      role:  toFrontendRole(rawRole) as any,
    },
  };
}

export async function registerUser(formData: RegisterFormData): Promise<AuthResponse> {
  const data = await api.post<{ message: string }>('/auth/register', {
    email:    formData.email,
    password: formData.password,
    role:     toBackendRole(formData.role), // "student" → "Student"
  });

  return {
    success: true,
    message: data.message,
    user: {
      id:    '',
      email: formData.email,
      name:  formData.name,
      role:  formData.role,
    },
  };
}

export function logoutUser(): void {
  localStorage.removeItem('token');
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}
