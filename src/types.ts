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