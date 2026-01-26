import React, { useEffect, useMemo, useState, type JSX } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCelulares, type Celular } from "../../services/celulares.service";

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

export default function PublicHome(): JSX.Element {
  const [sp, setSp] = useSearchParams();

  // params desde la URL
  const searchParam = sp.get("search") || "";
  const pageParam = Number(sp.get("page") || "1");
  const limitParam = Number(sp.get("limit") || "10");
  const sortParam = sp.get("sort") || "";
  const orderParam = (sp.get("order") as "ASC" | "DESC" | null) || "ASC";
  const searchFieldParam = sp.get("searchField") || "";

  // estados locales
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
  const [error, setError] = useState<string | null>(null);

  // clave de consulta (para re-fetch)
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

  // sincroniza estado -> URL
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

  // fetch
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

        // ✅ AQUÍ estaba el error: NO es res.data.items
        setItems(res.items);
        setTotalPages(res.meta.totalPages || 1);
      } catch (err) {
        console.log("ERROR PublicHome getCelulares:", err);
        setError("No se pudieron cargar los celulares.");
      } finally {
        setLoading(false);
      }
    })();
  }, [queryKey]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Catálogo de Celulares</h1>
      </div>

      {/* filtros */}
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
        </div>
      </div>

      {/* estados */}
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
          Cargando...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
          ❌ {error}
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
            {items.map((c) => (
              <Link
                key={c.id_celular}
                to={`/celulares/${c.id_celular}`}
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
                    <div className="text-white font-extrabold">
                      ${money(c.precio_venta)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white/60 text-xs">Stock</div>
                    <div className="text-white font-bold">{c.stock_actual}</div>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm text-white/70">
                  {c.descripcion}
                </p>
              </Link>
            ))}
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
