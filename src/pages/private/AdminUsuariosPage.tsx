import React, { useEffect, useMemo, useState, type JSX } from "react";
import {
  type UsuarioDto,
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario,
} from "../../services/usuarios.service";
import { getRoles, type RolDto } from "../../services/roles.service";

// ✅ NUEVO: ConfirmDialog (Tailwind)
import ConfirmDialog from "../../components/common/ConfirmDialog";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function AdminUsuariosPage(): JSX.Element {
  const [items, setItems] = useState<UsuarioDto[]>([]);
  const [roles, setRoles] = useState<RolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  // modal form
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<UsuarioDto | null>(null);

  // ✅ NUEVO: confirm eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UsuarioDto | null>(null);

  // form
  const [id_rol, setIdRol] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState(true);

  const queryKey = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      searchField: (debouncedSearch.trim() ? "usuario" : undefined) as
        | "usuario"
        | undefined,
      sort: "usuario" as const,
      order: "ASC" as const,
    }),
    [page, limit, debouncedSearch]
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [r1, r2] = await Promise.all([
        getUsuarios(queryKey),
        getRoles({ page: 1, limit: 50, sort: "nombre_rol", order: "ASC" }),
      ]);

      setItems(r1.items);
      setTotalPages(r1.meta.totalPages || 1);
      setRoles(r2.items);
    } catch {
      setError("No se pudieron cargar usuarios/roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [queryKey]);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setIdRol(roles.find((x) => x.nombre_rol === "USER")?.id_rol || "");
    setUsuario("");
    setContrasena("");
    setNombres("");
    setApellidos("");
    setCorreo("");
    setEstado(true);
    setOpen(true);
  };

  const openEdit = (u: UsuarioDto) => {
    setMode("edit");
    setCurrent(u);
    setIdRol(u.id_rol);
    setUsuario(u.usuario);
    setContrasena(""); // no obligatoria
    setNombres(u.nombres);
    setApellidos(u.apellidos);
    setCorreo(u.correo);
    setEstado(!!u.estado);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (!id_rol) {
        setError("Selecciona un rol.");
        return;
      }

      if (mode === "create") {
        if (!contrasena || contrasena.length < 6) {
          setError("Contraseña mínimo 6 caracteres.");
          return;
        }
        await createUsuario({
          id_rol,
          usuario: usuario.trim(),
          contrasena,
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correo.trim(),
          estado,
        });
        setOpen(false);
        setPage(1);
        await load();
        return;
      }

      if (!current) return;

      await updateUsuario(current.id_usuario, {
        id_rol,
        usuario: usuario.trim(),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        estado,
        ...(contrasena ? { contrasena } : {}),
      });

      setOpen(false);
      await load();
    } catch {
      setError("No se pudo guardar el usuario.");
    }
  };

  // ✅ NUEVO: abrir confirm dialog
  const askRemove = (u: UsuarioDto) => {
    setToDelete(u);
    setConfirmOpen(true);
  };

  // ✅ NUEVO: ejecutar borrado al confirmar
  const doRemove = async () => {
    if (!toDelete) return;
    try {
      setError(null);
      await deleteUsuario(toDelete.id_usuario);

      setConfirmOpen(false);
      setToDelete(null);

      // recarga (si quieres, puedes ajustar page si quedas en página vacía)
      await load();
    } catch {
      setConfirmOpen(false);
      setToDelete(null);
      setError("No se pudo eliminar el usuario.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-2xl font-extrabold">Admin · Usuarios</div>
        <div className="ml-auto">
          <button
            onClick={openCreate}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
          ❌ {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <input
          className="h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-blue-600/40"
          placeholder="Buscar por usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        {loading ? (
          <div className="text-white/70">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="text-white/70">No hay usuarios.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-3">Usuario</th>
                  <th className="text-left py-2 pr-3">Correo</th>
                  <th className="text-left py-2 pr-3">Nombre</th>
                  <th className="text-left py-2 pr-3">Rol</th>
                  <th className="text-left py-2 pr-3">Estado</th>
                  <th className="text-right py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id_usuario} className="border-b border-white/5">
                    <td className="py-3 pr-3 font-semibold">{u.usuario}</td>
                    <td className="py-3 pr-3">{u.correo}</td>
                    <td className="py-3 pr-3">
                      {u.nombres} {u.apellidos}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                        {u.rol?.nombre_rol || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {u.estado ? (
                        <span className="text-emerald-300">Activo</span>
                      ) : (
                        <span className="text-red-300">Inactivo</span>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        className="rounded-xl border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        onClick={() => openEdit(u)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-xl bg-red-600 px-3 py-1.5 hover:bg-red-500"
                        onClick={() => askRemove(u)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* paginación */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            className="rounded-xl border border-white/10 px-3 py-2 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ←
          </button>
          <span className="text-sm text-white/70">
            Página <b className="text-white">{page}</b> / {totalPages}
          </span>
          <button
            className="rounded-xl border border-white/10 px-3 py-2 text-sm disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            →
          </button>
        </div>
      </div>

      {/* Modal simple */}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xl font-extrabold">
                {mode === "create" ? "Nuevo usuario" : "Editar usuario"}
              </div>
              <button
                onClick={close}
                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm text-white/70">Rol</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-3 outline-none"
                  value={id_rol}
                  onChange={(e) => setIdRol(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecciona rol...
                  </option>
                  {roles.map((r) => (
                    <option key={r.id_rol} value={r.id_rol}>
                      {r.nombre_rol}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Usuario</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Correo</label>
                <input
                  type="email"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Nombres</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Apellidos</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-white/70">
                  {mode === "create" ? "Contraseña" : "Contraseña (opcional)"}
                </label>
                <input
                  type="password"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required={mode === "create"}
                  minLength={mode === "create" ? 6 : undefined}
                />
              </div>

              <label className="md:col-span-2 flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={estado}
                  onChange={(e) => setEstado(e.target.checked)}
                  className="h-4 w-4"
                />
                Activo
              </label>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* ✅ ConfirmDialog para eliminar */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        description={`¿Eliminar al usuario "${toDelete?.usuario || ""}" (${toDelete?.correo || ""})?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={doRemove}
      />
    </div>
  );
}
