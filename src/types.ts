export type AuthMode = "login" | "register";

export type UserRole = "student" | "tutor" | "both";

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user: Omit<User, "password">;
}

export interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Tutor {
  id: number;
  name: string;
  description: string;
  subjects: string[];
  pricePerHour: number;
  modalidad: "online" | "in-person" | "both";
  rating: number;
  disponibility: AvailabilitySlot[];
}

export interface TutorFilters {
  search: string;
  subject: string;
  minRating: string;
  hour: string;
  minPrice: string;
  maxPrice: string;
}