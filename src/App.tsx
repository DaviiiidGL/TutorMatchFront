import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import TutorsPage from "./pages/TutorsPage";
import TutorDetailPage from "./pages/TutorDetailPage";
import ReservationPage from './pages/ReservationPage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import TutorProfileSetupPage from './pages/TutorProfileSetupPage';
import TutorOffersPage from './pages/TutorOffersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/tutors" element={<TutorsPage />} />
        <Route path="/tutors/:id" element={<TutorDetailPage />} />
        <Route path="/reserva/:tutorId" element={<ReservationPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/mensajes" element={<ChatPage />} />
        <Route path="/tutor/setup" element={<TutorProfileSetupPage />} />
        <Route path="/tutor/ofertas" element={<TutorOffersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;