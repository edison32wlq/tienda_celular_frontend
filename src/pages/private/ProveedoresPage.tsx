import React, { useEffect, useMemo, useState, type JSX } from "react";
import {
  createProveedor,
  deleteProveedor,
  getProveedores,
  updateProveedor,
  type ProveedorDto,
} from "../../services/proveedores.service";

type FormState = {
  nombre: string;
  ruc: string;
  telefono: string;
  correo: string;
  direccion: string;
  contacto: string;
};

const emptyForm: FormState = {
  nombre: "",
  ruc: "",
  telefono: "",
  correo: "",
  direccion: "",
  contacto: "",
};

export default function ProveedoresPage(): JSX.Element {
  const [items, setItems] = useState<ProveedorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<ProveedorDto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      return (
        p.nombre.toLowerCase().includes(q) ||
        p.ruc.toLowerCase().includes(q) ||
        p.correo.toLowerCase().includes(q) ||
        p.telefono.toLowerCase().includes(q) ||
        p.contacto.toLowerCase().includes(q) ||
        p.direccion.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProveedores();
      setItems(res);
    } catch {
      setError("No se pudieron cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setMode("create");
    setCurrent(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: ProveedorDto) => {
    setMode("edit");
    setCurrent(p);
    setForm({
      nombre: p.nombre,
      ruc: p.ruc,
      telefono: p.telefono,
      correo: p.correo,
      direccion: p.direccion,
      contacto: p.contacto,
    });
    setOpen(true);
  };

  const close = () => setOpen(false);

  const onChange = (k: keyof FormState, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const payload = {
        nombre: form.nombre.trim(),
        ruc: form.ruc.trim(),
        telefono: form.telefono.trim(),
        correo: form.correo.trim(),
        direccion: form.direccion.trim(),
        contacto: form.contacto.trim(),
      };

      if (mode === "create") {
        await createProveedor(payload);
        setOpen(false);
        await load();
        return;
      }

      if (!current) return;

      await updateProveedor(current._id, payload);
      setOpen(false);
      await load();
    } catch {
      setError("No se pudo guardar el proveedor.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar proveedor?")) return;
    try {
      setError(null);
      await deleteProveedor(id);
      await load();
    } catch {
      setError("No se pudo eliminar el proveedor.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-2xl font-extrabold">Proveedores</div>
        <div className="text-white/50 text-sm">CRUD (Mongo)</div>

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
          placeholder="Buscar por nombre, ruc, correo, teléfono, contacto o dirección..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        {loading ? (
          <div className="text-white/70">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-white/70">No hay proveedores.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-3">Nombre</th>
                  <th className="text-left py-2 pr-3">RUC</th>
                  <th className="text-left py-2 pr-3">Teléfono</th>
                  <th className="text-left py-2 pr-3">Correo</th>
                  <th className="text-left py-2 pr-3">Dirección</th>
                  <th className="text-left py-2 pr-3">Contacto</th>
                  <th className="text-right py-2">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-b border-white/5">
                    <td className="py-3 pr-3 font-semibold">{p.nombre}</td>
                    <td className="py-3 pr-3">{p.ruc}</td>
                    <td className="py-3 pr-3">{p.telefono}</td>
                    <td className="py-3 pr-3">{p.correo}</td>
                    <td className="py-3 pr-3">{p.direccion}</td>
                    <td className="py-3 pr-3">{p.contacto}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        className="rounded-xl border border-white/10 px-3 py-1.5 hover:bg-white/10"
                        onClick={() => openEdit(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-xl bg-red-600 px-3 py-1.5 hover:bg-red-500"
                        onClick={() => remove(p._id)}
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
      </div>

      {/* Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="text-xl font-extrabold">
                {mode === "create" ? "Nuevo proveedor" : "Editar proveedor"}
              </div>
              <button
                onClick={close}
                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="mt-4 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70">Nombre</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                    value={form.nombre}
                    onChange={(e) => onChange("nombre", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">RUC</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                    value={form.ruc}
                    onChange={(e) => onChange("ruc", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70">Teléfono</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                    value={form.telefono}
                    onChange={(e) => onChange("telefono", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Correo</label>
                  <input
                    type="email"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                    value={form.correo}
                    onChange={(e) => onChange("correo", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70">Dirección</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                    value={form.direccion}
                    onChange={(e) => onChange("direccion", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Contacto</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                    value={form.contacto}
                    onChange={(e) => onChange("contacto", e.target.value)}
                    required
                  />
                </div>
              </div>

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
    </div>
  );
}
