import { api } from './client';
import type { Tutor } from '../types';

export async function getTutors(): Promise<Tutor[]> {
  return api.get<Tutor[]>('/tutors');
}

export async function getTutorById(id: number): Promise<Tutor> {
  return api.get<Tutor>(`/tutors/${id}`);
}