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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">Carrito</h1>
        <p className="mt-1 text-sm text-white/60">
          Agrega productos al carrito y confirma la compra (por ahora sin factura).
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
              Para usar el carrito necesitas llenar tu perfil (cédula, teléfono, dirección).
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-yellow-400/90 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-400"
                type="button"
                onClick={() => navigate("/dashboard/mi-perfil")}
              >
                Completar mi perfil
              </button>

              <button
                className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/5"
                type="button"
                onClick={() => loadAll()}
              >
                Ya lo completé, refrescar
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/70">
            <div>
              <span className="text-white/50">id_usuario:</span>{" "}
              <span className="font-semibold">{String(idUsuario || "—")}</span>
            </div>
            <div>
              <span className="text-white/50">id_cliente:</span>{" "}
              <span className="font-semibold">{idCliente || "—"}</span>
            </div>
            <div>
              <span className="text-white/50">Carrito:</span>{" "}
              <span className="font-semibold">{carrito?.id_carrito || "—"}</span>
            </div>
            <div>
              <span className="text-white/50">Estado:</span>{" "}
              <span className="font-semibold">{carrito?.estado || "—"}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="h-11 rounded-xl border border-white/10 px-4 hover:bg-white/5"
              type="button"
              onClick={() => loadAll()}
            >
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Add product */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Añadir producto</h2>
          {perfilIncompleto ? (
            <span className="text-sm text-yellow-200/80">⚠️ Completa tu perfil primero</span>
          ) : null}
        </div>

        <form onSubmit={onAgregarProducto} className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-white/70">Celular</label>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-3 outline-none"
              value={addForm.id_celular}
              onChange={(e) => setAddForm((p) => ({ ...p, id_celular: e.target.value }))}
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
            <label className="text-sm font-semibold text-white/70">Cantidad</label>
            <input
              type="number"
              min={1}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                         focus:ring-2 focus:ring-blue-600/40"
              value={addForm.cantidad}
              onChange={(e) => setAddForm((p) => ({ ...p, cantidad: Number(e.target.value) }))}
              required
              disabled={perfilIncompleto}
            />
          </div>

          <div className="md:col-span-3">
            <button
              className="h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition disabled:opacity-40"
              disabled={perfilIncompleto}
            >
              Agregar al carrito
            </button>
          </div>
        </form>
      </div>

      {/* Table productos */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Productos en el carrito</h2>

          <div className="flex items-center gap-2">
            <select
              className="h-11 rounded-xl border border-white/10 bg-transparent px-3 outline-none"
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
              className="h-11 rounded-xl border border-white/10 px-4 hover:bg-white/5 disabled:opacity-40"
              disabled={perfilIncompleto || items.length === 0}
              type="button"
              onClick={() => setConfirmCompraOpen(true)}
            >
              Comprar
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-3 text-white/60">Cargando...</p>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="text-white/60">
                <tr className="border-b border-white/10">
                  <th className="py-3 text-left">Celular</th>
                  <th className="py-3 text-left">Precio unit.</th>
                  <th className="py-3 text-left">Cantidad</th>
                  <th className="py-3 text-left">Subtotal</th>
                  <th className="py-3 text-right">Acciones</th>
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
                      <td className="py-3">
                        {/* ✅ CAMBIO: ahora siempre muestra NOMBRE */}
                        <div className="font-semibold">{nombre}</div>

                        {/* ✅ CAMBIO: ya NO mostramos ID. Mostramos un detalle bonito */}
                        <div className="text-xs text-white/50">
                          {(() => {
                            const celFromItem = (it as any)?.celular;
                            const celFromCatalog = celulares.find((c) => c.id_celular === it.id_celular);

                            const cel = celFromItem || celFromCatalog;

                            if (!cel) return "—";

                            const color = (cel as any)?.color ? `Color: ${(cel as any).color}` : "";
                            const al = (cel as any)?.almacenamiento
                              ? `Alm: ${(cel as any).almacenamiento}`
                              : "";
                            const extra = [color, al].filter(Boolean).join(" • ");

                            return extra || "—";
                          })()}
                        </div>
                      </td>

                      <td className="py-3">${unit.toFixed(2)}</td>

                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                            onClick={() => onCambiarCantidad(it, qty - 1)}
                            type="button"
                            disabled={perfilIncompleto}
                          >
                            −
                          </button>

                          <input
                            type="number"
                            min={1}
                            className="h-11 w-24 rounded-xl border border-white/10 bg-transparent px-3 outline-none"
                            value={qty}
                            onChange={(e) => onCambiarCantidad(it, Number(e.target.value))}
                            disabled={perfilIncompleto}
                          />

                          <button
                            className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                            onClick={() => onCambiarCantidad(it, qty + 1)}
                            type="button"
                            disabled={perfilIncompleto}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3">${sub.toFixed(2)}</td>

                      <td className="py-3 text-right">
                        <button
                          className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-red-200 hover:bg-red-400/20 disabled:opacity-40"
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
                    <td colSpan={5} className="py-6 text-center text-white/60">
                      No hay productos en el carrito.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-white/70">
            <span className="text-white/50">Total:</span>{" "}
            <span className="text-white font-extrabold">${total.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-white/60">
              Página {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
                disabled={perfilIncompleto || page <= 1}
                onClick={() => setPage((p) => p - 1)}
                type="button"
              >
                ←
              </button>
              <button
                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/5 disabled:opacity-40"
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
