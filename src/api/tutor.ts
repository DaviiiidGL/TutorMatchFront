import type { Tutor } from "../types";
import tutorsData from "../data/tutors.json";

export const getTutors = async (): Promise<Tutor[]> => {
    return new Promise((resolve) => {
        resolve(tutorsData as Tutor[]);
    });
};

export const getTutorById = async (id: number): Promise<Tutor | null> => {
    return new Promise((resolve) => {
        const tutor = (tutorsData as Tutor[]).find((t) => t.id === id);
        resolve(tutor || null);
    });
};