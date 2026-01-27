import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

import {
  getPerfilClienteByUsuarioId,
  type PerfilCliente,
} from "../../services/perfil-clientes.service";

import { getCarritos, updateCarrito, type Carrito } from "../../services/carrito.service";
import {
  getProductosCarrito,
  deleteProductoCarrito,
  type ProductoCarrito,
} from "../../services/productosCarrito.service";

import {
  updateCelular,
  getCelulares,
  type Celular,
} from "../../services/celulares.service";

import { createFactura, getFacturas, type Factura } from "../../services/factura.service";
import {
  createDetalleFactura,
  getDetallesFactura,
  type DetalleFactura,
} from "../../services/detalleFactura.service";

const ESTADO_ABIERTO = "ABIERTO";
const ESTADO_COMPRADO = "COMPRADO";

// ✅ IVA fijo 15%
const IVA_RATE = 0.15;

function genNumeroFactura() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `FAC-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export default function ComprasPage() {
  const { user } = useAuth();

  const idUsuario = (user as any)?.id_usuario || (user as any)?.sub || (user as any)?.id || "";

  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [perfilChecked, setPerfilChecked] = useState(false);

  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [itemsCarrito, setItemsCarrito] = useState<ProductoCarrito[]>([]);

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Factura form
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");

  // Confirm
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Historial
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [detalles, setDetalles] = useState<DetalleFactura[]>([]);
  const [histPage, setHistPage] = useState(1);
  const [histLimit, setHistLimit] = useState(10);
  const [histTotalPages, setHistTotalPages] = useState(1);

  // ✅ Para mostrar nombres aunque el detalle no traiga "celular"
  const [celulares, setCelulares] = useState<Celular[]>([]);

  const perfilIncompleto = perfilChecked && !perfil;

  const celularMap = useMemo(() => {
    const m = new Map<string, Celular>();
    for (const c of celulares) m.set(String((c as any).id_celular), c);
    return m;
  }, [celulares]);

  const nombreCelular = (id_celular: any, celularObj?: any) => {
    // 1) si viene eager en el detalle
    if (celularObj?.marca && celularObj?.modelo) return `${celularObj.marca} ${celularObj.modelo}`;

    // 2) si viene eager en producto_carrito
    if ((id_celular as any)?.marca && (id_celular as any)?.modelo)
      return `${(id_celular as any).marca} ${(id_celular as any).modelo}`;

    // 3) buscar en mapa por id
    const found = celularMap.get(String(id_celular));
    if (found) return `${(found as any).marca} ${(found as any).modelo}`;

    // 4) fallback: mostrar ID
    return String(id_celular);
  };

  const subtotal = useMemo(() => {
    return itemsCarrito.reduce((acc, it) => {
      const unit = Number(it.precio_unitario);
      const qty = Number(it.cantidad);
      return acc + unit * qty;
    }, 0);
  }, [itemsCarrito]);

  const iva = useMemo(() => subtotal * IVA_RATE, [subtotal]);
  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  async function loadPerfil(): Promise<PerfilCliente | null> {
    if (!idUsuario) throw new Error("No se encontró id_usuario en el usuario logueado.");

    const p = await getPerfilClienteByUsuarioId(String(idUsuario));
    setPerfil(p);
    setPerfilChecked(true);
    return p || null;
  }

  async function loadCarritoAbierto(id_cliente: string) {
    const res = await getCarritos({
      page: 1,
      limit: 50,
      search: id_cliente,
      searchField: "id_cliente",
      sort: "fecha_creacion",
      order: "DESC",
    });

    const abierto =
      res.items.find((c) => String(c.estado || "").toUpperCase() === ESTADO_ABIERTO) || null;

    setCarrito(abierto);
    return abierto;
  }

  async function loadItemsCarrito(id_carrito: string) {
    const res = await getProductosCarrito({
      page: 1,
      limit: 100,
      search: id_carrito,
      searchField: "id_carrito",
      sort: "cantidad",
      order: "DESC",
    });

    setItemsCarrito(res.items);
    return res.items;
  }

  async function loadCelularesAll() {
    try {
      const res = await getCelulares({ page: 1, limit: 500 });
      setCelulares(res.items);
    } catch {
      // no crítico
      setCelulares([]);
    }
  }

  async function loadHistorial(id_cliente: string) {
    const res = await getFacturas({ page: 1, limit: 500 });

    // ✅ filtramos por cliente
    const mine = res.items.filter((f) => f.id_cliente === id_cliente);

    // ✅ paginado ya sobre "mine"
    const totalItems = mine.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / histLimit));
    setHistTotalPages(totalPages);

    const safePage = Math.min(Math.max(1, histPage), totalPages);
    if (safePage !== histPage) setHistPage(safePage);

    const start = (safePage - 1) * histLimit;
    const end = start + histLimit;
    setFacturas(mine.slice(start, end));

    // ✅ detalles (para productos comprados)
    const det = await getDetallesFactura({ page: 1, limit: 1000 });
    setDetalles(det.items);
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);

      // ✅ para mostrar nombres en historial aunque detalle no venga con "celular"
      await loadCelularesAll();

      const p = await loadPerfil();
      if (!p) {
        setCarrito(null);
        setItemsCarrito([]);
        setFacturas([]);
        setDetalles([]);
        return;
      }

      const c = await loadCarritoAbierto(p.id_cliente);
      if (c?.id_carrito) await loadItemsCarrito(c.id_carrito);
      else setItemsCarrito([]);

      await loadHistorial(p.id_cliente);
    } catch (e: any) {
      setError(e?.message || "Error cargando compras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recargar historial cuando cambie paginado
  useEffect(() => {
    (async () => {
      if (!perfil?.id_cliente) return;
      try {
        await loadHistorial(perfil.id_cliente);
      } catch {
        // silencioso
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histPage, histLimit, perfil?.id_cliente]);

  const detallesDeFactura = (id_factura: string) =>
    detalles.filter((d) => d.id_factura === id_factura);

  async function confirmarCompraReal() {
    if (!perfil?.id_cliente) {
      setError("Completa tu Perfil Cliente antes de comprar.");
      return;
    }
    if (!carrito?.id_carrito) {
      setError("No hay carrito abierto.");
      return;
    }
    if (itemsCarrito.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    try {
      setWorking(true);
      setError(null);

      const numero_factura = genNumeroFactura();
      const fecha_emision = new Date().toISOString();

      // 1) crear factura
      const factura = await createFactura({
        numero_factura,
        fecha_emision,
        id_cliente: perfil.id_cliente,
        id_usuario: String(idUsuario),
        metodo_pago: metodoPago,
        subtotal: Number(subtotal.toFixed(2)),
        iva: Number(iva.toFixed(2)),
        total: Number(total.toFixed(2)),
      });

      // 2) crear detalles + 3) restar stock
      for (const it of itemsCarrito) {
        const unit = Number(it.precio_unitario);
        const qty = Number(it.cantidad);
        const sub = Number((unit * qty).toFixed(2));

        await createDetalleFactura({
          id_factura: factura.id_factura,
          id_celular: (it as any).id_celular,
          cantidad: qty,
          precio_unitario: Number(unit.toFixed(2)),
          subtotal: sub,
        });

        // restar stock (si viene celular eager en producto_carrito)
        const cel = (it as any).celular as Celular | undefined;
        const celId = String((cel as any)?.id_celular || (it as any).id_celular);

        // si no vino eager, intentamos buscar en el map por id
        const celData = cel?.id_celular ? cel : celularMap.get(celId);

        if (celData) {
          const stockActual = Number((celData as any).stock_actual ?? 0);
          const nuevoStock = Math.max(0, stockActual - qty);

          await updateCelular(String((celData as any).id_celular), {
            stock_actual: nuevoStock,
          });
        }
      }

      // 4) limpiar carrito
      for (const it of itemsCarrito) {
        await deleteProductoCarrito(it.id_producto_carrito);
      }

      // 5) cambiar estado del carrito
      await updateCarrito(carrito.id_carrito, { estado: ESTADO_COMPRADO });

      setConfirmOpen(false);

      await loadAll();

      alert("✅ Factura generada correctamente.");
    } catch (e: any) {
      setConfirmOpen(false);
      setError(e?.response?.data?.message || e?.message || "No se pudo generar la factura.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">Compras</h1>
        <p className="mt-1 text-sm text-white/60">
          Genera tu factura desde el carrito y revisa tu historial de compras.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-red-200">
            ❌ {error}
          </div>
        )}

        {perfilIncompleto && (
          <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-100">
            <div className="font-bold">⚠️ Completa tu Perfil Cliente</div>
            <div className="mt-1 text-sm text-yellow-100/80">
              Para comprar necesitas tener tu perfil completo (cédula, teléfono, dirección).
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70 space-y-1">
            <div>
              <span className="text-white/50">id_usuario:</span>{" "}
              <span className="font-semibold">{String(idUsuario || "—")}</span>
            </div>
            <div>
              <span className="text-white/50">id_cliente:</span>{" "}
              <span className="font-semibold">{perfil?.id_cliente || "—"}</span>
            </div>
            <div>
              <span className="text-white/50">Carrito abierto:</span>{" "}
              <span className="font-semibold">{carrito?.id_carrito || "—"}</span>
            </div>
          </div>

          <button
            className="h-11 rounded-xl border border-white/10 px-4 hover:bg-white/5"
            type="button"
            onClick={() => loadAll()}
          >
            Refrescar
          </button>
        </div>
      </div>

      {/* Generar factura */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Generar factura</h2>
          <span className="text-sm text-white/60">
            Productos en carrito: <b>{itemsCarrito.length}</b>
          </span>
        </div>

        {loading ? (
          <p className="mt-4 text-white/60">Cargando...</p>
        ) : (
          <>
            {/* Tabla preview */}
            <div className="mt-4 overflow-auto">
              <table className="min-w-[950px] w-full text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-left">Producto</th>
                    <th className="py-3 text-left">Precio</th>
                    <th className="py-3 text-left">Cantidad</th>
                    <th className="py-3 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsCarrito.map((it) => {
                    const nombre = nombreCelular((it as any).id_celular, (it as any).celular);
                    const unit = Number(it.precio_unitario);
                    const qty = Number(it.cantidad);
                    const sub = unit * qty;

                    return (
                      <tr key={it.id_producto_carrito} className="border-b border-white/5">
                        <td className="py-3">{nombre}</td>
                        <td className="py-3">${unit.toFixed(2)}</td>
                        <td className="py-3">{qty}</td>
                        <td className="py-3">${sub.toFixed(2)}</td>
                      </tr>
                    );
                  })}

                  {itemsCarrito.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-white/60">
                        Tu carrito está vacío.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Form de factura */}
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-white/70">Método de pago</label>
                <select
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-3 outline-none"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  disabled={perfilIncompleto || itemsCarrito.length === 0 || working}
                >
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TARJETA">TARJETA</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                </select>
              </div>

              {/* ✅ IVA fijo, sin select */}
              <div>
                <label className="text-sm font-semibold text-white/70">IVA</label>
                <div className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 flex items-center">
                  <span className="font-semibold">15%</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-white/60">Resumen</div>
                <div className="mt-2 text-sm">
                  Subtotal: <b>${subtotal.toFixed(2)}</b>
                </div>
                <div className="text-sm">
                  IVA (15%): <b>${iva.toFixed(2)}</b>
                </div>
                <div className="text-sm">
                  Total: <b>${total.toFixed(2)}</b>
                </div>
              </div>

              <div className="md:col-span-3">
                <button
                  className="h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition disabled:opacity-40"
                  disabled={perfilIncompleto || itemsCarrito.length === 0 || working}
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                >
                  {working ? "Procesando..." : "Confirmar y generar factura"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Historial */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Historial de compras</h2>

          <select
            className="h-11 rounded-xl border border-white/10 bg-transparent px-3 outline-none"
            value={histLimit}
            onChange={(e) => {
              setHistPage(1);
              setHistLimit(Number(e.target.value));
            }}
            disabled={perfilIncompleto}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / pág
              </option>
            ))}
          </select>
        </div>

        {perfilIncompleto ? (
          <p className="mt-4 text-white/60">Completa tu perfil para ver tu historial.</p>
        ) : (
          <>
            <div className="mt-4 overflow-auto">
              <table className="min-w-[1050px] w-full text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="py-3 text-left">N°</th>
                    <th className="py-3 text-left">Fecha</th>
                    <th className="py-3 text-left">Método</th>
                    <th className="py-3 text-left">Total</th>
                    <th className="py-3 text-left">Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.map((f) => {
                    const dets = detallesDeFactura(f.id_factura);

                    return (
                      <tr key={f.id_factura} className="border-b border-white/5 align-top">
                        <td className="py-3">{f.numero_factura}</td>
                        <td className="py-3">{String(f.fecha_emision).slice(0, 10)}</td>
                        <td className="py-3">{f.metodo_pago}</td>
                        <td className="py-3">${Number(f.total).toFixed(2)}</td>
                        <td className="py-3">
                          {dets.length === 0 ? (
                            <span className="text-white/50">Sin detalles</span>
                          ) : (
                            <ul className="space-y-1">
                              {dets.map((d) => {
                                const name = nombreCelular((d as any).id_celular, (d as any).celular);
                                return (
                                  <li key={(d as any).id_detalle_factura} className="text-white/80">
                                    {name} — x{Number((d as any).cantidad)} — $
                                    {Number((d as any).subtotal).toFixed(2)}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {facturas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-white/60">
                        No hay compras registradas.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/60">
                Página {histPage} / {histTotalPages}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                  disabled={histPage <= 1}
                  onClick={() => setHistPage((p) => p - 1)}
                  type="button"
                >
                  ←
                </button>
                <button
                  className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                  disabled={histPage >= histTotalPages}
                  onClick={() => setHistPage((p) => p + 1)}
                  type="button"
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar compra"
        description={`Se generará la factura por $${total.toFixed(2)} y se descontará stock. ¿Continuar?`}
        confirmText="Sí, generar"
        cancelText="Cancelar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmarCompraReal}
        danger={false}
      />
    </div>
  );
}
