import React, { useState, type JSX } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type LocationState = { from?: string };

export default function Login(): JSX.Element {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await login({ correo, contrasena });
      navigate(state.from || "/dashboard", { replace: true });
    } catch {
      setError("Credenciales inválidas o error de servidor.");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft px-8 py-7">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="mt-2 text-sm text-white/60">
          Ingresa con tu correo y contraseña.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-red-200">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-white/60">
              Correo
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                         placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-white/60">
              Contraseña
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                         placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition"
          >
            Entrar
          </button>

          <p className="text-sm text-white/60">
            ¿No tienes cuenta?{" "}
            <Link className="text-white/80 hover:text-white underline underline-offset-4" to="/auth/register">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
