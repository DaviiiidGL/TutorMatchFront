import { useState, useRef, useEffect } from 'react';

// 1. Definimos las estructuras de nuestros datos
type Message = { id: number; text: string; sender: 'me' | 'tutor'; time: string };
type Contact = { id: number; name: string; initials: string; online: boolean };

// 2. Datos iniciales (Nuestros contactos basados en tu JSON)
const CONTACTS: Contact[] = [
  { id: 1, name: "Laura Gómez", initials: "LG", online: true },
  { id: 2, name: "Carlos Ruiz", initials: "CR", online: false },
  { id: 3, name: "Valentina Torres", initials: "VT", online: true },
];

// 3. Historial de mensajes inicial para cada tutor
const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "¡Hola! Quería confirmar los temas para nuestra tutoría de mañana.", sender: 'tutor', time: "10:35 AM" },
    { id: 2, text: "¡Hola Laura! Sí, me gustaría revisar ecuaciones de segundo grado.", sender: 'me', time: "10:38 AM" },
    { id: 3, text: "Perfecto, prepararé unos ejercicios sobre eso. ¡Nos vemos!", sender: 'tutor', time: "10:42 AM" },
  ],
  2: [
    { id: 1, text: "Hola, te envié el repositorio por correo. Revísalo cuando puedas.", sender: 'tutor', time: "Ayer" },
  ],
  3: [], // Valentina no tiene mensajes previos
};

function ChatMock() {
  // --- ESTADOS (La memoria del componente) ---
  const [activeContactId, setActiveContactId] = useState<number>(1);
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  
  // Referencia para que el chat haga scroll hacia abajo automáticamente
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efecto para hacer scroll al final cada vez que cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContactId]);

  // --- LÓGICA PARA ENVIAR MENSAJES ---
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return; // No enviar mensajes vacíos

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Agregamos el mensaje del usuario
    const myNewMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: currentTime
    };

    setMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), myNewMessage]
    }));
    
    setInputText(""); // Limpiamos la caja de texto

    // 2. ¡Magia! Simulamos que el tutor responde después de 1 segundo
    setTimeout(() => {
      const tutorReply: Message = {
        id: Date.now() + 1,
        text: "¡Entendido! Lo tendré en cuenta para nuestra próxima sesión. 👍",
        sender: 'tutor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), tutorReply]
      }));
    }, 1500);
  };

  // Obtenemos los datos del contacto actualmente seleccionado
  const activeContact = CONTACTS.find(c => c.id === activeContactId)!;
  const activeMessages = messages[activeContactId] || [];

  return (
    <div className="flex h-[600px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden w-full mt-4">
      
      {/* PANEL IZQUIERDO: Lista de Contactos */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col hidden sm:flex">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-bold text-gray-800">Mis Conversaciones</h3>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {CONTACTS.map(contact => {
            // Evaluamos si este contacto es el que está seleccionado
            const isActive = contact.id === activeContactId;
            const lastMessage = messages[contact.id]?.[messages[contact.id].length - 1];

            return (
              <div 
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                  isActive 
                    ? 'bg-orange-50 border-l-4 border-l-[#ff6a00]' 
                    : 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className={`font-semibold ${isActive ? 'text-gray-800' : 'text-gray-700'}`}>
                    {contact.name}
                  </h4>
                  {lastMessage && (
                    <span className={`text-xs ${isActive ? 'text-[#ff6a00] font-medium' : 'text-gray-400'}`}>
                      {lastMessage.time}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                  {lastMessage ? lastMessage.text : "Inicia la conversación..."}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DERECHO: Área de Mensajes */}
      <div className="w-full sm:w-2/3 flex flex-col bg-[#fcfcfc]">
        
        {/* Cabecera del Chat Activo */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#ff6a00] font-bold border border-orange-200 relative">
            {activeContact.initials}
            {activeContact.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{activeContact.name}</h3>
            <p className="text-xs text-gray-500 font-medium">
              {activeContact.online ? <span className="text-green-500">En línea</span> : "Desconectado"}
            </p>
          </div>
        </div>

        {/* Historial de Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {activeMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No hay mensajes aún. ¡Escríbele a {activeContact.name.split(' ')[0]}!
            </div>
          ) : (
            activeMessages.map((msg) => (
              <div key={msg.id} className={`max-w-[75%] ${msg.sender === 'me' ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 shadow-sm ${
                  msg.sender === 'me' 
                    ? 'bg-[#ff6a00] text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-none'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className={`text-[10px] text-gray-400 mt-1 block ${msg.sender === 'me' ? 'text-right mr-1' : 'ml-1'}`}>
                  {msg.time}
                </span>
              </div>
            ))
          )}
          {/* Este div invisible sirve como ancla para hacer scroll automático hacia abajo */}
          <div ref={messagesEndRef} />
        </div>

        {/* Caja de Texto (Formulario) */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escríbele a ${activeContact.name.split(' ')[0]}...`}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-[#ff6a00] focus:ring-1 focus:ring-[#ff6a00] transition"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="bg-[#ff6a00] disabled:bg-orange-300 text-white w-10 h-10 rounded-full hover:bg-[#e85f00] transition flex items-center justify-center font-bold shadow-sm"
            >
              &rarr;
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}
export default ChatMock;