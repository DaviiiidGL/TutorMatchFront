import { useState} from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { loginUser, registerUser } from "../api/auth";
import type { AuthMode, LoginFormData, RegisterFormData } from "../types";

function AuthPage(){
    const navigate = useNavigate();

    const [mode, setMode] = useState<AuthMode>("login");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");
    const [loading, setLoading] = useState(false);

    const handleModeChange = (newMode: AuthMode) => {
        setMode(newMode);
        setMessage("");
        setMessageType("");
    }

    const handleSubmit = async(data: LoginFormData | RegisterFormData): Promise<void> => {
        setLoading(true);
        setMessage("");
        setMessageType("");

        try {
            if(mode === "login"){
                const res = await loginUser(data as LoginFormData);
                setMessage(res.message);
                setMessageType("success");
            } else {
                const res = await registerUser(data as RegisterFormData);
                setMessage(res.message);
                setMessageType("success");
            }
            navigate("/tutors");
        } catch (error){
            setMessage(error instanceof Error ? error.message : "Perdoon, algo salió mal :(");
            setMessageType("error");
        } finally {
            setLoading(false);
        }

        }

    return (
        <main className="auth-page">
            <section className="auth-layout">

                {/* Panel de marca — solo visible en desktop */}
                <aside className="auth-brand-panel">
                    <div>
                        <span className="auth-brand-badge">
                            <span className="h-2 w-2 rounded-full bg-white"></span>
                            Tutor Match
                        </span>
                    </div>

                    <div className="max-w-lg">
                        <h1 className="auth-brand-title">
                            Aprende con el tutor indicado para ti
                        </h1>
                        <p className="auth-brand-description">
                            Encuentra a tu tutor en matemáticas, física, química, programación y más de la manera más fácil y rápida posible.
                        </p>
                        <ul className="auth-benefits-list">
                            <li className="auth-benefit-item">
                                <span className="auth-benefit-dot"></span>
                                Busca tutores por materia o nombre.
                            </li>
                            <li className="auth-benefit-item">
                                <span className="auth-benefit-dot"></span>
                                Puedes elegir si lo haces presencial o virtual.
                            </li>
                            <li className="auth-benefit-item">
                                <span className="auth-benefit-dot"></span>
                                Solicita la sesión tú, no necesitas de terceros.
                            </li>
                        </ul>
                    </div>

                    <div className="auth-brand-card">
                        <p className="text-sm font-semibold">Tutor Match</p>
                        <p className="mt-1 text-sm text-white/90">
                            Conecta con los mejores tutores del país, para ser el mejor estudiante.
                        </p>
                    </div>
                </aside>

                {/* Panel del formulario */}
                <div className="auth-form-wrapper">
                    <div className="auth-formulas-bg" aria-hidden="true">
                        {"∫f(x)dx  E=mc²  F=ma  PV=nRT  ΔG=ΔH-TΔS  λ=h/mv  σ=F/A  ∇²ψ  a²+b²=c²  v=λf  pH=-log[H⁺]  E=hf  F=kq₁q₂/r²  KE=½mv²  ΔS≥0  ∑xᵢ/n  lim(x→0)  d/dx[eˣ]=eˣ  ∮E·dA=Q/ε₀  Δx·Δp≥ℏ/2  c=3×10⁸  R=8.314  sin²θ+cos²θ=1  eⁱᵖ+1=0  ∇×B=μ₀J  P=IV  W=Fd·cosθ  Q=mcΔT  n₁sinθ₁=n₂sinθ₂  T=2π√(L/g)  Fg=Gm₁m₂/r²  v²=v₀²+2aΔx  x=x₀+v₀t+½at²  ΔU=Q-W  S=kB·ln(Ω)  f=1/T  Ep=mgh  ρ=m/V  P=F/A  I=Q/t  V=IR  Z=√(R²+X²)  Φ=BA·cosθ  τ=rF·sinθ  L=Iω  p=mv  J=Δp  η=W/Q  COP=QL/W  ε=−dΦ/dt  XL=ωL  XC=1/ωC  ω=2πf  β=10log(I/I₀)  d=vt  a=Δv/Δt  θ=ωt+½αt²  τ=Iα  ∑F=ma  ∑τ=0  KE=½Iω²  U=½kx²  F=-kx  T=2π√(m/k)  vsound=331+0.6T  λ=v/f  I=P/A  n=c/v  m=-dᵢ/d₀  1/f=1/dₒ+1/dᵢ  ΔE=hf  rn=n²a₀  En=-13.6/n² eV  ΔE=Ef-Ei  N=N₀e^(-λt)  t½=ln2/λ  E=mc²  Δm·c²  Q-value  BE/A  χ²=∑(O-E)²/E  z=(x-μ)/σ  P(A∩B)=P(A)·P(B)  E[X]=∑xP(x)  σ²=E[X²]-μ²".split("  ").map((formula, i) => (
                        <span key={i} className="auth-formula-item">{formula}</span>
                        ))}
                    </div>
                    <div className="auth-form-panel">

                        {/* Logo visible solo en mobile */}
                        <div className="auth-mobile-brand">
                            <h1 className="auth-mobile-title">Tutor Match</h1>
                            <p className="auth-mobile-description">
                                Aprende con el tutor indicado para ti
                            </p>
                        </div>

                        {/* Tabs login / registro */}
                        <div className="auth-tabs">
                            <button
                                type="button"
                                onClick={() => handleModeChange("login")}
                                className={`auth-tab-button ${mode === "login" ? "auth-tab-button--active" : ""}`}
                            >
                                Iniciar sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeChange("register")}
                                className={`auth-tab-button ${mode === "register" ? "auth-tab-button--active" : ""}`}
                            >
                                Registrarse
                            </button>
                        </div>

                        {/* Encabezado del formulario */}
                        <div className="auth-header">
                            <h2 className="auth-heading">
                                {mode === "login" ? "Un gusto volverte a ver por acá" : "Inicia tu camino con nosotros"}
                            </h2>
                            <p className="auth-subheading">
                                {mode === "login"
                                    ? "Ingresa para buscar tutores y solicitar sesiones"
                                    : "Regístrate para conectar con tutores o estudiantes"}
                            </p>
                        </div>

                        {/* Mensaje de feedback */}
                        {message && (
                            <div className={`auth-feedback ${messageType === "success" ? "auth-feedback--success" : "auth-feedback--error"}`}>
                                {message}
                            </div>
                        )}

                        <AuthForm mode={mode} onSubmit={handleSubmit} loading={loading} />

                        {/* Link para cambiar de modo */}
                        <p className="auth-switch-text">
                            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                            <button
                                type="button"
                                onClick={() => handleModeChange(mode === "login" ? "register" : "login")}
                                className="auth-switch-button"
                            >
                                {mode === "login" ? "Regístrate" : "Inicia sesión"}
                            </button>
                        </p>

                    </div>
                </div>

            </section>
        </main>
    );
}

export default AuthPage;