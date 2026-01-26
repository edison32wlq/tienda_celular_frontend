import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCelulares, type Celular } from "../../services/celulares.service";
import {
  anularOrdenCompra,
  confirmarOrdenCompra,
  createOrdenCompra,
  getOrdenCompras,
  type OrdenCompra,
} from "../../services/orden-compras.service";
import { getProveedores, type ProveedorDto } from "../../services/proveedores.service";

// ✅ NUEVO: Modal Tailwind
import ConfirmDialog from "../../components/common/ConfirmDialog";

type DetForm = {
  id_celular: string;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
};

export default function OrdenComprasPage() {
  const { user } = useAuth();

  // ✅ PENDIENTES (EMITIDA)
  const [pendientes, setPendientes] = useState<OrdenCompra[]>([]);
  const [loadingPend, setLoadingPend] = useState(true);

  // ✅ REGISTRADAS (RECIBIDA/ANULADA)
  const [items, setItems] = useState<OrdenCompra[]>([]);
  const [loadingReg, setLoadingReg] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // datos para crear
  const [celulares, setCelulares] = useState<Celular[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDto[]>([]);

  const [id_proveedor, setIdProveedor] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));

  const [detalles, setDetalles] = useState<DetForm[]>([
    { id_celular: "", cantidad: 1, costo_unitario: 0, subtotal: 0 },
  ]);

  // ✅ NUEVO: estados del modal confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"confirmar" | "anular">("confirmar");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const totalPreview = useMemo(() => {
    return Number(detalles.reduce((acc, d) => acc + Number(d.subtotal || 0), 0).toFixed(2));
  }, [detalles]);

  async function loadPendientes() {
    try {
      setLoadingPend(true);
      const res = await getOrdenCompras({ page: 1, limit: 50, estado: "EMITIDA" });
      setPendientes(res.items);
    } catch {
      setError("No se pudieron cargar las órdenes pendientes.");
    } finally {
      setLoadingPend(false);
    }
  }

  async function loadRegistradas() {
    try {
      setLoadingReg(true);
      setError(null);

      const [rec, anu] = await Promise.all([
        getOrdenCompras({ page, limit, estado: "RECIBIDA" }),
        getOrdenCompras({ page, limit, estado: "ANULADA" }),
      ]);

      const merged = [...rec.items, ...anu.items].sort((a, b) =>
        String(b.fecha_emision).localeCompare(String(a.fecha_emision))
      );

      setItems(merged);
      setTotalPages(Math.max(rec.meta.totalPages || 1, anu.meta.totalPages || 1));
    } catch {
      setError("No se pudieron cargar las órdenes registradas.");
    } finally {
      setLoadingReg(false);
    }
  }

  async function loadCelulares() {
    try {
      const res = await getCelulares({ page: 1, limit: 200 });
      setCelulares(res.items);
    } catch {}
  }

  async function loadProveedores() {
    try {
      const res = await getProveedores();
      setProveedores(res);
    } catch {}
  }

  useEffect(() => {
    loadPendientes();
    loadCelulares();
    loadProveedores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRegistradas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const calcSubtotal = (cantidad: number, costo_unitario: number) =>
    Number((Number(cantidad) * Number(costo_unitario)).toFixed(2));

  const addDetalle = () => {
    setDetalles((p) => [...p, { id_celular: "", cantidad: 1, costo_unitario: 0, subtotal: 0 }]);
  };

  const removeDetalle = (idx: number) => {
    setDetalles((p) => p.filter((_, i) => i !== idx));
  };

  // ✅ recalcula subtotal automáticamente cuando cambias cantidad o costo_unitario
  const setDet = (idx: number, patch: Partial<DetForm>) => {
    setDetalles((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;

        const cantidad = Number(patch.cantidad ?? d.cantidad);
        const costo = Number(patch.costo_unitario ?? d.costo_unitario);
        const subtotal = calcSubtotal(cantidad, costo);

        return { ...d, ...patch, cantidad, costo_unitario: costo, subtotal };
      })
    );
  };

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = (user as any)?.id_usuario || (user as any)?.id;
    if (!userId) {
      setError("No se detectó id_usuario del usuario logueado.");
      return;
    }
    if (!id_proveedor.trim()) {
      setError("Selecciona un proveedor.");
      return;
    }
    if (detalles.length === 0) {
      setError("Agrega al menos 1 detalle.");
      return;
    }
    if (
      detalles.some(
        (d) => !d.id_celular || Number(d.cantidad) <= 0 || Number(d.costo_unitario) <= 0
      )
    ) {
      setError("Revisa detalles: celular, cantidad > 0, costo_unitario > 0.");
      return;
    }

    try {
      setError(null);

      await createOrdenCompra({
        id_proveedor,
        id_usuario: userId,
        fecha_emision: fecha,
        estado: "EMITIDA",
        detalles: detalles.map((d) => ({
          id_celular: d.id_celular,
          cantidad: Number(d.cantidad),
          costo_unitario: Number(d.costo_unitario),
          subtotal: Number(d.subtotal), // ✅ mandamos subtotal
        })),
      });

      // reset
      setIdProveedor("");
      setFecha(new Date().toISOString().slice(0, 10));
      setDetalles([{ id_celular: "", cantidad: 1, costo_unitario: 0, subtotal: 0 }]);

      await loadPendientes();
    } catch {
      setError("No se pudo crear la orden. Revisa token/rol/CORS/backend.");
    }
  };

  // ✅ NUEVO: abrir modal para confirmar / anular
  const askConfirmar = (id: string) => {
    setConfirmMode("confirmar");
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const askCancelar = (id: string) => {
    setConfirmMode("anular");
    setConfirmId(id);
    setConfirmOpen(true);
  };

  // ✅ NUEVO: acción final desde el modal
  const doConfirmAction = async () => {
    if (!confirmId) return;

    try {
      setError(null);

      if (confirmMode === "confirmar") {
        await confirmarOrdenCompra(confirmId);
        await Promise.all([loadPendientes(), loadRegistradas(), loadCelulares()]);
      } else {
        await anularOrdenCompra(confirmId);
        await Promise.all([loadPendientes(), loadRegistradas()]);
      }

      setConfirmOpen(false);
      setConfirmId(null);
    } catch {
      setConfirmOpen(false);
      setConfirmId(null);
      setError(
        confirmMode === "confirmar"
          ? "No se pudo confirmar la orden."
          : "No se pudo cancelar la orden."
      );
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
          ❌ {error}
        </div>
      )}

      {/* CREAR */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">Crear orden de compra</h1>

        <form onSubmit={onCreate} className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-white/70">Proveedor</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none"
                value={id_proveedor}
                onChange={(e) => setIdProveedor(e.target.value)}
                required
              >
                <option value="">-- Selecciona proveedor --</option>
                {proveedores.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nombre} • {p.ruc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-white/70">Fecha emisión</label>
              <input
                type="date"
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/70">Estado</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none"
                value={"EMITIDA"}
                disabled
              >
                <option value="EMITIDA">EMITIDA (pendiente)</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm text-white/60">Total (preview)</p>
                <p className="text-xl font-extrabold">${totalPreview.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Detalles</h2>
              <button
                type="button"
                onClick={addDetalle}
                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5"
              >
                + Agregar detalle
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {detalles.map((d, idx) => (
                <div key={idx} className="grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <label className="text-sm font-semibold text-white/70">Celular</label>
                    <select
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 outline-none"
                      value={d.id_celular}
                      onChange={(e) => setDet(idx, { id_celular: e.target.value })}
                      required
                    >
                      <option value="">-- Selecciona --</option>
                      {celulares.map((c) => (
                        <option key={c.id_celular} value={c.id_celular}>
                          {c.codigo} | {c.marca} {c.modelo} ({c.almacenamiento})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-white/70">Cantidad</label>
                    <input
                      type="number"
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                      value={d.cantidad}
                      min={1}
                      onChange={(e) => setDet(idx, { cantidad: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-white/70">Costo unitario</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none"
                      value={d.costo_unitario}
                      min={0}
                      onChange={(e) => setDet(idx, { costo_unitario: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-white/70">Subtotal</label>
                    <div className="mt-2 flex h-11 w-full items-center rounded-xl border border-white/10 bg-white/5 px-4">
                      <span className="font-semibold">${Number(d.subtotal || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <button
                      type="button"
                      className="h-11 w-full rounded-xl border border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/20"
                      onClick={() => removeDetalle(idx)}
                      disabled={detalles.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="h-11 w-full rounded-xl bg-blue-600 font-semibold transition hover:bg-blue-500">
            Crear orden (pendiente)
          </button>
        </form>
      </div>

      {/* ✅ PENDIENTES */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Órdenes pendientes (EMITIDA)</h2>

        {loadingPend ? (
          <p className="mt-3 text-white/60">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p className="mt-3 text-white/60">No hay órdenes pendientes.</p>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-3 text-left">Fecha</th>
                  <th className="py-3 text-left">Total</th>
                  <th className="py-3 text-left">Detalles</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map((o) => (
                  <tr key={o.id_orden_compra} className="border-b border-white/5">
                    <td className="py-3">{String(o.fecha_emision).slice(0, 10)}</td>
                    <td className="py-3">${Number(o.total ?? 0).toFixed(2)}</td>
                    <td className="py-3">{o.detalles?.length ?? 0}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
                        onClick={() => askConfirmar(o.id_orden_compra)}
                      >
                        Confirmar
                      </button>
                      <button
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500"
                        onClick={() => askCancelar(o.id_orden_compra)}
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REGISTRADAS */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Órdenes registradas (RECIBIDA / ANULADA)</h2>

        {loadingReg ? (
          <p className="mt-3 text-white/60">Cargando...</p>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-3 text-left">Fecha</th>
                  <th className="py-3 text-left">Estado</th>
                  <th className="py-3 text-left">Total</th>
                  <th className="py-3 text-left">Usuario</th>
                  <th className="py-3 text-left">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o.id_orden_compra} className="border-b border-white/5">
                    <td className="py-3">{String(o.fecha_emision).slice(0, 10)}</td>
                    <td className="py-3">{o.estado}</td>
                    <td className="py-3">${Number(o.total ?? 0).toFixed(2)}</td>
                    <td className="py-3">{(o as any).usuario?.correo || o.id_usuario}</td>
                    <td className="py-3">{o.detalles?.length ?? 0}</td>
                  </tr>
                ))}

                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-white/60">
                      No hay órdenes.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

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

      {/* ✅ NUEVO: Modal Tailwind (reemplaza confirm()) */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmMode === "confirmar" ? "Confirmar orden" : "Cancelar orden"}
        description={
          confirmMode === "confirmar"
            ? "¿Confirmar esta orden? Esto sumará el stock."
            : "¿Cancelar esta orden? No sumará stock."
        }
        confirmText={confirmMode === "confirmar" ? "Sí, confirmar" : "Sí, cancelar"}
        cancelText="Volver"
        danger={confirmMode === "anular"}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmId(null);
        }}
        onConfirm={doConfirmAction}
      />
    </div>
  );
}
