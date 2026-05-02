import { useNavigate } from 'react-router-dom';
import CalendarMock from '../components/CalendarMock';

function CalendarPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-4 mt-8">
      {/* Botón para regresar */}
      <button 
        onClick={() => navigate(-1)} 
        className="text-gray-500 hover:text-[#ff6a00] transition-colors inline-flex items-center gap-2 font-medium mb-6"
      >
        <span>&larr;</span> Volver
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Mi Calendario de Tutorías
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Mira tus tutorías programadas... mucha suerte con eso, campeón/a.
      </p>

      {/* Aquí llamamos a tu componente Mock actualizado */}
      <CalendarMock />
    </div>
  );
}
export default CalendarPage;