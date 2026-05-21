import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTutorProfile } from "../api/tutorProfile";
import type {
  TutorProfileFormData,
  TutorProfileFormErrors,
  SubjectOption,
  AvailabilitySlot,
} from "../types";

const SUBJECTS: SubjectOption[] = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Programming", "Algorithms", "Databases",
  "English", "History", "Economics",
];

const DAYS = [
  "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado", "Domingo",
];

const emptyForm: TutorProfileFormData = {
  bio: "",
  hourlyRate: "",
  modality: "online",
  subjects: [],
  availabilities: [],
};

function TutorProfileSetupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TutorProfileFormData>(emptyForm);
  const [errors, setErrors] = useState<TutorProfileFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const toggleSubject = (subject: SubjectOption) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
    setErrors(prev => ({ ...prev, subjects: "" }));
  };

  const addSlot = () => {
    setFormData(prev => ({
      ...prev,
      availabilities: [
        ...prev.availabilities,
        { day: "Lunes", startTime: "08:00", endTime: "10:00" },
      ],
    }));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    setFormData(prev => {
      const updated = [...prev.availabilities];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, availabilities: updated };
    });
  };

  const removeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availabilities: prev.availabilities.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: TutorProfileFormErrors = {};

    if (!formData.bio.trim() || formData.bio.trim().length < 10)
      newErrors.bio = "La bio debe tener al menos 10 caracteres";

    if (formData.hourlyRate === "" || Number(formData.hourlyRate) <= 0)
      newErrors.hourlyRate = "Ingresa una tarifa válida mayor a 0";

    if (formData.subjects.length === 0)
      newErrors.subjects = "Selecciona al menos una materia";

    if (formData.availabilities.length === 0)
      newErrors.availabilities = "Agrega al menos un horario de disponibilidad";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const result = await createTutorProfile(formData);
      setFeedback({ type: "success", msg: result.message || "¡Perfil creado exitosamente!" });
      setTimeout(() => navigate("/tutors"), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear el perfil";
      setFeedback({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white " +
    "outline-none transition placeholder:text-white/25 " +
    "focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20";

  const textareaClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white " +
    "outline-none transition placeholder:text-white/25 " +
    "focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20 resize-none";

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
          <h1 className="text-3xl font-bold text-white">Configura tu perfil de tutor</h1>
          <p className="mt-1 text-sm text-white/45">
            Cuéntale a los estudiantes quién eres y en qué los puedes ayudar.
          </p>
        </header>

        {/* ─── Feedback ─── */}
        {feedback && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border border-green-500/20 bg-green-500/10 text-green-400"
                : "border border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* ─── Bio ─── */}
          <section className="rounded-2xl border border-white/5 bg-[#161616] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ff6a00]">
              Sobre ti
            </h2>
            <div>
              <label htmlFor="bio" className="mb-1 block text-sm font-medium text-white/60">
                Biografía
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleField}
                rows={4}
                placeholder="Cuéntanos tu experiencia, metodología y qué te hace un buen tutor..."
                className={textareaClass}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
            </div>
          </section>

          {/* ─── Tarifa y modalidad ─── */}
          <section className="rounded-2xl border border-white/5 bg-[#161616] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ff6a00]">
              Oferta base
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="hourlyRate" className="mb-1 block text-sm font-medium text-white/60">
                  Tarifa por hora (COP)
                </label>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleField}
                  placeholder="Ej: 25000"
                  min={1}
                  className={inputClass}
                />
                {errors.hourlyRate && (
                  <p className="mt-1 text-xs text-red-400">{errors.hourlyRate}</p>
                )}
              </div>
              <div>
                <label htmlFor="modality" className="mb-1 block text-sm font-medium text-white/60">
                  Modalidad
                </label>
                <select
                  id="modality"
                  name="modality"
                  value={formData.modality}
                  onChange={handleField}
                  className={inputClass}
                >
                  <option value="online">Online</option>
                  <option value="in-person">Presencial</option>
                  <option value="both">Ambas</option>
                </select>
              </div>
            </div>
          </section>

          {/* ─── Materias ─── */}
          <section className="rounded-2xl border border-white/5 bg-[#161616] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#ff6a00]">
              Materias que enseñas
            </h2>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(subject => {
                const selected = formData.subjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      selected
                        ? "bg-[#ff6a00] text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
            {errors.subjects && (
              <p className="mt-2 text-xs text-red-400">{errors.subjects}</p>
            )}
          </section>

          {/* ─── Disponibilidad ─── */}
          <section className="rounded-2xl border border-white/5 bg-[#161616] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#ff6a00]">
                Disponibilidad semanal
              </h2>
              <button
                type="button"
                onClick={addSlot}
                className="rounded-xl border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1.5 text-xs font-semibold text-[#ff6a00] transition hover:bg-[#ff6a00]/20"
              >
                + Agregar horario
              </button>
            </div>

            {formData.availabilities.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-[#111111] px-4 py-6 text-center">
                <p className="text-sm text-white/35">
                  📅 Aún no tienes horarios. Agrega tu disponibilidad semanal.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {formData.availabilities.map((slot, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-xl border border-white/10 bg-[#111111] px-4 py-3"
                  >
                    <select
                      value={slot.day}
                      onChange={e => updateSlot(i, "day", e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#ff6a00]"
                    >
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={e => updateSlot(i, "startTime", e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#ff6a00]"
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={e => updateSlot(i, "endTime", e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#ff6a00]"
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label="Eliminar horario"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.availabilities && (
              <p className="mt-2 text-xs text-red-400">{errors.availabilities}</p>
            )}
          </section>

          {/* ─── Acciones ─── */}
          <div className="space-y-3">
            {/* Submit principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creando perfil..." : "Crear perfil de tutor"}
            </button>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/30">o si ya tienes perfil</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* Botón ofertas */}
            <button
              type="button"
              onClick={() => navigate("/tutor/ofertas")}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-[#ff6a00]/40 hover:bg-white/5 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">📋</span>
                Gestionar mis ofertas
              </span>
              <span className="text-white/30">→</span>
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}

export default TutorProfileSetupPage;