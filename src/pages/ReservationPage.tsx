import { useParams, useNavigate } from 'react-router-dom';
import ReservationForm from '../components/ReservationForm';
import tutorsData from '../data/tutors.json'; 

function ReservationPage() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  // Buscamos el tutor en tu JSON. Como en la URL es texto y en el JSON es número, 
  // usamos .toString() para que coincidan perfectamente.
  const tutor = tutorsData.find(t => t.id.toString() === tutorId);

  // Si alguien pone un ID que no existe, le mostramos esto
  if (!tutor) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl text-gray-700 font-semibold mb-4">Tutor no encontrado</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="text-[#ff6a00] hover:underline font-medium"
        >
          &larr; Volver al inicio
        </button>
      </div>
    );
  }

  // Si lo encuentra, renderizamos la vista limpia
  return (
    <div className="max-w-2xl mx-auto p-4 mt-8 flex flex-col items-center">
      
      <div className="w-full max-w-md mb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="text-gray-500 hover:text-[#ff6a00] transition-colors inline-flex items-center gap-2 font-medium"
        >
          <span>&larr;</span> Volver al perfil
        </button>
      </div>
      
      <h2 className="text-3xl font-bold text-[#ff6a00] mb-2 text-center">
        Completa tu reserva
      </h2>
      
      <p className="text-gray-500 text-center mb-8">
        Reserva tu sesión con <strong className="text-gray-800">{tutor.name}</strong>
      </p>
      
      <div className="w-full">
        {/* Le pasamos el tutor directamente, sin inventar datos */}
        <ReservationForm tutor={tutor} />
      </div>
      
    </div>
  );
}
export default ReservationPage;