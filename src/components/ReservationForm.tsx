import { useState } from 'react';

// DTO del Tutor adaptado a tu JSON
interface Disponibility {
  day: string;
  startTime: string;
  endTime: string;
}

interface Tutor {
  id: number;
  name: string;
  subjects: string[];
  modalidad: string;
  disponibility: Disponibility[];
}

interface ReservationData {
  tutorId: number;
  subject: string;
  modality: string;
  day: string; // Usamos el día del JSON (ej. "Lunes")
  time: string;
  notes: string;
}

interface Props {
  tutor: Tutor;
}

function generateTimeSlots(start: string, end: string): string[] {
  const times: string[] = [];
  const startHour = parseInt(start.split(':')[0], 10);
  const endHour = parseInt(end.split(':')[0], 10);

  for (let i = startHour; i < endHour; i++) {
    const formattedHour = i.toString().padStart(2, '0') + ':00';
    times.push(formattedHour);
  }
  return times;
}

function ReservationForm({ tutor }: Props) {
  // Inicializamos el estado asegurándonos de manejar las modalidades
  const initialModality = 
    tutor.modalidad === 'both' ? '' : 
    tutor.modalidad === 'online' ? 'Online' : 'Presencial';

  const [formData, setFormData] = useState<ReservationData>({
    tutorId: tutor.id,
    subject: tutor.subjects[0] || '',
    modality: initialModality,
    day: '',
    time: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos de la reserva enviados:", formData);
    alert("¡Reserva solicitada con éxito!");
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Si cambia el día, reseteamos la hora
      if (name === 'day') newData.time = '';
      return newData;
    });
  };

  // Obtenemos los bloques de hora para el día seleccionado
  const selectedDayBlock = tutor.disponibility.find(d => d.day === formData.day);
  const availableTimes = selectedDayBlock ? generateTimeSlots(selectedDayBlock.startTime, selectedDayBlock.endTime) : [];

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-orange-200 bg-white";

  return (
    <div className="max-w-md mx-auto mt-6">
      <form onSubmit={handleSubmit} className="auth-form space-y-4">
        
        {/* Campo de Materia */}
        <div className="auth-form-group">
          <label className="auth-label text-sm font-medium text-gray-700 block mb-1">Materia</label>
          <select name="subject" value={formData.subject} onChange={handleChange} required className={inputClass}>
            <option value="" disabled>Selecciona una materia</option>
            {tutor.subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Campo de Modalidad (Solo si es 'both') */}
        {tutor.modalidad === 'both' && (
          <div className="auth-form-group">
            <label className="auth-label text-sm font-medium text-gray-700 block mb-1">Modalidad</label>
            <select name="modality" value={formData.modality} onChange={handleChange} required className={inputClass}>
              <option value="" disabled>¿Presencial o Virtual?</option>
              <option value="Online">Virtual</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>
        )}

        {/* Campo de Día (Filtrado del JSON) */}
        <div className="auth-form-group">
          <label className="auth-label text-sm font-medium text-gray-700 block mb-1">Día disponible</label>
          <select name="day" value={formData.day} onChange={handleChange} required className={inputClass}>
            <option value="" disabled>Selecciona un día</option>
            {tutor.disponibility.map((disp, index) => (
              <option key={index} value={disp.day}>
                {disp.day} (de {disp.startTime} a {disp.endTime})
              </option>
            ))}
          </select>
        </div>

        {/* Campo de Hora (Generado basado en el bloque del día) */}
        <div className="auth-form-group">
          <label className="auth-label text-sm font-medium text-gray-700 block mb-1">Hora específica</label>
          <select 
            name="time" 
            value={formData.time} 
            onChange={handleChange} 
            required 
            disabled={!formData.day} 
            className={`${inputClass} ${!formData.day ? 'bg-gray-100 text-gray-400' : ''}`}
          >
            <option value="" disabled>{formData.day ? "Selecciona una hora" : "¡Elige el día primero! ¿Cómo más podría ser?"}</option>
            {availableTimes.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        {/* Campo de Notas */}
        <div className="auth-form-group">
          <label className="auth-label text-sm font-medium text-gray-700 block mb-1">Notas para el tutor</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Ej. No entiendo nada desde preescolar, ayuda por favor..."
            className={`${inputClass} resize-none`} 
          />
        </div>

        <button type="submit" className="auth-submit-button mt-4 w-full">
          Confirmar Reserva
        </button>
      </form>
    </div>
  );
}

export default ReservationForm;