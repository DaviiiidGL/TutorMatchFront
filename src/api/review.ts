import { api } from './client';

export interface Review {
  id: number;
  bookingId: number;
  tutorId: number;
  studentId: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDTO {
  bookingId: number;
  tutorId: number;
  rating: number;
  comment: string;
}

export async function submitReview(dto: CreateReviewDTO): Promise<Review> {
  return api.post<Review>('/reviews', dto);
}

export async function getMyReviewForBooking(bookingId: number): Promise<Review | null> {
  try {
    return await api.get<Review>(`/reviews/booking/${bookingId}`);
  } catch {
    return null;
  }
}

export async function getReviewsForTutor(tutorId: number): Promise<Review[]> {
  return api.get<Review[]>(`/reviews/tutor/${tutorId}`);
}