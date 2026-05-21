import { api } from './client';
import type { Booking } from '../types';

// ─── Estudiante ───
export async function getMyBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/mine');
}

export async function getAcceptedBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/bookings/mine?status=accepted');
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