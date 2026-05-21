import { api } from './client';

export interface Review {
  id: string;            // Guid → string
  bookingId: string;     // Guid → string
  tutorId: string;       // string (IdentityUser.Id)
  studentId: string;     // string (IdentityUser.Id)
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDTO {
  bookingId: string;     // Guid → string
  tutorId: string;       // string (IdentityUser.Id)
  rating: number;
  comment: string;
}

export async function submitReview(dto: CreateReviewDTO): Promise<Review> {
  return api.post<Review>('/reviews', dto);
}

export async function getMyReviewForBooking(bookingId: string): Promise<Review | null> {
  try {
    return await api.get<Review>(`/reviews/booking/${bookingId}`);
  } catch {
    return null;
  }
}

export async function getReviewsForTutor(tutorId: string): Promise<Review[]> {
  return api.get<Review[]>(`/reviews/tutor/${tutorId}`);
}