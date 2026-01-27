import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getCelulares, type Celular } from "../../services/celulares.service";
import { getPerfilClienteByUsuarioId, type PerfilCliente } from "../../services/perfil-clientes.service";

import { type Carrito, createCarrito, getCarritos } from "../../services/carrito.service";
import {
  type ProductoCarrito,
  createProductoCarrito,
  getProductosCarrito,
  updateProductoCarrito,
} from "../../services/productosCarrito.service";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function money(v: string | number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function Badge({ text }: { text: string }) {
  const base = "inline-flex rounded-full border px-3 py-1 text-xs";
  const isOk = text?.toUpperCase() === "DISPONIBLE";
  return (
    <span
      className={
        base +
        " " +
        (isOk
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-amber-400/20 bg-amber-400/10 text-amber-200")
      }
    >
      {text}
    </span>
  );
}

// ✅ Ajusta si tu backend usa otro texto
const ESTADO_ABIERTO = "ABIERTO";

export default function DashboardHome(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // params desde la URL (igual que tu PublicHome)
  const searchParam = sp.get("search") || "";
  const pageParam = Number(sp.get("page") || "1");
  const limitParam = Number(sp.get("limit") || "10");
  const sortParam = sp.get("sort") || "";
  const orderParam = (sp.get("order") as "ASC" | "DESC" | null) || "ASC";
  const searchFieldParam = sp.get("searchField") || "";

  const [search, setSearch] = useState(searchParam);
  const debouncedSearch = useDebouncedValue(search, 450);

  const [page, setPage] = useState(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
  const [limit, setLimit] = useState(Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10);

  const [sort, setSort] = useState(sortParam);
  const [order, setOrder] = useState<"ASC" | "DESC">(orderParam);
  const [searchField, setSearchField] = useState(searchFieldParam);

  const [items, setItems] = useState<Celular[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // carrito / perfil
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [carritoItems, setCarritoItems] = useState<ProductoCarrito[]>([]);

  const idUsuario =
    (user as any)?.id_usuario ||
    (user as any)?.sub ||
    (user as any)?.id ||
    "";

  const queryKey = useMemo(
    () => ({
      search: debouncedSearch,
      page,
      limit,
      sort,
      order,
      searchField,
    }),
    [debouncedSearch, page, limit, sort, order, searchField]
  );

  // sincroniza filtros con la URL
  useEffect(() => {
    setSp((prev) => {
      const next = new URLSearchParams(prev);

      if (search) next.set("search", search);
      else next.delete("search");

      next.set("page", String(page));
      next.set("limit", String(limit));

      if (sort) next.set("sort", sort);
      else next.delete("sort");

      if (order) next.set("order", order);
      else next.delete("order");

      if (searchField) next.set("searchField", searchField);
      else next.delete("searchField");

      return next;
    });
  }, [search, page, limit, sort, order, searchField, setSp]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ✅ 1) cargar catálogo
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCelulares({
          page: queryKey.page,
          limit: queryKey.limit,
          search: queryKey.search?.trim() ? queryKey.search.trim() : undefined,
          searchField: queryKey.searchField?.trim() ? queryKey.searchField.trim() : undefined,
          sort: queryKey.sort || undefined,
          order: queryKey.order || undefined,
        });

        setItems(res.items);
        setTotalPages(res.meta.totalPages || 1);
      } catch (err) {
        console.log("ERROR DashboardHome getCelulares:", err);
        setError("No se pudieron cargar los celulares.");
      } finally {
        setLoading(false);
      }
    })();
  }, [queryKey]);

  // ✅ 2) cargar perfil + carrito (una sola vez)
  useEffect(() => {
    (async () => {
      try {
        if (!idUsuario) return;

        const p = await getPerfilClienteByUsuarioId(String(idUsuario));
        setPerfil(p);

        if (!p?.id_cliente) return;

        // buscar carrito abierto
        const res = await getCarritos({
          page: 1,
          limit: 50,
          search: p.id_cliente,
          searchField: "id_cliente",
          sort: "fecha_creacion",
          order: "DESC",
        });

        const abierto =
          res.items.find((c) => String(c.estado || "").toUpperCase() === ESTADO_ABIERTO) || null;

        if (abierto) {
          setCarrito(abierto);

          // cargar items del carrito
          const prod = await getProductosCarrito({
            page: 1,
            limit: 200,
            search: abierto.id_carrito,
            searchField: "id_carrito",
            sort: "cantidad",
            order: "DESC",
          });

          setCarritoItems(prod.items);
        }
      } catch (e) {
        // no es crítico para ver catálogo
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: asegura carrito abierto (crea si no existe)
  async function ensureCarritoAbierto(): Promise<Carrito> {
    if (!idUsuario) throw new Error("No se detectó id_usuario del usuario logueado.");

    const p = perfil || (await getPerfilClienteByUsuarioId(String(idUsuario)));
    setPerfil(p);

    if (!p?.id_cliente) {
      throw new Error("Debes completar tu Perfil Cliente antes de usar el carrito.");
    }

    if (carrito?.id_carrito) return carrito;

    // buscar por si aún no estaba en state
    const res = await getCarritos({
      page: 1,
      limit: 50,
      search: p.id_cliente,
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

    const creado = await createCarrito({ id_cliente: p.id_cliente, estado: ESTADO_ABIERTO });
    setCarrito(creado);
    return creado;
  }

  async function refreshCarritoItems(id_carrito: string) {
    const prod = await getProductosCarrito({
      page: 1,
      limit: 200,
      search: id_carrito,
      searchField: "id_carrito",
      sort: "cantidad",
      order: "DESC",
    });
    setCarritoItems(prod.items);
  }

  const onAgregarACarrito = async (cel: Celular) => {
    try {
      setMsg(null);
      setError(null);
      setWorkingId(cel.id_celular);

      const c = await ensureCarritoAbierto();

      // si no hay stock, bloquea (opcional)
      if (Number(cel.stock_actual ?? 0) <= 0) {
        setError("No hay stock disponible de este celular.");
        return;
      }

      // si ya existe en carrito, sumar +1
      const existente = carritoItems.find((it) => it.id_celular === cel.id_celular);

      if (existente) {
        await updateProductoCarrito(existente.id_producto_carrito, {
          cantidad: Number(existente.cantidad) + 1,
          precio_unitario: Number(cel.precio_venta),
        });
      } else {
        await createProductoCarrito({
          id_carrito: c.id_carrito,
          id_celular: cel.id_celular,
          cantidad: 1,
          precio_unitario: Number(cel.precio_venta),
        });
      }

      await refreshCarritoItems(c.id_carrito);
      setMsg(`✅ Agregado: ${cel.marca} ${cel.modelo}`);

      // (opcional) auto-ocultar mensaje
      setTimeout(() => setMsg(null), 1800);
    } catch (e: any) {
      const m = e?.message || "No se pudo agregar al carrito.";
      setError(m);

      // si falta perfil, lo mando a mi-perfil
      if (String(m).toLowerCase().includes("perfil")) {
        // opcional: redirigir directo
        // navigate("/dashboard/mi-perfil");
      }
    } finally {
      setWorkingId(null);
    }
  };

  // UI
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="mt-2 text-white/70">
          Catálogo con botón para agregar productos al carrito.
        </p>

        {msg && (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-100">
            {msg}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-red-200">
            ❌ {error}
            {String(error).toLowerCase().includes("perfil") ? (
              <div className="mt-2">
                <button
                  className="rounded-xl bg-yellow-400/90 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-400"
                  type="button"
                  onClick={() => navigate("/dashboard/mi-perfil")}
                >
                  Completar mi perfil
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* filtros (igual que tu PublicHome) */}
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-white/70">Buscar</label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                       placeholder:text-white/40 focus:ring-2 focus:ring-blue-600/40"
            placeholder="Ej: iPhone, Samsung, 256GB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-white/70">Buscar por</label>
          <select
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-4 outline-none
                       focus:ring-2 focus:ring-blue-600/40"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="">(General)</option>
            <option value="codigo">Código</option>
            <option value="marca">Marca</option>
            <option value="modelo">Modelo</option>
            <option value="color">Color</option>
            <option value="almacenamiento">Almacenamiento</option>
            <option value="ram">RAM</option>
            <option value="estado">Estado</option>
            <option value="descripcion">Descripción</option>
            <option value="precio_venta">Precio</option>
            <option value="stock_actual">Stock</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-white/70">Ordenar</label>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
            <select
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-4 outline-none
                         focus:ring-2 focus:ring-blue-600/40"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">(Sin orden)</option>
              <option value="precio_venta">Precio venta</option>
              <option value="stock_actual">Stock</option>
              <option value="marca">Marca</option>
              <option value="modelo">Modelo</option>
            </select>

            <button
              type="button"
              className="h-11 rounded-xl border border-white/10 px-3 text-sm font-semibold hover:bg-white/10 transition"
              onClick={() => setOrder((o) => (o === "ASC" ? "DESC" : "ASC"))}
              title="Cambiar ASC/DESC"
            >
              {order}
            </button>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center gap-2">
          <label className="text-sm font-semibold text-white/70">Limit</label>
          <select
            className="h-10 rounded-xl border border-white/10 bg-slate-950 px-3 outline-none"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>

          <button
            className="h-10 rounded-xl border border-white/10 px-3 text-sm font-semibold hover:bg-white/10 transition"
            onClick={() => {
              setSearch("");
              setSearchField("");
              setSort("");
              setOrder("ASC");
              setLimit(10);
              setPage(1);
            }}
          >
            Limpiar
          </button>

          <button
            className="h-10 rounded-xl border border-white/10 px-3 text-sm font-semibold hover:bg-white/10 transition"
            type="button"
            onClick={() => navigate("/dashboard/carrito")}
          >
            Ir al carrito →
          </button>
        </div>
      </div>

      {/* estados */}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
          Cargando...
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
          No hay resultados.
        </div>
      )}

      {/* grid */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {items.map((c) => {
              const agotado = Number(c.stock_actual ?? 0) <= 0;

              return (
                <div
                  key={c.id_celular}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-white font-bold">
                        {c.marca} {c.modelo}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        Código: {c.codigo} • {c.color} • {c.almacenamiento} • {c.ram}
                      </div>
                    </div>
                    <Badge text={c.estado} />
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-white/60 text-xs">Precio</div>
                      <div className="text-white font-extrabold">${money(c.precio_venta)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-white/60 text-xs">Stock</div>
                      <div className="text-white font-bold">{c.stock_actual}</div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm text-white/70">{c.descripcion}</p>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="h-11 flex-1 rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition disabled:opacity-40"
                      onClick={() => onAgregarACarrito(c)}
                      disabled={agotado || workingId === c.id_celular}
                    >
                      {workingId === c.id_celular ? "Agregando..." : "Agregar a carrito"}
                    </button>
                  </div>

                  {agotado ? (
                    <div className="mt-3 text-xs text-red-200/80">Sin stock disponible.</div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* paginación */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              className="h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold hover:bg-white/10 disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ←
            </button>

            <div className="text-sm text-white/70">
              Página <span className="text-white font-semibold">{page}</span> de{" "}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>

            <button
              className="h-10 rounded-xl border border-white/10 px-4 text-sm font-semibold hover:bg-white/10 disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
