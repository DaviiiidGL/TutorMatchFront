import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyAvailability, updateMyAvailability } from '../api/tutorProfile';
import type { AvailabilitySlot } from '../types';

// Orden canónico de los días — coincide con el back (DayOfWeek enum)
const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Genera id temporal para manejo de lista sin backend id
let _uid = 0;
function uid() { return ++_uid; }

interface SlotItem extends AvailabilitySlot {
  _id: number;
  _error?: string;
}

function validateSlot(slot: SlotItem): string {
  if (!slot.startTime || !slot.endTime) return 'Completa ambas horas';
  if (slot.startTime >= slot.endTime) return 'La hora de inicio debe ser antes de la de fin';
  return '';
}

function overlaps(a: SlotItem, b: SlotItem): boolean {
  if (a._id === b._id || a.day !== b.day) return false;
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

function formatRange(start: string, end: string) {
  const fmt = (t: string) => {
    const [h, m] = t.split(':');
    const hh = parseInt(h);
    return `${hh % 12 || 12}:${m} ${hh < 12 ? 'am' : 'pm'}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

// Duracion en horas
function duration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function TutorAvailabilityPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [savedOk, setSavedOk] = useState(false);
  const [activeDay, setActiveDay] = useState<string>('Lunes');
  const [editingId, setEditingId] = useState<number | null>(null);

  // ─── Carga inicial ───
  useEffect(() => {
    getMyAvailability()
      .then(data => {
        setSlots(data.map(s => ({ ...s, _id: uid() })));
        // Activar primer día con slots o Lunes
        const firstDay = DAYS_ORDER.find(d => data.some(s => s.day === d));
        if (firstDay) setActiveDay(firstDay);
      })
      .catch(err => setFetchError(err instanceof Error ? err.message : 'Error al cargar disponibilidad'))
      .finally(() => setLoading(false));
  }, []);

  // ─── Slots del día activo ───
  const daySlots = slots.filter(s => s.day === activeDay);
  const slotsByDay = (day: string) => slots.filter(s => s.day === day);

  // ─── Agregar slot ───
  const addSlot = () => {
    const existing = daySlots;
    // Sugiere empezar donde termina el último slot o a las 8am
    const startTime = existing.length > 0
      ? existing[existing.length - 1].endTime
      : '08:00';
    const [sh, sm] = startTime.split(':').map(Number);
    const endMins = sh * 60 + sm + 60;
    const endTime = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
    const newSlot: SlotItem = {
      _id: uid(),
      day: activeDay,
      startTime,
      endTime: endMins >= 24 * 60 ? '23:59' : endTime,
    };
    setSlots(prev => [...prev, newSlot]);
    setEditingId(newSlot._id);
    setSavedOk(false);
  };

  // ─── Actualizar slot ───
  const updateSlot = useCallback((id: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots(prev => {
      const updated = prev.map(s => s._id === id ? { ...s, [field]: value } : s);
      // Validar el slot editado
      return updated.map(s => {
        if (s._id !== id) return s;
        const err = validateSlot({ ...s, [field]: value });
        const hasOverlap = updated.some(other => overlaps({ ...s, [field]: value }, other));
        return { ...s, [field]: value, _error: err || (hasOverlap ? 'Se solapa con otro horario' : '') };
      });
    });
    setSavedOk(false);
  }, []);

  // ─── Eliminar slot ───
  const removeSlot = (id: number) => {
    setSlots(prev => prev.filter(s => s._id !== id));
    if (editingId === id) setEditingId(null);
    setSavedOk(false);
  };

  // ─── Copiar slots a otro día ───
  const copyToDay = (targetDay: string) => {
    const toCopy = daySlots.map(s => ({ ...s, _id: uid(), day: targetDay, _error: undefined }));
    // Eliminar los existentes del día destino y reemplazar
    setSlots(prev => [
      ...prev.filter(s => s.day !== targetDay),
      ...toCopy,
    ]);
    setSavedOk(false);
  };

  // ─── Guardar ───
  const handleSave = async () => {
    // Validar todos antes de guardar
    const validated = slots.map(s => ({ ...s, _error: validateSlot(s) || (slots.some(o => overlaps(s, o)) ? 'Se solapa' : '') }));
    setSlots(validated);
    if (validated.some(s => s._error)) {
      setSaveError('Corrige los errores antes de guardar');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSavedOk(false);
    try {
      const clean: AvailabilitySlot[] = slots.map(({ day, startTime, endTime }) => ({ day, startTime, endTime }));
      await updateMyAvailability(clean);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // ─── Total horas semanales ───
  const totalMins = slots.reduce((acc, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return acc + (diff > 0 ? diff : 0);
  }, 0);
  const totalHours = (totalMins / 60).toFixed(1);

  const inputCls =
    'rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white ' +
    'outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20';

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">

        {/* ─── Header ─── */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            ← Volver
          </button>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-white">Disponibilidad semanal</h1>
              <p className="mt-1 text-sm text-white/45">
                Configura en qué horarios puedes dar tutorías cada semana.
              </p>
            </div>
            {slots.length > 0 && (
              <span className="rounded-full border border-[#ff6a00]/25 bg-[#ff6a00]/10 px-3 py-1 text-xs font-semibold text-[#ff6a00]">
                {totalHours}h / semana
              </span>
            )}
          </div>
        </header>

        {/* ─── Error de carga ─── */}
        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {fetchError}
          </div>
        )}

        {/* ─── Loading ─── */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-20 animate-pulse rounded-2xl border border-white/5 bg-[#161616]" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">

            {/* ─── Vista resumen semanal ─── */}
            <section className="rounded-2xl border border-white/5 bg-[#161616] p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">
                Resumen semanal
              </h2>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_ORDER.map((day, i) => {
                  const count = slotsByDay(day).length;
                  const isActive = day === activeDay;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDay(day)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition ${
                        isActive
                          ? 'border-[#ff6a00]/50 bg-[#ff6a00]/10'
                          : count > 0
                          ? 'border-white/10 bg-white/5 hover:border-white/20'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className={`text-xs font-bold ${isActive ? 'text-[#ff6a00]' : 'text-white/50'}`}>
                        {DAYS_SHORT[i]}
                      </span>
                      {count > 0 ? (
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-[#ff6a00] text-white' : 'bg-white/15 text-white/70'
                        }`}>
                          {count}
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border border-dashed border-white/15" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ─── Editor del día activo ─── */}
            <section className="rounded-2xl border border-white/5 bg-[#161616] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{activeDay}</h2>
                  <p className="text-xs text-white/35">
                    {daySlots.length === 0
                      ? 'Sin horarios — agrega tu disponibilidad para este día'
                      : `${daySlots.length} franja${daySlots.length > 1 ? 's' : ''} configurada${daySlots.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSlot}
                  className="shrink-0 rounded-xl border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-2 text-xs font-semibold text-[#ff6a00] transition hover:bg-[#ff6a00]/20"
                >
                  + Agregar franja
                </button>
              </div>

              {/* Lista de slots del día */}
              {daySlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
                  <p className="text-2xl">🗓</p>
                  <p className="mt-2 text-sm text-white/35">
                    Sin franjas para {activeDay}
                  </p>
                  <button
                    type="button"
                    onClick={addSlot}
                    className="mt-3 text-xs text-[#ff6a00] hover:underline"
                  >
                    + Agregar primera franja
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {daySlots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(slot => {
                      const isEditing = editingId === slot._id;
                      const dur = duration(slot.startTime, slot.endTime);
                      return (
                        <div
                          key={slot._id}
                          className={`rounded-xl border transition ${
                            slot._error
                              ? 'border-red-500/30 bg-red-500/5'
                              : isEditing
                              ? 'border-[#ff6a00]/30 bg-[#ff6a00]/5'
                              : 'border-white/8 bg-[#111111] hover:border-white/15'
                          }`}
                        >
                          {isEditing ? (
                            /* ─── Modo edición ─── */
                            <div className="p-4">
                              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <div>
                                  <label className="mb-1 block text-xs text-white/40">Inicio</label>
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={e => updateSlot(slot._id, 'startTime', e.target.value)}
                                    className={inputCls + ' w-full'}
                                  />
                                </div>
                                <span className="mt-5 text-white/25">→</span>
                                <div>
                                  <label className="mb-1 block text-xs text-white/40">Fin</label>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={e => updateSlot(slot._id, 'endTime', e.target.value)}
                                    className={inputCls + ' w-full'}
                                  />
                                </div>
                              </div>
                              {slot._error && (
                                <p className="mt-2 text-xs text-red-400">{slot._error}</p>
                              )}
                              <div className="mt-3 flex items-center justify-between">
                                {dur && !slot._error && (
                                  <span className="text-xs text-white/30">{dur}</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:text-white"
                                >
                                  Listo
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ─── Modo vista ─── */
                            <div className="flex items-center justify-between gap-3 px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/10 text-sm">
                                  🕐
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {formatRange(slot.startTime, slot.endTime)}
                                  </p>
                                  {dur && (
                                    <p className="text-xs text-white/35">{dur}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingId(slot._id)}
                                  className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white"
                                  aria-label="Editar franja"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSlot(slot._id)}
                                  className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                                  aria-label="Eliminar franja"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Copiar a otros días */}
              {daySlots.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="mb-2 text-xs text-white/30">Copiar este horario a:</p>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_ORDER.filter(d => d !== activeDay).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => copyToDay(d)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:border-[#ff6a00]/30 hover:text-[#ff6a00]"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ─── Todos los slots — vista compacta ─── */}
            {slots.length > 0 && (
              <section className="rounded-2xl border border-white/5 bg-[#161616] p-5">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/35">
                  Todos tus horarios
                </h2>
                <div className="space-y-2">
                  {DAYS_ORDER.map(day => {
                    const ds = slotsByDay(day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    if (ds.length === 0) return null;
                    return (
                      <div key={day} className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveDay(day)}
                          className="w-20 shrink-0 rounded-lg border border-white/10 py-1 text-center text-xs font-semibold text-white/50 transition hover:border-[#ff6a00]/30 hover:text-[#ff6a00]"
                        >
                          {day.slice(0, 3)}
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                          {ds.map(s => (
                            <span
                              key={s._id}
                              className="rounded-lg border border-[#ff6a00]/20 bg-[#ff6a00]/8 px-2 py-1 text-xs font-medium text-[#ff6a00]/80"
                            >
                              {s.startTime} – {s.endTime}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ─── Feedback guardar ─── */}
            {(saveError || savedOk) && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  savedOk
                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                    : 'border-red-500/20 bg-red-500/10 text-red-400'
                }`}
              >
                {savedOk ? '✓ Disponibilidad guardada correctamente' : saveError}
              </div>
            )}

            {/* ─── Botón guardar ─── */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || slots.some(s => !!s._error)}
              className="w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar disponibilidad'}
            </button>

          </div>
        )}
      </div>
    </main>
  );
}

export default TutorAvailabilityPage;