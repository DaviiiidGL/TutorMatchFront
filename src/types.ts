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

// ─── Tutor Profile ───

export type SubjectOption =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "Programming"
  | "Algorithms"
  | "Databases"
  | "English"
  | "History"
  | "Economics";

export type ModalityOption = "online" | "in-person" | "both";

export interface TutorProfileFormData {
  bio: string;
  hourlyRate: number | "";
  modality: ModalityOption;
  subjects: SubjectOption[];
  availabilities: AvailabilitySlot[];
}

export interface TutorProfileFormErrors {
  bio?: string;
  hourlyRate?: string;
  subjects?: string;
  availabilities?: string;
}

export interface TutorOffer {
  id: number;
  title: string;
  description: string;
  subject: SubjectOption;
  pricePerHour: number;
  modality: ModalityOption;
  durationMinutes: number;
}

export interface TutorOfferFormData {
  title: string;
  description: string;
  subject: SubjectOption | "";
  pricePerHour: number | "";
  modality: ModalityOption;
  durationMinutes: number | "";
}

export interface TutorOfferFormErrors {
  title?: string;
  description?: string;
  subject?: string;
  pricePerHour?: string;
  durationMinutes?: string;
}

// ─── Bookings / Reservas ───

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export interface Booking {
  id: number;
  tutorId: number;
  tutorName: string;
  studentId: number;
  studentName: string;
  subject: string;
  scheduledAt: string;      
  durationMinutes: number;
  modality: ModalityOption;
  status: BookingStatus;
  expiresAt: string;       
  notes?: string;
}