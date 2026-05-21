import { api } from './client';
import type { Booking, ModalityOption } from '../types';

// ─── Estudiante ───
export async function getMyBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/mine');
}

export async function getAcceptedBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/mine?status=accepted');
}

// Verifica si hay conflicto para un slot concreto antes de enviar
export async function checkConflict(
  scheduledAt: string,
  durationMinutes: number
): Promise<{ conflict: boolean; message?: string }> {
  try {
    await api.post<void>('/bookings/check-conflict', { scheduledAt, durationMinutes });
    return { conflict: false };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('409')) {
      return { conflict: true, message: err.message };
    }
    return { conflict: false }; // otros errores no bloquean
  }
}

export interface CreateBookingDTO {
  tutorId: number;
  subject: string;
  modality: ModalityOption;
  scheduledAt: string;   // ISO 8601
  durationMinutes: number;
  notes?: string;
}

export async function createBooking(dto: CreateBookingDTO): Promise<Booking> {
  return api.post<Booking>('/bookings', dto);
}

// ─── Tutor ───
export async function getPendingBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/pending');
}

export async function getTutorAcceptedBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/accepted');
}

export async function acceptBooking(id: number): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/accept`);
}

export async function rejectBooking(id: number): Promise<Booking> {
  return api.patch<Booking>(`/bookings/${id}/reject`);
}