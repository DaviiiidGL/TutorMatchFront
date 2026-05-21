import { api } from './client';
import type { TutorOffer, TutorOfferFormData } from '../types';

export interface CreateOfferDTO {
  title: string;
  description: string;
  subject: string;
  pricePerHour: number;
  modality: string;
  durationMinutes: number;
}

function toDTO(f: TutorOfferFormData): CreateOfferDTO {
  return {
    title: f.title.trim(),
    description: f.description.trim(),
    subject: f.subject as string,
    pricePerHour: Number(f.pricePerHour),
    modality: f.modality,
    durationMinutes: Number(f.durationMinutes),
  };
}

export async function getMyOffers(): Promise<TutorOffer[]> {
  return api.get<TutorOffer[]>('/offers/mine');
}

export async function createOffer(formData: TutorOfferFormData): Promise<TutorOffer> {
  return api.post<TutorOffer>('/offers', toDTO(formData));
}

export async function updateOffer(id: number, formData: TutorOfferFormData): Promise<TutorOffer> {
  return api.put<TutorOffer>(`/offers/${id}`, toDTO(formData));
}

export async function deleteOffer(id: number): Promise<void> {
  return api.delete(`/offers/${id}`);
}