import { api } from './client';
import type { TutorProfileFormData } from '../types';

export interface CreateTutorProfileDTO {
  bio: string;
  hourlyRate: number;
  isVirtual: boolean;
  subjects: string[];
  availabilities: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface TutorProfileResponse {
  success: boolean;
  message: string;
}

function toDTO(formData: TutorProfileFormData): CreateTutorProfileDTO {
  return {
    bio: formData.bio,
    hourlyRate: Number(formData.hourlyRate),
    isVirtual: formData.modality === "online" || formData.modality === "both",
    subjects: formData.subjects,
    availabilities: formData.availabilities.map(slot => ({
      dayOfWeek: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })),
  };
}

export async function createTutorProfile(
  formData: TutorProfileFormData
): Promise<TutorProfileResponse> {
  const dto = toDTO(formData);
  const data = await api.post<{ message: string }>('/tutorprofile/create', dto);
  return { success: true, message: data.message };
}