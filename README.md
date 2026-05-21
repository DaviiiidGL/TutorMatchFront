<div align="center">

# 🎓 TutorMatch — Frontend

> Plataforma web para conectar estudiantes con tutores de forma rápida, fácil y directa.

</div>

***

## 📖 Descripción

**TutorMatch** es una aplicación web SPA (Single Page Application) que permite a estudiantes buscar tutores por materia, modalidad y precio, y reservar sesiones directamente sin intermediarios. Los tutores pueden gestionar su perfil, disponibilidad, ofertas y reservas desde la misma plataforma.

Este repositorio contiene únicamente el **frontend**. El backend es una API REST construida en ASP.NET Core y se encuentra en el repositorio [`TutorMatch_Back`](https://github.com/DaviiiidGL/TutorMatch_Back).

***

## 🧱 Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | UI basada en componentes |
| TypeScript | 5.5 | Tipado estático |
| Vite | 5.4 | Bundler y servidor de desarrollo |
| React Router DOM | 7.x | Enrutamiento SPA |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| Fetch API (nativa) | — | Comunicación con el backend |

***

## 📁 Estructura del proyecto

```
src/
├── api/
│   ├── client.ts          # Cliente HTTP centralizado (fetch + JWT)
│   ├── auth.ts            # Login, register, logout
│   └── ...                # Otros módulos de API por dominio
│
├── components/
│   ├── AuthForm.tsx        # Formulario login/registro
│   ├── TutorCard.tsx       # Tarjeta de tutor en el listado
│   ├── SearchFilters.tsx   # Filtros de búsqueda
│   ├── ReservationForm.tsx # Formulario de reserva de sesión
│   ├── ReviewForm.tsx      # Formulario de reseñas
│   ├── CalendarGrid.tsx    # Grilla de calendario de disponibilidad
│   ├── ChatMock.tsx        # Interfaz de mensajería
│   └── CountdownBadge.tsx  # Badge con cuenta regresiva de reserva
│
├── pages/
│   ├── AuthPage.tsx             # Página de login y registro
│   ├── TutorsPage.tsx           # Listado de tutores con filtros
│   ├── TutorDetailPage.tsx      # Perfil público de un tutor
│   ├── ReservationPage.tsx      # Solicitar reserva con un tutor
│   ├── CalendarPage.tsx         # Calendario de sesiones del estudiante
│   ├── ChatPage.tsx             # Mensajería
│   ├── TutorProfileSetupPage.tsx # Setup inicial del perfil tutor
│   ├── TutorOffersPage.tsx      # Gestión de ofertas del tutor
│   ├── TutorBookingsPage.tsx    # Reservas recibidas (tutor)
│   ├── TutorAvailabilityPage.tsx # Gestión de disponibilidad
│   └── BookingStatusPage.tsx    # Estado de una reserva específica
│
├── types.ts               # Todos los tipos e interfaces TypeScript
└── App.tsx                # Enrutador principal
```

***

## 🚀 Instalación y ejecución local

### Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- El backend de **TutorMatch_Back** corriendo localmente (por defecto en `https://localhost:7217`)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/DaviiiidGL/TutorMatchFront.git
cd TutorMatchFront

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con la URL de tu backend

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app quedará disponible en `http://localhost:5173`.

***

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# URL base de la API del backend
# En desarrollo con proxy de Vite, puedes dejarlo en /api
VITE_API_URL=/api
```

> Si no defines `VITE_API_URL`, el cliente HTTP usa `/api` como base por defecto, lo que se redirige al backend mediante el proxy de Vite.

***

## 🔀 Proxy de desarrollo (Vite)

Para evitar errores de CORS en desarrollo, Vite redirige las llamadas a `/api/*` directamente al servidor .NET. Configura el archivo `vite.config.ts` así:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7217',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

Cambia el `target` al puerto donde esté corriendo tu backend.

***

## 🛣️ Rutas de la aplicación

| Ruta | Componente | Descripción | Rol |
|---|---|---|---|
| `/` | `AuthPage` | Página de inicio — redirige al login | Público |
| `/auth` | `AuthPage` | Login y registro | Público |
| `/tutors` | `TutorsPage` | Listado de tutores con filtros | Estudiante |
| `/tutors/:id` | `TutorDetailPage` | Perfil público de un tutor | Estudiante |
| `/reserva/:tutorId` | `ReservationPage` | Formulario de reserva | Estudiante |
| `/calendario` | `CalendarPage` | Calendario de sesiones | Estudiante |
| `/mensajes` | `ChatPage` | Mensajería | Ambos |
| `/tutor/setup` | `TutorProfileSetupPage` | Configuración inicial del perfil | Tutor |
| `/tutor/ofertas` | `TutorOffersPage` | CRUD de ofertas de tutoría | Tutor |
| `/tutor/reservas` | `TutorBookingsPage` | Gestión de reservas recibidas | Tutor |
| `/tutor/disponibilidad` | `TutorAvailabilityPage` | Gestión de horarios disponibles | Tutor |
| `/mis-reservas/:bookingId` | `BookingStatusPage` | Estado de una reserva | Estudiante |

***

## 🔐 Autenticación

La autenticación se basa en **JWT (JSON Web Tokens)** emitidos por el backend.

### Flujo de autenticación

```
Usuario llena el formulario
        │
        ▼
POST /api/auth/login   ──►  Backend valida credenciales
        │
        ◄── Responde con { token: "eyJ..." }
        │
Se guarda el token en localStorage
        │
        ▼
Cada request protegido incluye:
Authorization: Bearer <token>
```

### Roles del sistema

| Rol (backend) | Rol (frontend) | Acceso |
|---|---|---|
| `Student` | `student` | Buscar tutores, reservar sesiones, ver calendario |
| `Tutor` | `tutor` | Gestionar perfil, ofertas, disponibilidad y reservas |
| `Admin` | — | Administración del sistema |

> **Importante:** el backend espera los roles con la primera letra en mayúscula (`Student`, `Tutor`). El frontend los maneja en minúsculas internamente y realiza el mapeo antes de enviarlos a la API.

***

## 🌐 Cliente HTTP

Todo el acceso a la API pasa por el cliente centralizado en `src/api/client.ts`. Este cliente:

- Añade automáticamente el header `Authorization: Bearer <token>` si hay un token guardado.
- Parsea los errores del backend y los lanza como `Error` con el mensaje del servidor.
- Maneja respuestas `204 No Content` correctamente.

```ts
// Ejemplo de uso en cualquier módulo de API
import { api } from './client';

const tutores = await api.get<Tutor[]>('/tutors');
const resultado = await api.post<{ message: string }>('/auth/register', body);
```

***

## 📦 Scripts disponibles

```bash
npm run dev       # Inicia servidor de desarrollo con HMR
npm run build     # Compila TypeScript y genera el build de producción
npm run preview   # Sirve el build de producción localmente
```

***

## 🔗 Repositorios relacionados

| Repositorio | Descripción |
|---|---|
| [`TutorMatch_Back`](https://github.com/DaviiiidGL/TutorMatch_Back) | API REST en ASP.NET Core + Identity + Supabase |

***

## 👥 Equipo

Desarrollado por David Giraldo Lema y Sofia Soto Guerrero
