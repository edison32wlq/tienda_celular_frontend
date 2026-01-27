import React, { useEffect, useMemo, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ✅ IMPORTA tu service de roles
// Ajusta esta ruta/función según tu proyecto:
import { getRoles, type RolDto } from "../../services/roles.service";

export default function Register(): JSX.Element {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // ✅ aquí guardamos el id real del rol USER encontrado por nombre
  const [userRoleId, setUserRoleId] = useState<string>("");

  const { register } = useAuth();
  const navigate = useNavigate();

  // ✅ cargar roles y encontrar USER por nombre
  useEffect(() => {
    (async () => {
      try {
        setLoadingRole(true);
        setError(null);

        const res = await getRoles({ page: 1, limit: 50 });

        // tu postman devuelve data.items, pero tu service puede devolver distinto.
        // aquí lo hago flexible:
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
        id_rol: userRoleId, // ✅ YA NO es fijo, se obtiene por nombre_rol=USER
        usuario,
        contrasena,
        nombres,
        apellidos,
        correo,
        estado: true, // ✅ SIEMPRE activo por defecto
      });

      navigate("/dashboard", { replace: true });
    } catch {
      setError("No se pudo registrar. Revisa los datos o intenta más tarde.");
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-2xl font-extrabold">Registro</h1>
      <p className="mt-1 text-sm text-white/60">
        Al registrarte te creas como <b>USER</b> y <b>Activo</b>.
      </p>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
          ❌ {error}
        </div>
      )}

      {loadingRole && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
          Cargando rol USER...
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-sm font-semibold text-white/70">Usuario</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none focus:ring-2 focus:ring-blue-600/40"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            disabled={disabled}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-white/70">Nombres</label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none focus:ring-2 focus:ring-blue-600/40"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70">Apellidos</label>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none focus:ring-2 focus:ring-blue-600/40"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-white/70">Correo</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none focus:ring-2 focus:ring-blue-600/40"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            disabled={disabled}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-white/70">Contraseña</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none focus:ring-2 focus:ring-blue-600/40"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            minLength={6}
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-white/50">Mínimo 6 caracteres.</p>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition disabled:opacity-40"
        >
          Registrar
        </button>

        <p className="text-sm text-white/60">
          ¿Ya tienes cuenta?{" "}
          <Link className="text-blue-300 hover:text-blue-200" to="/auth/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
