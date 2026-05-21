import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, createBooking, type CreateBookingDTO } from '../api/bookings';
import type { Tutor, Booking, ModalityOption } from '../types';

// ─── Helpers ──────────────────────────────────────────────

const MODALITY_LABEL: Record<ModalityOption, string> = {
  online: 'Online',
  'in-person': 'Presencial',
  both: 'Ambas',
};

// Genera slots horarios cada 30 min dentro del rango del slot de disponibilidad
function generateTimeSlots(startTime: string, endTime: string, durationMins: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  for (let t = startMins; t + durationMins <= endMins; t += 30) {
    const hh = Math.floor(t / 60).toString().padStart(2, '0');
    const mm = (t % 60).toString().padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// Convierte día en español al próximo Date con ese día de semana
const DAY_MAP: Record<string, number> = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
  Jueves: 4, Viernes: 5, Sábado: 6,
};

function nextDateForDay(dayName: string): Date {
  const target = DAY_MAP[dayName] ?? 1;
  const now = new Date();
  const today = now.getDay();
  let diff = target - today;
  if (diff <= 0) diff += 7; // siempre la próxima ocurrencia (no hoy)
  const d = new Date(now);
  d.setDate(d.getDate() + diff);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function buildISODate(dayName: string, time: string): string {
  const d = nextDateForDay(dayName);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

// Verifica si un slot (fecha ISO + duración) se solapa con un booking existente
function hasConflict(isoStart: string, durationMins: number, existingBookings: Booking[]): boolean {
  const newStart = new Date(isoStart).getTime();
  const newEnd = newStart + durationMins * 60_000;
  return existingBookings
    .filter(b => b.status === 'accepted' || b.status === 'pending')
    .some(b => {
      const bStart = new Date(b.scheduledAt).getTime();
      const bEnd = bStart + b.durationMinutes * 60_000;
      return newStart < bEnd && bStart < newEnd;
    });
}

// ─── Form state ───────────────────────────────────────────

interface FormState {
  subject: string;
  modality: ModalityOption | '';
  day: string;
  time: string;
  duration: number;
  notes: string;
}

interface FormErrors {
  subject?: string;
  modality?: string;
  day?: string;
  time?: string;
  submit?: string;
}

const DURATION_OPTIONS = [30, 60, 90, 120];

// ─── Componente ───────────────────────────────────────────

interface Props {
  tutor: Tutor;
}

function ReservationForm({ tutor }: Props) {
  const navigate = useNavigate();

  const initialModality: ModalityOption | '' =
    tutor.modalidad === 'both' ? '' : tutor.modalidad;

  const [form, setForm] = useState<FormState>({
    subject: tutor.subjects[0] ?? '',
    modality: initialModality,
    day: '',
    time: '',
    duration: 60,
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [conflictSlots, setConflictSlots] = useState<Set<string>>(new Set());

  // Carga bookings propios para validación de conflictos en cliente
  useEffect(() => {
    getMyBookings()
      .then(setMyBookings)
      .catch(() => { /* silencioso — el back validará igual */ })
      .finally(() => setLoadingBookings(false));
  }, []);

  // Slots horarios disponibles para el día seleccionado
  const availableSlots = useMemo(() => {
    if (!form.day) return [];
    // Puede haber múltiples franjas para el mismo día
    const dayBlocks = tutor.disponibility.filter(d => d.day === form.day);
    return dayBlocks.flatMap(b => generateTimeSlots(b.startTime, b.endTime, form.duration));
  }, [form.day, form.duration, tutor.disponibility]);

  // Recalcula conflictos al cambiar día, duración o mis bookings
  useEffect(() => {
    if (!form.day || myBookings.length === 0) {
      setConflictSlots(new Set());
      return;
    }
    const conflicts = new Set<string>();
    availableSlots.forEach(time => {
      const iso = buildISODate(form.day, time);
      if (hasConflict(iso, form.duration, myBookings)) conflicts.add(time);
    });
    setConflictSlots(conflicts);
    // Si el slot seleccionado quedó en conflicto, lo limpia
    if (form.time && conflicts.has(form.time)) {
      setForm(prev => ({ ...prev, time: '' }));
    }
  }, [form.day, form.duration, myBookings, availableSlots]);

  // ─── Handlers ───

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Reset dependientes
      if (key === 'day') next.time = '';
      if (key === 'duration') next.time = '';
      return next;
    });
    setErrors(prev => ({ ...prev, [key]: '', submit: '' }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.subject) e.subject = 'Selecciona una materia';
    if (tutor.modalidad === 'both' && !form.modality) e.modality = 'Selecciona la modalidad';
    if (!form.day) e.day = 'Selecciona un día';
    if (!form.time) e.time = 'Selecciona una hora';
    if (form.time && conflictSlots.has(form.time)) {
      e.time = 'Ya tienes una reserva en ese horario';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    const scheduledAt = buildISODate(form.day, form.time);

    // Verificación client-side final antes de enviar
    if (hasConflict(scheduledAt, form.duration, myBookings)) {
      setErrors({ time: 'Ya tienes una reserva en ese horario' });
      setSubmitting(false);
      return;
    }

    const dto: CreateBookingDTO = {
      tutorId: tutor.id,
      subject: form.subject,
      modality: (form.modality || tutor.modalidad) as ModalityOption,
      scheduledAt,
      durationMinutes: form.duration,
      notes: form.notes || undefined,
    };

    try {
      const booking = await createBooking(dto);
      navigate(`/mis-reservas/${booking.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear la reserva';
      // 409 del back — conflicto detectado en servidor
      if (msg.includes('409') || msg.toLowerCase().includes('conflict')) {
        setErrors({ time: 'El tutor ya tiene una sesión en ese horario. Elige otro.' });
      } else {
        setErrors({ submit: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Estilos base ───

  const selectCls = (hasError?: boolean) =>
    `h-12 w-full rounded-xl border bg-white/5 px-4 text-sm text-white outline-none transition ` +
    `placeholder:text-white/25 focus:ring-2 ${
      hasError
        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
        : 'border-white/10 focus:border-[#ff6a00] focus:ring-[#ff6a00]/20'
    }`;

  // ─── Render ───

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* ─── Materia ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">Materia</label>
        <select
          value={form.subject}
          onChange={e => setField('subject', e.target.value)}
          className={selectCls(!!errors.subject)}
        >
          <option value="" disabled>Selecciona una materia</option>
          {tutor.subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
      </div>

      {/* ─── Modalidad (solo si el tutor ofrece ambas) ─── */}
      {tutor.modalidad === 'both' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/60">Modalidad</label>
          <div className="grid grid-cols-2 gap-2">
            {(['online', 'in-person'] as ModalityOption[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setField('modality', m)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                  form.modality === m
                    ? 'border-[#ff6a00]/50 bg-[#ff6a00]/10 text-[#ff6a00]'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                }`}
              >
                {m === 'online' ? '💻 Online' : '📍 Presencial'}
              </button>
            ))}
          </div>
          {errors.modality && <p className="mt-1 text-xs text-red-400">{errors.modality}</p>}
        </div>
      )}

      {/* ─── Duración ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">Duración de la sesión</label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setField('duration', d)}
              className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                form.duration === d
                  ? 'border-[#ff6a00]/50 bg-[#ff6a00]/10 text-[#ff6a00]'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
              }`}
            >
              {d < 60 ? `${d}m` : `${d / 60}h`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Día disponible ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">Día disponible</label>
        <div className="flex flex-wrap gap-2">
          {/* Días únicos disponibles del tutor */}
          {[...new Set(tutor.disponibility.map(d => d.day))].map(day => (
            <button
              key={day}
              type="button"
              onClick={() => setField('day', day)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                form.day === day
                  ? 'border-[#ff6a00]/50 bg-[#ff6a00]/10 text-[#ff6a00]'
                  : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        {errors.day && <p className="mt-1 text-xs text-red-400">{errors.day}</p>}
      </div>

      {/* ─── Hora ─── */}
      {form.day && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-white/60">Hora de inicio</label>
            {loadingBookings && (
              <span className="text-xs text-white/25 animate-pulse">Verificando disponibilidad...</span>
            )}
          </div>

          {availableSlots.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/30">
              No hay franjas disponibles para una sesión de {form.duration} min ese día.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {availableSlots.map(time => {
                const isConflict = conflictSlots.has(time);
                const isSelected = form.time === time;
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isConflict}
                    onClick={() => !isConflict && setField('time', time)}
                    title={isConflict ? 'Ya tienes una reserva en este horario' : ''}
                    className={`relative rounded-xl border py-2.5 text-xs font-semibold transition ${
                      isConflict
                        ? 'cursor-not-allowed border-red-500/20 bg-red-500/5 text-red-500/40 line-through'
                        : isSelected
                        ? 'border-[#ff6a00]/50 bg-[#ff6a00]/10 text-[#ff6a00]'
                        : 'border-white/8 text-white/50 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {time}
                    {isConflict && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                        !
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Leyenda de conflictos */}
          {conflictSlots.size > 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2">
              <span className="text-red-400">⚠</span>
              <p className="text-xs text-red-400/80">
                {conflictSlots.size === 1
                  ? 'Un horario no está disponible porque ya tienes una reserva activa.'
                  : `${conflictSlots.size} horarios bloqueados por reservas existentes.`}
              </p>
            </div>
          )}
          {errors.time && <p className="mt-1 text-xs text-red-400">{errors.time}</p>}
        </div>
      )}

      {/* ─── Resumen de la reserva ─── */}
      {form.day && form.time && !conflictSlots.has(form.time) && (
        <div className="rounded-xl border border-white/5 bg-[#111111] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">
            Resumen
          </p>
          <div className="space-y-1.5 text-sm">
            <Row label="Tutor" value={tutor.name} />
            <Row label="Materia" value={form.subject} />
            <Row label="Modalidad" value={MODALITY_LABEL[(form.modality || tutor.modalidad) as ModalityOption]} />
            <Row label="Día" value={form.day} />
            <Row label="Hora" value={`${form.time} · ${form.duration < 60 ? `${form.duration}m` : `${form.duration / 60}h`}`} />
          </div>
        </div>
      )}

      {/* ─── Notas ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-white/60">
          Notas para el tutor <span className="text-white/25">(opcional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={e => setField('notes', e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Ej. No entiendo derivadas desde hace 2 semanas, necesito repaso desde la base..."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20"
        />
        <p className="mt-1 text-right text-xs text-white/20">{form.notes.length}/300</p>
      </div>

      {/* ─── Error de submit ─── */}
      {errors.submit && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errors.submit}
        </div>
      )}

      {/* ─── Submit ─── */}
      <button
        type="submit"
        disabled={submitting || !form.day || !form.time || conflictSlots.has(form.time)}
        className="w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Enviando solicitud...' : 'Confirmar reserva'}
      </button>

    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/40">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

export default ReservationForm;