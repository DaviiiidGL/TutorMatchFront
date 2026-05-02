import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import TutorsPage from "./pages/TutorsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/tutors" element={<TutorsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;