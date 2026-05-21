import { useMemo } from 'react';
import type { AvailabilitySlot, Booking } from '../types';

// ─── Helpers puros (exportados para usar en validate() y handleSubmit) ───

export function toMins(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function getAvailableDays(availability: AvailabilitySlot[]): string[] {
  const ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const days = [...new Set(availability.map(s => s.day))];
  return ORDER.filter(d => days.includes(d));
}

export function getValidSlotsForDay(
  dayName: string,
  durationMins: number,
  availability: AvailabilitySlot[]
): string[] {
  const daySlots = availability.filter(s => s.day === dayName);
  if (daySlots.length === 0) return [];

  const all: string[] = [];
  daySlots.forEach(slot => {
    const sStart = toMins(slot.startTime);
    const sEnd   = toMins(slot.endTime);
    for (let t = sStart; t + durationMins <= sEnd; t += 30) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0');
      const mm = String(t % 60).padStart(2, '0');
      all.push(`${hh}:${mm}`);
    }
  });

  return [...new Set(all)].sort();
}

export function isWithinTutorAvailability(
  isoDateTime: string,
  durationMins: number,
  availability: AvailabilitySlot[]
): { valid: boolean; reason?: string } {
  const date = new Date(isoDateTime);
  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const dayName  = dayNames[date.getDay()];
  const timeHHMM = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  const slotStart = toMins(timeHHMM);
  const slotEnd   = slotStart + durationMins;

  const daySlots = availability.filter(s => s.day === dayName);
  if (daySlots.length === 0)
    return { valid: false, reason: `El tutor no tiene disponibilidad los ${dayName}s.` };

  const fits = daySlots.some(s => slotStart >= toMins(s.startTime) && slotEnd <= toMins(s.endTime));
  if (!fits) {
    const ranges = daySlots.map(s => `${s.startTime}–${s.endTime}`).join(', ');
    return { valid: false, reason: `La sesión debe terminar dentro del horario del tutor: ${ranges}.` };
  }
  return { valid: true };
}

export function hasConflict(
  isoStart: string,
  durationMins: number,
  existingBookings: Booking[]
): boolean {
  const newStart = new Date(isoStart).getTime();
  const newEnd   = newStart + durationMins * 60_000;
  return existingBookings
    .filter(b => b.status === 'accepted' || b.status === 'pending')
    .some(b => {
      const bStart = new Date(b.scheduledAt).getTime();
      const bEnd   = bStart + b.durationMinutes * 60_000;
      return newStart < bEnd && bStart < newEnd;
    });
}

export function summarizeAvailability(availability: AvailabilitySlot[]): string {
  const ORDER = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const SHORT: Record<string,string> = {
    Lunes:'Lun', Martes:'Mar', Miércoles:'Mié',
    Jueves:'Jue', Viernes:'Vie', Sábado:'Sáb', Domingo:'Dom',
  };
  return [...availability]
    .sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day))
    .map(s => `${SHORT[s.day] ?? s.day} ${s.startTime}–${s.endTime}`)
    .join(' · ');
}

// ─── Hook (para el componente) ───

const DAY_MAP: Record<string, number> = {
  Domingo:0, Lunes:1, Martes:2, Miércoles:3, Jueves:4, Viernes:5, Sábado:6,
};

export function nextDateForDay(dayName: string): Date {
  const target = DAY_MAP[dayName] ?? 1;
  const now    = new Date();
  let diff     = target - now.getDay();
  if (diff <= 0) diff += 7;
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  return d;
}

export function buildISODate(dayName: string, time: string): string {
  const d = nextDateForDay(dayName);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export function useAvailability(
  availability: AvailabilitySlot[],
  day: string,
  duration: number
) {
  const availableDays = useMemo(
    () => getAvailableDays(availability),
    [availability]
  );

  const availableSlots = useMemo(
    () => (day ? getValidSlotsForDay(day, duration, availability) : []),
    [day, duration, availability]
  );

  return { availableDays, availableSlots };
}