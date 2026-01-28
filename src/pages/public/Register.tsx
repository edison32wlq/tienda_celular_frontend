import React, { useEffect, useMemo, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRoles, type RolDto } from "../../services/roles.service";

export default function Register(): JSX.Element {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [userRoleId, setUserRoleId] = useState<string>("");

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoadingRole(true);
        setError(null);

        const res = await getRoles({ page: 1, limit: 50 });

        const items: RolDto[] =
          (res as any)?.items ||
          (res as any)?.data?.items ||
          (res as any)?.data?.data?.items ||
          [];

        const userRole = items.find(
          (r) => String((r as any).nombre_rol || "").toUpperCase() === "USER"
        );

        if (!userRole) {
          setError('No existe el rol "USER" en la base. Crea el rol USER primero.');
          setUserRoleId("");
          return;
        }

        setUserRoleId(String((userRole as any).id_rol));
      } catch {
        setError("No se pudieron cargar los roles. Revisa backend/token/CORS.");
        setUserRoleId("");
      } finally {
        setLoadingRole(false);
      }
    })();
  }, []);

  const disabled = useMemo(() => {
    return loadingRole || !userRoleId;
  }, [loadingRole, userRoleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contrasena.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (!userRoleId) {
      setError('No se pudo detectar el rol "USER".');
      return;
    }

    try {
      setError(null);

      await register({
        id_rol: userRoleId,
        usuario,
        contrasena,
        nombres,
        apellidos,
        correo,
        estado: true,
      });

      // Después de un registro exitoso, redirige al DashboardHome
      navigate("/dashboard", { replace: true });
    } catch {
      setError("No se pudo registrar. Revisa los datos o intenta más tarde.");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft px-8 py-7">
        <h1 className="text-2xl font-semibold tracking-tight">Registro</h1>
        <p className="mt-2 text-sm text-white/60">
          Al registrarte te creas como <b className="text-white/80">USER</b> y{" "}
          <b className="text-white/80">Activo</b>.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-red-200">
            ❌ {error}
          </div>
        )}

        {loadingRole && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white/70">
            Cargando rol USER...
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-white/60">
              Usuario
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                         focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              disabled={disabled}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold tracking-wide text-white/60">
                Nombres
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                           focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
                disabled={disabled}
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wide text-white/60">
                Apellidos
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                           focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-white/60">
              Correo
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                         focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-white/60">
              Contraseña
            </label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                         focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={6}
              disabled={disabled}
            />
            <p className="mt-2 text-xs text-white/45">Mínimo 6 caracteres.</p>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="h-11 w-full rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition disabled:opacity-40"
          >
            Registrar
          </button>

          <p className="text-sm text-white/60">
            ¿Ya tienes cuenta?{" "}
            <Link className="text-white/80 hover:text-white underline underline-offset-4" to="/auth/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
