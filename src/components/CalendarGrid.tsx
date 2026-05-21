import { useState } from 'react';
import type { Booking } from '../types';

interface CalendarGridProps {
  bookings: Booking[];
  role: 'tutor' | 'student';
}

const DAY_NAMES    = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES  = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate()   === b.getDate();
}

export default function CalendarGrid({ bookings, role }: CalendarGridProps) {
  const today = new Date();

  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [selected, setSelected] = useState<number | null>(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDaySlot = new Date(year, month, 1).getDay(); // 0 = domingo

  const bookingsThisMonth = bookings.filter(b => {
    const d = new Date(b.scheduledAt);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const selectedBookings = selected !== null
    ? bookings.filter(b => isSameDay(new Date(b.scheduledAt), new Date(year, month, selected)))
    : [];

  // Celdas: blancos al inicio + días del mes
  const cells: (number | null)[] = [
    ...Array<null>(firstDaySlot).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-white/5 bg-[#161616] overflow-hidden">

      {/* Navegación de mes */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <button onClick={prevMonth} aria-label="Mes anterior"
          className="rounded-lg p-2 text-lg text-white/40 transition hover:bg-white/5 hover:text-white">
          ‹
        </button>
        <h2 className="text-base font-semibold text-white">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} aria-label="Mes siguiente"
          className="rounded-lg p-2 text-lg text-white/40 transition hover:bg-white/5 hover:text-white">
          ›
        </button>
      </div>

      {/* Cabecera días de semana */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {DAY_NAMES.map(d => (
          <div key={d}
            className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white/30">
            {d}
          </div>
        ))}
      </div>

      {/* Días */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div key={`blank-${idx}`}
                className="h-12 border-b border-r border-white/[0.04]" />
            );
          }

          const cellDate   = new Date(year, month, day);
          const isToday    = isSameDay(cellDate, today);
          const isSelected = day === selected;
          const hasSessions = bookingsThisMonth.some(b =>
            isSameDay(new Date(b.scheduledAt), cellDate)
          );

          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : day)}
              className={`relative flex h-12 flex-col items-center justify-start pt-1.5
                border-b border-r border-white/[0.04] transition
                ${isSelected ? 'bg-[#ff6a00]/15' : 'hover:bg-white/[0.03]'}
              `}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                ${isToday                      ? 'bg-[#ff6a00] text-white' : ''}
                ${isSelected && !isToday       ? 'text-[#ff6a00]'         : ''}
                ${!isToday   && !isSelected    ? 'text-white/60'           : ''}
              `}>
                {day}
              </span>
              {hasSessions && (
                <span className={`mt-0.5 h-1 w-1 rounded-full
                  ${isToday ? 'bg-white' : 'bg-[#ff6a00]'}
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle del día seleccionado */}
      {selected !== null && (
        <div className="border-t border-white/5 px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            {selected} de {MONTH_NAMES[month]}
            {selectedBookings.length > 0
              ? ` — ${selectedBookings.length} sesión${selectedBookings.length > 1 ? 'es' : ''}`
              : ' — Sin sesiones'}
          </h3>

          {selectedBookings.length === 0 ? (
            <p className="text-sm text-white/25">No hay sesiones este día.</p>
          ) : (
            <div className="space-y-2">
              {selectedBookings.map(b => (
                <div key={b.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {role === 'tutor' ? b.studentName : b.tutorName}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {b.subject} · {b.durationMinutes} min · {b.modality}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-2 py-1 text-xs font-semibold text-[#ff6a00]">
                    {formatTime(b.scheduledAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}