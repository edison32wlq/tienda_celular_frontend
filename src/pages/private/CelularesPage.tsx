import { useEffect, useMemo, useState } from "react";
import {
  type Celular,
  createCelular,
  deleteCelular,
  getCelulares,
  uploadCelularImage,
  updateCelular,
} from "../../services/celulares.service";

// ✅ NUEVO: ConfirmDialog (Tailwind)
import ConfirmDialog from "../../components/common/ConfirmDialog";

type FormState = Omit<Celular, "id_celular">;
// @ts-ignore
const emptyForm: FormState = {
  codigo: "",
  marca: "",
  modelo: "",
  color: "",
  almacenamiento: "",
  ram: "",
  precio_venta: 0,
  costo_compra: 0,
  stock_actual: 0,
  estado: "DISPONIBLE",
  descripcion: "",
};

export default function CelularesPage() {
  const [items, setItems] = useState<Celular[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const resolveImageUrl = (value?: string) => {
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
      return value;
    }
    return `${apiBaseUrl}${value}`;
  };

  // ✅ NUEVO: estados para confirmación de eliminar
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Celular | null>(null);

  const query = useMemo(
    () => ({ page, limit, search: search.trim() || undefined }),
    [page, limit, search]
  );

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await getCelulares(query);
      setItems(res.items);
      setTotalPages(res.meta.totalPages || 1);
    } catch {
      setError("No se pudieron cargar los celulares.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const payload = {
        ...form,
        precio_venta: Number(form.precio_venta),
        costo_compra: Number(form.costo_compra),
        stock_actual: Number(form.stock_actual),
      };

      const saved = editingId
        ? await updateCelular(editingId, payload)
        : await createCelular(payload);
      const savedId = editingId ?? saved.id_celular;

      if (imageFile) {
        await uploadCelularImage(savedId, imageFile);
      }

      setForm(emptyForm);
      setEditingId(null);
      setImageFile(null);
      await load();
    } catch {
      setError("Error guardando celular. Revisa datos / token / backend.");
    }
  };

  const onEdit = (c: Celular) => {
    setEditingId(c.id_celular);
    setImageFile(null);
    const { id_celular, ...rest } = c;
    setForm({
      ...rest,
      precio_venta: Number(rest.precio_venta),
      costo_compra: Number(rest.costo_compra),
      stock_actual: Number(rest.stock_actual),
    });
  };

  // ✅ NUEVO: en vez de confirm(), abrimos modal
  const askDelete = (c: Celular) => {
    setToDelete(c);
    setConfirmOpen(true);
  };

  // ✅ NUEVO: acción real de eliminar (desde el modal)
  const doDelete = async () => {
    if (!toDelete) return;
    try {
      setError(null);
      await deleteCelular(toDelete.id_celular);

      setConfirmOpen(false);
      setToDelete(null);

      // si borras el último item de la página, opcionalmente retrocede 1 página
      // (lo dejo simple: recarga)
      await load();
    } catch {
      setConfirmOpen(false);
      setToDelete(null);
      setError("No se pudo eliminar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">CRUD Celulares</h1>
        <p className="mt-1 text-sm text-white/60">Crear, editar y eliminar.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-red-200">
            ❌ {error}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            className="h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                       placeholder:text-white/40 focus:ring-2 focus:ring-blue-600/40"
            placeholder="Buscar (marca, modelo, código...)"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />

          <select
            className="h-11 rounded-xl border border-white/10 bg-transparent px-3 outline-none"
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / pág
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              className="h-11 rounded-xl border border-white/10 px-4 hover:bg-white/5"
              onClick={() => load()}
              type="button"
            >
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{editingId ? "Editar celular" : "Nuevo celular"}</h2>
          {editingId ? (
            <button
              className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setImageFile(null);
              }}
            >
              Cancelar edición
            </button>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["codigo", "Código"],
            ["marca", "Marca"],
            ["modelo", "Modelo"],
            ["color", "Color"],
            ["almacenamiento", "Almacenamiento"],
            ["ram", "RAM"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-semibold text-white/70">{label}</label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                           focus:ring-2 focus:ring-blue-600/40"
                value={(form as any)[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                required
              />
            </div>
          ))}

          <div>
            <label className="text-sm font-semibold text-white/70">Precio venta</label>
            <input
              type="number"
              step="0.01"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                         focus:ring-2 focus:ring-blue-600/40"
              value={form.precio_venta}
              onChange={(e) => setForm((p) => ({ ...p, precio_venta: e.target.value as any }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70">Costo compra</label>
            <input
              type="number"
              step="0.01"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                         focus:ring-2 focus:ring-blue-600/40"
              value={form.costo_compra}
              onChange={(e) => setForm((p) => ({ ...p, costo_compra: e.target.value as any }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70">Stock actual</label>
            <input
              type="number"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                         focus:ring-2 focus:ring-blue-600/40"
              value={form.stock_actual}
              onChange={(e) => setForm((p) => ({ ...p, stock_actual: e.target.value as any }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/70">Estado</label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-3 outline-none"
              value={form.estado}
              onChange={(e) => setForm((p) => ({ ...p, estado: e.target.value }))}
            >
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="NO_DISPONIBLE">NO_DISPONIBLE</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-white/70">Descripción</label>
            <textarea
              className="mt-2 min-h-[90px] w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 outline-none
                         focus:ring-2 focus:ring-blue-600/40"
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-white/70">Imagen</label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white file:hover:bg-white/20"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="md:col-span-2">
            <button className="h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition">
              {editingId ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Listado</h2>

        {loading ? (
          <p className="mt-3 text-white/60">Cargando...</p>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-3 text-left">Código</th>
                  <th className="py-3 text-left">Marca</th>
                  <th className="py-3 text-left">Modelo</th>
                  <th className="py-3 text-left">Stock</th>
                  <th className="py-3 text-left">Precio</th>
                  <th className="py-3 text-left">Estado</th>
                  <th className="py-3 text-left">Imagen</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id_celular} className="border-b border-white/5">
                    <td className="py-3">{c.codigo}</td>
                    <td className="py-3">{c.marca}</td>
                    <td className="py-3">{c.modelo}</td>
                    <td className="py-3">{c.stock_actual}</td>
                    <td className="py-3">${Number(c.precio_venta).toFixed(2)}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        {c.estado}
                      </span>
                    </td>
                    <td className="py-3">
                      {c.imagen_url ? (
                        <img
                          src={resolveImageUrl(c.imagen_url)}
                          alt={`${c.marca} ${c.modelo}`}
                          className="h-10 w-10 rounded-md object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-white/40">Sin imagen</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5"
                          onClick={() => onEdit(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-red-200 hover:bg-red-400/20"
                          onClick={() => askDelete(c)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-white/60">
                      No hay celulares.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        {/* paginación simple */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-white/60">
            Página {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </button>
            <button
              className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* ✅ CONFIRM DIALOG (Tailwind) */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        description={`¿Eliminar el celular "${toDelete?.marca || ""} ${toDelete?.modelo || ""}" (código: ${
          toDelete?.codigo || ""
        })?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={doDelete}
      />
    </div>
  );
}