import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";

import { type Carrito, createCarrito, getCarritos } from "../../services/carrito.service";

import {
  type ProductoCarrito,
  createProductoCarrito,
  deleteProductoCarrito,
  getProductosCarrito,
  updateProductoCarrito,
} from "../../services/productosCarrito.service";

import { type Celular, getCelulares } from "../../services/celulares.service";

// ✅ Tu service real (de perfilClientes)
import {
  getPerfilClienteByUsuarioId,
  type PerfilCliente,
} from "../../services/perfil-clientes.service";

type AddForm = {
  id_celular: string;
  cantidad: number;
};

const emptyAdd: AddForm = { id_celular: "", cantidad: 1 };

// ✅ Ajusta si tu estado se llama distinto en tu backend
const ESTADO_ABIERTO = "ABIERTO";

export default function CarritoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [perfilChecked, setPerfilChecked] = useState(false); // ✅ para no parpadear

  const [idCliente, setIdCliente] = useState<string>("");
  const [carrito, setCarrito] = useState<Carrito | null>(null);

  const [celulares, setCelulares] = useState<Celular[]>([]);
  const [items, setItems] = useState<ProductoCarrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // confirm delete producto
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ProductoCarrito | null>(null);

  // confirm compra
  const [confirmCompraOpen, setConfirmCompraOpen] = useState(false);

  // form add
  const [addForm, setAddForm] = useState<AddForm>(emptyAdd);

  // paginado productos carrito
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const productosQuery = useMemo(
    () => ({
      page,
      limit,
      id_carrito: carrito?.id_carrito || "",
    }),
    [page, limit, carrito?.id_carrito]
  );

  // ✅ saca id_usuario del user (ajusta si tu user usa otro campo)
  const idUsuario = (user as any)?.id_usuario || (user as any)?.sub || (user as any)?.id || "";

  async function loadCelulares() {
    try {
      const res = await getCelulares({ page: 1, limit: 200 });
      setCelulares(res.items);
    } catch {
      // no es crítico para arrancar
    }
  }

  /**
   * ✅ Valida que exista PerfilCliente antes de hacer carrito
   * - Si no hay perfil => NO creamos carrito, NO cargamos productos
   */
  async function loadPerfilCliente(): Promise<PerfilCliente | null> {
    if (!idUsuario) throw new Error("No se encontró id_usuario en el usuario logueado.");

    const p = await getPerfilClienteByUsuarioId(String(idUsuario));
    setPerfil(p);
    setPerfilChecked(true);

    if (!p) {
      setIdCliente("");
      setCarrito(null);
      setItems([]);
      setTotalPages(1);
      return null;
    }

    setIdCliente(p.id_cliente);
    return p;
  }

  async function loadOrCreateCarritoActual(id_cliente: string): Promise<Carrito> {
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

    if (abierto) {
      setCarrito(abierto);
      return abierto;
    }

    const creado = await createCarrito({ id_cliente, estado: ESTADO_ABIERTO });
    setCarrito(creado);
    return creado;
  }

  async function loadProductosDelCarrito(id_carrito: string) {
    const res = await getProductosCarrito({
      page,
      limit,
      search: id_carrito,
      searchField: "id_carrito",
      sort: "cantidad",
      order: "DESC",
    });

    setItems(res.items);
    setTotalPages(res.meta.totalPages || 1);

    if (res.meta.currentPage !== page) setPage(res.meta.currentPage);
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);

      await loadCelulares();

      // ✅ 1) validar perfil
      const p = await loadPerfilCliente();
      if (!p) return;

      // ✅ 2) carrito (auto)
      const c = await loadOrCreateCarritoActual(p.id_cliente);

      // ✅ 3) productos
      await loadProductosDelCarrito(c.id_carrito);
    } catch (e: any) {
      setError(e?.message || "No se pudo cargar carrito / productos.");
      setCarrito(null);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recargar productos al cambiar página/limit (solo si hay carrito y perfil)
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        if (perfil?.id_cliente && carrito?.id_carrito) {
          await loadProductosDelCarrito(carrito.id_carrito);
        }
      } catch {
        setError("No se pudieron cargar los productos del carrito.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosQuery]);

  // ✅ helper: nombre bonito del celular (si backend no manda it.celular)
  const getNombreCelular = (it: ProductoCarrito) => {
    // 1) si backend ya manda el celular completo
    const celFromItem = (it as any)?.celular;
    if (celFromItem?.marca || celFromItem?.modelo) {
      const codigo = celFromItem?.codigo ? `${celFromItem.codigo} • ` : "";
      return `${codigo}${celFromItem.marca ?? ""} ${celFromItem.modelo ?? ""}`.trim();
    }

    // 2) si NO manda, buscamos en el catálogo que cargamos
    const cel = celulares.find((c) => c.id_celular === it.id_celular);
    if (cel) {
      const codigo = (cel as any)?.codigo ? `${(cel as any).codigo} • ` : "";
      return `${codigo}${cel.marca} ${cel.modelo}`.trim();
    }

    // 3) fallback
    return "Celular (no encontrado)";
  };

  const onAgregarProducto = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);

      if (!perfil?.id_cliente) {
        setError("Debes completar tu Perfil Cliente antes de usar el carrito.");
        return;
      }

      if (!carrito?.id_carrito) {
        setError("No hay carrito (reintenta refrescar).");
        return;
      }

      if (!addForm.id_celular) {
        setError("Selecciona un celular.");
        return;
      }

      const cel = celulares.find((x) => x.id_celular === addForm.id_celular);
      if (!cel) return setError("Celular no encontrado.");

      const precioUnit = Number(cel.precio_venta ?? 0);
      const cantidad = Number(addForm.cantidad);

      if (!Number.isFinite(precioUnit) || precioUnit <= 0) return setError("Precio inválido.");
      if (!Number.isFinite(cantidad) || cantidad <= 0) return setError("Cantidad inválida.");

      const existente = items.find((it) => it.id_celular === addForm.id_celular);

      if (existente) {
        await updateProductoCarrito(existente.id_producto_carrito, {
          cantidad: Number(existente.cantidad) + cantidad,
          precio_unitario: precioUnit,
        });
      } else {
        await createProductoCarrito({
          id_carrito: carrito.id_carrito,
          id_celular: addForm.id_celular,
          cantidad,
          precio_unitario: precioUnit,
        });
      }

      setAddForm(emptyAdd);
      setPage(1);
      await loadProductosDelCarrito(carrito.id_carrito);
    } catch {
      setError("No se pudo agregar el producto. Revisa token / backend.");
    }
  };

  const onCambiarCantidad = async (row: ProductoCarrito, nuevaCantidad: number) => {
    try {
      setError(null);

      if (!perfil?.id_cliente) {
        setError("Debes completar tu Perfil Cliente antes de usar el carrito.");
        return;
      }

      if (nuevaCantidad <= 0) {
        setToDelete(row);
        setConfirmDeleteOpen(true);
        return;
      }

      await updateProductoCarrito(row.id_producto_carrito, {
        cantidad: nuevaCantidad,
        precio_unitario: Number(row.precio_unitario),
      });

      if (carrito?.id_carrito) await loadProductosDelCarrito(carrito.id_carrito);
    } catch {
      setError("No se pudo actualizar la cantidad.");
    }
  };

  const askDelete = (row: ProductoCarrito) => {
    setToDelete(row);
    setConfirmDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!toDelete) return;

    try {
      setError(null);

      if (!perfil?.id_cliente) {
        setError("Debes completar tu Perfil Cliente antes de usar el carrito.");
        setConfirmDeleteOpen(false);
        setToDelete(null);
        return;
      }

      await deleteProductoCarrito(toDelete.id_producto_carrito);
      setConfirmDeleteOpen(false);
      setToDelete(null);

      if (carrito?.id_carrito) await loadProductosDelCarrito(carrito.id_carrito);
    } catch {
      setConfirmDeleteOpen(false);
      setToDelete(null);
      setError("No se pudo eliminar el producto del carrito.");
    }
  };

  const total = useMemo(() => {
    return items.reduce((acc, it) => {
      const unit = Number(it.precio_unitario);
      const qty = Number(it.cantidad);
      return acc + unit * qty;
    }, 0);
  }, [items]);

  const onComprarConfirmado = async () => {
    setConfirmCompraOpen(false);
    navigate("/dashboard/compras");
  };

  const perfilIncompleto = perfilChecked && !perfil;

  // ✅ checkout: subtotal/iva/total (solo visual, no cambia lógica)
  const subtotal = total;
  const iva = subtotal * 0.12;
  const totalFinal = subtotal + iva;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft">
        <div className="px-8 pt-7 pb-5 border-b border-white/10">
          <h1 className="text-3xl font-semibold tracking-tight">Carrito</h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Agrega productos, ajusta cantidades y confirma la compra.
          </p>
        </div>

        <div className="px-8 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-red-200">
              ❌ {error}
            </div>
          )}

          {perfilIncompleto && (
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-6 py-5 text-yellow-100">
              <div className="font-semibold tracking-tight">⚠️ Completa tu Perfil Cliente</div>
              <div className="mt-1 text-sm text-yellow-100/80">
                Para usar el carrito necesitas llenar tu perfil (cédula, teléfono, dirección).
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-xl bg-yellow-400/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-400 transition"
                  type="button"
                  onClick={() => navigate("/dashboard/mi-perfil")}
                >
                  Completar mi perfil
                </button>

                <button
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
                  type="button"
                  onClick={() => loadAll()}
                >
                  Ya lo completé, refrescar
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/65">
              <div>
                <span className="text-white/45">id_usuario:</span>{" "}
                <span className="font-semibold text-white/80">{String(idUsuario || "—")}</span>
              </div>
              <div>
                <span className="text-white/45">id_cliente:</span>{" "}
                <span className="font-semibold text-white/80">{idCliente || "—"}</span>
              </div>
              <div>
                <span className="text-white/45">Carrito:</span>{" "}
                <span className="font-semibold text-white/80">{carrito?.id_carrito || "—"}</span>
              </div>
              <div>
                <span className="text-white/45">Estado:</span>{" "}
                <span className="font-semibold text-white/80">{carrito?.estado || "—"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="h-11 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
                type="button"
                onClick={() => loadAll()}
              >
                Refrescar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Checkout layout: izquierda (tabla) + derecha (resumen + add) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          {/* Add product */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft">
            <div className="px-8 pt-7 pb-5 border-b border-white/10 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Añadir producto</h2>
              {perfilIncompleto ? (
                <span className="text-sm text-yellow-200/80">⚠️ Completa tu perfil primero</span>
              ) : null}
            </div>

            <div className="px-8 py-7">
              <form onSubmit={onAgregarProducto} className="grid gap-5 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold tracking-wide text-white/60">
                    Celular
                  </label>
                  <select
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                               focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                    value={addForm.id_celular}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, id_celular: e.target.value }))
                    }
                    required
                    disabled={perfilIncompleto}
                  >
                    <option value="">Selecciona un celular</option>
                    {celulares.map((c) => (
                      <option key={c.id_celular} value={c.id_celular}>
                        {c.marca} {c.modelo} — ${Number(c.precio_venta).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wide text-white/60">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                               placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                    value={addForm.cantidad}
                    onChange={(e) =>
                      setAddForm((p) => ({ ...p, cantidad: Number(e.target.value) }))
                    }
                    required
                    disabled={perfilIncompleto}
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    className="h-11 w-full rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition disabled:opacity-40"
                    disabled={perfilIncompleto}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Table productos */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft">
            <div className="px-8 pt-7 pb-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Productos en el carrito</h2>

              <div className="flex items-center gap-2">
                <select
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-sm text-white/85 outline-none
                             focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                  value={limit}
                  onChange={(e) => {
                    setPage(1);
                    setLimit(Number(e.target.value));
                  }}
                  disabled={perfilIncompleto}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / pág
                    </option>
                  ))}
                </select>

                <button
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-40 transition"
                  disabled={perfilIncompleto || items.length === 0}
                  type="button"
                  onClick={() => setConfirmCompraOpen(true)}
                >
                  Comprar
                </button>
              </div>
            </div>

            <div className="px-8 py-7">
              {loading ? (
                <p className="text-white/60">Cargando...</p>
              ) : (
                <div className="overflow-auto rounded-xl border border-white/10">
                  <table className="min-w-[860px] w-full text-sm">
                    <thead className="text-white/60 bg-white/[0.02]">
                      <tr className="border-b border-white/10">
                        <th className="py-3 px-4 text-left font-medium">Producto</th>
                        <th className="py-3 px-4 text-left font-medium">Precio</th>
                        <th className="py-3 px-4 text-left font-medium">Cantidad</th>
                        <th className="py-3 px-4 text-left font-medium">Subtotal</th>
                        <th className="py-3 px-4 text-right font-medium">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((it) => {
                        const nombre = getNombreCelular(it);

                        const unit = Number(it.precio_unitario);
                        const qty = Number(it.cantidad);
                        const sub = unit * qty;

                        return (
                          <tr key={it.id_producto_carrito} className="border-b border-white/5">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-white/90">{nombre}</div>
                            </td>

                            <td className="py-4 px-4 tabular-nums text-white/85">
                              ${unit.toFixed(2)}
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06] disabled:opacity-40 transition"
                                  onClick={() => onCambiarCantidad(it, qty - 1)}
                                  type="button"
                                  disabled={perfilIncompleto}
                                >
                                  −
                                </button>

                                <input
                                  type="number"
                                  min={1}
                                  className="h-10 w-24 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-sm text-white/90 outline-none
                                             focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                                  value={qty}
                                  onChange={(e) =>
                                    onCambiarCantidad(it, Number(e.target.value))
                                  }
                                  disabled={perfilIncompleto}
                                />

                                <button
                                  className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06] disabled:opacity-40 transition"
                                  onClick={() => onCambiarCantidad(it, qty + 1)}
                                  type="button"
                                  disabled={perfilIncompleto}
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="py-4 px-4 tabular-nums text-white/85">
                              ${sub.toFixed(2)}
                            </td>

                            <td className="py-4 px-4 text-right">
                              <button
                                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-400/20 disabled:opacity-40 transition"
                                onClick={() => askDelete(it)}
                                type="button"
                                disabled={perfilIncompleto}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-white/60">
                            No hay productos en el carrito.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-white/60">
                  Página <span className="text-white/85 font-semibold">{page}</span> /{" "}
                  <span className="text-white/85 font-semibold">{totalPages}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-40 transition"
                    disabled={perfilIncompleto || page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    type="button"
                  >
                    ←
                  </button>
                  <button
                    className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-40 transition"
                    disabled={perfilIncompleto || page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    type="button"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: resumen */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft p-6 lg:sticky lg:top-24">
            <div className="text-lg font-semibold tracking-tight">Resumen</div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Subtotal</span>
                <span className="tabular-nums text-white/85">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>IVA (12%)</span>
                <span className="tabular-nums text-white/85">${iva.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/80 font-semibold">Total</span>
                <span className="tabular-nums text-white font-semibold text-xl">
                  ${totalFinal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              className="mt-6 h-11 w-full rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition disabled:opacity-40"
              disabled={perfilIncompleto || items.length === 0}
              type="button"
              onClick={() => setConfirmCompraOpen(true)}
            >
              Confirmar compra
            </button>

            <button
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
              type="button"
              onClick={() => navigate("/")}
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Quitar producto"
        description="¿Eliminar este producto del carrito?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        danger
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setToDelete(null);
        }}
        onConfirm={doDelete}
      />

      <ConfirmDialog
        open={confirmCompraOpen}
        title="Confirmar compra"
        description={`¿Confirmas la compra por $${total.toFixed(2)}? (Por ahora NO genera factura)`}
        confirmText="Sí, confirmar"
        cancelText="Cancelar"
        onCancel={() => setConfirmCompraOpen(false)}
        onConfirm={onComprarConfirmado}
      />
    </div>
  );
}
