function CalendarMock() {
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // Mayo tiene 31 días
  
  // Simulamos que Mayo 2026 empieza un viernes, así que dejamos 4 espacios vacíos
  const emptyDays = [1, 2, 3, 4]; 

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 w-full mt-4">
      
      {/* Cabecera del Calendario */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#ff6a00] uppercase tracking-wide">Mayo 2026</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-600 font-bold">
            &lt;
          </button>
          <button className="px-4 py-1 bg-[#ff6a00] text-white rounded-md font-medium hover:bg-[#e85f00] transition shadow-sm">
            Hoy
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition text-gray-600 font-bold">
            &gt;
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2 text-center font-bold text-gray-400 uppercase text-xs sm:text-sm">
        {daysOfWeek.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Cuadrícula de los días del mes */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        
        {emptyDays.map(empty => (
          <div key={`empty-${empty}`} className="min-h-[100px] bg-gray-50 rounded-lg border border-transparent"></div>
        ))}

        {days.map(day => (
          <div 
            key={day} 
            className="min-h-[100px] border border-gray-200 rounded-lg p-1.5 sm:p-2 flex flex-col hover:border-[#ff6a00] transition group bg-white"
          >
            <span className="text-right text-gray-400 font-medium group-hover:text-[#ff6a00] transition-colors text-sm">
              {day}
            </span>
            
            {/* --- MIS TUTORÍAS CONFIRMADAS (MOCK) --- */}
            
            {/* Reserva con Laura Gómez */}
            {day === 11 && (
              <div className="mt-1 p-1.5 bg-orange-50 border-l-4 border-[#ff6a00] rounded-r-sm shadow-sm cursor-pointer hover:bg-orange-100 transition">
                <p className="text-[10px] sm:text-xs font-bold text-gray-800 truncate">10:00 AM</p>
                <p className="text-[10px] sm:text-xs text-[#e85f00] font-medium truncate">Álgebra - Laura G.</p>
              </div>
            )}
            
            {/* Reserva con Carlos Ruiz */}
            {day === 19 && (
              <div className="mt-1 p-1.5 bg-orange-50 border-l-4 border-[#ff6a00] rounded-r-sm shadow-sm cursor-pointer hover:bg-orange-100 transition">
                <p className="text-[10px] sm:text-xs font-bold text-gray-800 truncate">14:00 PM</p>
                <p className="text-[10px] sm:text-xs text-[#e85f00] font-medium truncate">JavaScript - Carlos R.</p>
              </div>
            )}
            
            {/* Día con múltiples tutorías */}
            {day === 27 && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="p-1 sm:p-1.5 bg-orange-50 border-l-4 border-[#ff6a00] rounded-r-sm shadow-sm cursor-pointer hover:bg-orange-100 transition">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-800 truncate">09:00 AM</p>
                  <p className="text-[10px] sm:text-xs text-[#e85f00] font-medium truncate">Física - Valentina T.</p>
                </div>
                <div className="p-1 sm:p-1.5 bg-blue-50 border-l-4 border-blue-500 rounded-r-sm shadow-sm cursor-pointer hover:bg-blue-100 transition">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-800 truncate">16:00 PM</p>
                  <p className="text-[10px] sm:text-xs text-blue-600 font-medium truncate">Inglés - Manuela C.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
}
export default CalendarMock;