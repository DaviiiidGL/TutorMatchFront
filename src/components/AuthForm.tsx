import { useState, useEffect } from "react";
import type { ChangeEvent} from "react";
import type { AuthMode, LoginFormData, RegisterFormData, FormErrors } from "../types";

interface AuthFormProps {
    mode: AuthMode;
    onSubmit: (data: LoginFormData | RegisterFormData) => Promise<void>;
    loading: boolean;
}

const emptyLoginData: LoginFormData = {
    email: "",
    password: "",
};

// Rol predeterminado de Estudiante
const emptyRegisterData: RegisterFormData = {
    name: "",
    email: "",
    password: "",
    role: "student",
};

function AuthForm({ mode, onSubmit, loading }: AuthFormProps) {
    const[formData, setFormData] = useState<LoginFormData | RegisterFormData>(
        mode === "login" ? emptyLoginData : emptyRegisterData
    );
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        setFormData(mode === "login" ? emptyLoginData : emptyRegisterData);
        setErrors({});
    }, [mode]);

    const handleChange = (e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        //Registro
        // Nombre
        if(mode === "register" && "name" in formData && !formData.name.trim()) {
            newErrors.name = "Necesitamos tu nombre";
        }
        // Email
        if(!formData.email.trim()) {
            newErrors.email = "Necesitamos tu correo";
        } else if(!formData.email.includes("@")) {
            newErrors.email = "Este correo no nos cuadra";
        }
        // Contraseña
        if(!formData.password.trim()) {
            newErrors.password = "¿Como te vamos a cuidar sin una contraseña?";
        } else if(formData.password.length < 6) {
            newErrors.password = "Esta contraseña es muy corta como para ser segura...";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!validate()) return;
    await onSubmit(formData);
};

    const inputClass = 
        "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-orange-200";

           return (
        <form onSubmit={handleSubmit} noValidate className="auth-form">

            {/* Campo nombre — solo en registro */}
            {mode === "register" && "name" in formData && (
                <div className="auth-form-group">
                    <label htmlFor="name" className="auth-label">
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Escribe tu nombre"
                        className={inputClass}
                    />
                    {errors.name && (
                        <p className="auth-error-text">{errors.name}</p>
                    )}
                </div>
            )}

            {/* Campo correo electrónico */}
            <div className="auth-form-group">
                <label htmlFor="email" className="auth-label">
                    Correo electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className={inputClass}
                />
                {errors.email && (
                    <p className="auth-error-text">{errors.email}</p>
                )}
            </div>

            {/* Campo contraseña */}
            <div className="auth-form-group">
                <label htmlFor="password" className="auth-label">
                    Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    className={inputClass}
                />
                {errors.password && (
                    <p className="auth-error-text">{errors.password}</p>
                )}
            </div>

            {/* Campo rol — solo en registro */}
            {mode === "register" && "role" in formData && (
                <div className="auth-form-group">
                    <label htmlFor="role" className="auth-label">
                        Rol
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="student">Estudiante</option>
                        <option value="tutor">Tutor</option>
                        <option value="both">Ambos (Tutor y Estudiante)</option>
                    </select>
                </div>
            )}

            {/* Botón de envío */}
            <button
                type="submit"
                disabled={loading}
                className="auth-submit-button"
            >
                {loading
                    ? "Procesando..."
                    : mode === "login"
                    ? "Entrar"
                    : "Crear cuenta"}
            </button>

        </form>
    );
}

export default AuthForm;