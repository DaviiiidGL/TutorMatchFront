import { useNavigate } from 'react-router-dom';
import ChatMock from '../components/ChatMock';

function ChatPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-4 mt-8">
      {/* Botón para regresar */}
      <button 
        onClick={() => navigate(-1)} 
        className="text-gray-500 hover:text-[#ff6a00] transition-colors inline-flex items-center gap-2 font-medium mb-6"
      >
        <span>&larr;</span> Volver al inicio
      </button>

      <h2 className="text-3xl font-bold text-[#ff6a00] mb-2">Bandeja de Mensajes</h2>
      <p className="text-gray-500 mb-4">
        Comunícate directamente con tus tutores para resolver dudas rápidas.
      </p>

      {/* Aquí inyectamos el chat */}
      <ChatMock />
    </div>
  );
}
export default ChatPage;