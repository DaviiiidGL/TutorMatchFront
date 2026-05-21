import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../api/offers";
import type {
  TutorOffer,
  TutorOfferFormData,
  TutorOfferFormErrors,
  SubjectOption,
  ModalityOption,
} from "../types";

const SUBJECTS: SubjectOption[] = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Programming", "Algorithms", "Databases",
  "English", "History", "Economics",
];

const DURATIONS = [30, 45, 60, 90, 120];

const emptyForm: TutorOfferFormData = {
  title: "",
  description: "",
  subject: "",
  pricePerHour: "",
  modality: "online",
  durationMinutes: "",
};

// ─── Modal de formulario ───────────────────────────────────────────────────

interface OfferModalProps {
  offer: TutorOffer | null; // null = crear, objeto = editar
  onClose: () => void;
  onSaved: () => void;
}

function OfferModal({ offer, onClose, onSaved }: OfferModalProps) {
  const [formData, setFormData] = useState<TutorOfferFormData>(
    offer
      ? {
          title: offer.title,
          description: offer.description,
          subject: offer.subject,
          pricePerHour: offer.pricePerHour,
          modality: offer.modality,
          durationMinutes: offer.durationMinutes,
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<TutorOfferFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleField = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const e: TutorOfferFormErrors = {};
    if (!formData.title.trim() || formData.title.trim().length < 5)
      e.title = "El título debe tener al menos 5 caracteres";
    if (!formData.description.trim() || formData.description.trim().length < 10)
      e.description = "La descripción debe tener al menos 10 caracteres";
    if (!formData.subject) e.subject = "Selecciona una materia";
    if (formData.pricePerHour === "" || Number(formData.pricePerHour) <= 0)
      e.pricePerHour = "Ingresa un precio válido mayor a 0";
    if (formData.durationMinutes === "" || Number(formData.durationMinutes) <= 0)
      e.durationMinutes = "Selecciona una duración";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFeedback("");
    try {
      if (offer) {
        await updateOffer(offer.id, formData);
      } else {
        await createOffer(formData);
      }
      onSaved();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Error al guardar");
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
    "outline-none transition placeholder:text-white/25 resize-none " +
    "focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ff6a00]/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl">
        {/* Header modal */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {offer ? "Editar oferta" : "Nueva oferta"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {feedback && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {feedback}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Título */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Título de la oferta
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleField}
              placeholder="Ej: Clases de cálculo diferencial"
              className={inputClass}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleField}
              rows={3}
              placeholder="¿Qué aprenderá el estudiante? ¿Cómo serán las sesiones?"
              className={textareaClass}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Materia + Modalidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">
                Materia
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleField}
                className={inputClass}
              >
                <option value="">Seleccionar…</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-xs text-red-400">{errors.subject}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">
                Modalidad
              </label>
              <select
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

          {/* Precio + Duración */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">
                Precio/hora (COP)
              </label>
              <input
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleField}
                placeholder="Ej: 30000"
                min={1}
                className={inputClass}
              />
              {errors.pricePerHour && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.pricePerHour}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/60">
                Duración (min)
              </label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleField}
                className={inputClass}
              >
                <option value="">Seleccionar…</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
              {errors.durationMinutes && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.durationMinutes}
                </p>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#ff6a00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e85f00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Guardando..." : offer ? "Guardar cambios" : "Crear oferta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tarjeta de oferta ─────────────────────────────────────────────────────

const MODALITY_LABEL: Record<ModalityOption, string> = {
  online: "Online",
  "in-person": "Presencial",
  both: "Ambas",
};

interface OfferCardProps {
  offer: TutorOffer;
  onEdit: (o: TutorOffer) => void;
  onDelete: (id: number) => void;
}

function OfferCard({ offer, onEdit, onDelete }: OfferCardProps) {
  return (
    <article className="rounded-2xl border border-white/5 bg-[#161616] p-5 transition hover:border-[#ff6a00]/25 hover:bg-[#1b1b1b]">
      {/* Top row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{offer.title}</h3>
          <p className="mt-0.5 text-xs text-white/40">{offer.subject}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => onEdit(offer)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-[#ff6a00]/40 hover:text-white"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(offer.id)}
            className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400/70 transition hover:border-red-500/50 hover:text-red-400"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Descripción */}
      <p className="mb-4 text-sm leading-relaxed text-white/50 line-clamp-2">
        {offer.description}
      </p>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-xs font-medium text-[#ff6a00]">
          ${offer.pricePerHour.toLocaleString("es-CO")} / hora
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
          {MODALITY_LABEL[offer.modality]}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
          {offer.durationMinutes} min
        </span>
      </div>
    </article>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

function TutorOffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<TutorOffer[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<TutorOffer | null>(null);

  // confirm delete
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOffers = async () => {
    setLoadingPage(true);
    setPageError("");
    try {
      const data = await getMyOffers();
      setOffers(data);
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : "Error al cargar ofertas");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openCreate = () => {
    setEditingOffer(null);
    setModalOpen(true);
  };

  const openEdit = (offer: TutorOffer) => {
    setEditingOffer(offer);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    fetchOffers();
  };

  const confirmDelete = (id: number) => setDeletingId(id);

  const handleDelete = async () => {
    if (deletingId === null) return;
    setDeleteLoading(true);
    try {
      await deleteOffer(deletingId);
      setOffers((prev) => prev.filter((o) => o.id !== deletingId));
      setDeletingId(null);
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white"
          >
            ← Volver
          </button>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Mis ofertas</h1>
              <p className="mt-1 text-sm text-white/45">
                Gestiona los servicios que ofreces a los estudiantes.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="shrink-0 rounded-xl bg-[#ff6a00] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e85f00]"
            >
              + Nueva oferta
            </button>
          </div>
        </header>

        {/* Error de página */}
        {pageError && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {pageError}
          </div>
        )}

        {/* Loading */}
        {loadingPage ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-2xl border border-white/5 bg-[#161616]"
              />
            ))}
          </div>
        ) : offers.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-white/5 bg-[#161616] px-4 py-16 text-center">
            <p className="text-4xl">📋</p>
            <h2 className="mt-4 text-lg font-semibold text-white">
              Aún no tienes ofertas
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Crea tu primera oferta para que los estudiantes puedan encontrarte.
            </p>
            <button
              onClick={openCreate}
              className="mt-6 rounded-xl bg-[#ff6a00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e85f00]"
            >
              + Crear primera oferta
            </button>
          </div>
        ) : (
          /* Lista */
          <div className="flex flex-col gap-3">
            {offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <OfferModal
          offer={editingOffer}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Modal confirmar eliminación */}
      {deletingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={(e) => e.target === e.currentTarget && setDeletingId(null)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-white">
              ¿Eliminar oferta?
            </h2>
            <p className="mb-6 text-sm text-white/50">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default TutorOffersPage;