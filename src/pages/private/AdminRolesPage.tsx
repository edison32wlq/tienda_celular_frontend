import React, { useEffect, useMemo, useState, type JSX } from "react";
import {
  createRol,
  deleteRol,
  getRoles,
  type RolDto,
  updateRol,
} from "../../services/roles.service";

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

export default function AdminRolesPage(): JSX.Element {
  const [items, setItems] = useState<RolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<RolDto | null>(null);

  // ✅ NUEVO: confirm eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<RolDto | null>(null);

  const [nombre_rol, setNombreRol] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [isActive, setIsActive] = useState(true);

  const queryKey = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      searchField: (debouncedSearch.trim() ? "nombre_rol" : undefined) as
        | "nombre_rol"
        | undefined,
      sort: "nombre_rol" as const,
      order: "ASC" as const,
    }),
    [page, limit, debouncedSearch]
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRoles(queryKey);
      setItems(res.items);
      setTotalPages(res.meta.totalPages || 1);
    } catch {
      setError("No se pudieron cargar roles.");
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
    setNombreRol("");
    setDescripcion("");
    setIsActive(true);
    setOpen(true);
  };

  const openEdit = (r: RolDto) => {
    setMode("edit");
    setCurrent(r);
    setNombreRol(r.nombre_rol);
    setDescripcion(r.descripcion);
    setIsActive(!!r.isActive);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      if (mode === "create") {
        await createRol({
          nombre_rol: nombre_rol.trim(),
          descripcion: descripcion.trim(),
          isActive,
        });
        setOpen(false);
        setPage(1);
        await load();
        return;
      }

      if (!current) return;

      await updateRol(current.id_rol, {
        nombre_rol: nombre_rol.trim(),
        descripcion: descripcion.trim(),
        isActive,
      });

      setOpen(false);
      await load();
    } catch {
      setError("No se pudo guardar el rol.");
    }
  };

  // ✅ NUEVO: abrir confirm dialog
  const askRemove = (r: RolDto) => {
    setToDelete(r);
    setConfirmOpen(true);
  };

  // ✅ NUEVO: ejecutar borrado al confirmar
  const doRemove = async () => {
    if (!toDelete) return;
    try {
      setError(null);
      await deleteRol(toDelete.id_rol);

      setConfirmOpen(false);
      setToDelete(null);

      await load();
    } catch {
      setConfirmOpen(false);
      setToDelete(null);
      setError("No se pudo eliminar el rol.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-2xl font-extrabold">Admin · Roles</div>

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
          placeholder="Buscar por nombre de rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        {loading ? (
          <div className="text-white/70">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="text-white/70">No hay roles.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-3">Nombre</th>
                  <th className="text-left py-2 pr-3">Descripción</th>
                  <th className="text-left py-2 pr-3">Activo</th>
                  <th className="text-right py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id_rol} className="border-b border-white/5">
                    <td className="py-3 pr-3 font-semibold">{r.nombre_rol}</td>
                    <td className="py-3 pr-3">{r.descripcion}</td>
                    <td className="py-3 pr-3">
                      {r.isActive ? (
                        <span className="text-emerald-300">Sí</span>
                      ) : (
                        <span className="text-red-300">No</span>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        className="rounded-xl border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        onClick={() => openEdit(r)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-xl bg-red-600 px-3 py-1.5 hover:bg-red-500"
                        onClick={() => askRemove(r)}
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

      {/* modal */}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xl font-extrabold">
                {mode === "create" ? "Nuevo rol" : "Editar rol"}
              </div>
              <button
                onClick={close}
                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="mt-4 grid gap-3">
              <div>
                <label className="text-sm text-white/70">Nombre</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={nombre_rol}
                  onChange={(e) => setNombreRol(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Descripción</label>
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                Activo
              </label>

              <div className="flex justify-end gap-2 pt-2">
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

      {/* ✅ ConfirmDialog eliminar */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        description={`¿Eliminar el rol "${toDelete?.nombre_rol || ""}"?`}
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
