import { useEffect, useMemo, useState, type JSX } from "react";
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
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide";
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

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-white/70">
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="h-36 w-full rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />
      <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
      <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.05] animate-pulse" />
      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="h-3 w-16 rounded bg-white/[0.05] animate-pulse" />
          <div className="mt-2 h-6 w-24 rounded bg-white/[0.06] animate-pulse" />
        </div>
        <div>
          <div className="h-3 w-14 rounded bg-white/[0.05] animate-pulse" />
          <div className="mt-2 h-5 w-10 rounded bg-white/[0.06] animate-pulse" />
        </div>
      </div>
      <div className="mt-4 h-3 w-full rounded bg-white/[0.05] animate-pulse" />
      <div className="mt-2 h-3 w-5/6 rounded bg-white/[0.05] animate-pulse" />
    </div>
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

  const [page, setPage] = useState(
    Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
  );
  const [limit, setLimit] = useState(
    Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10
  );

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
          searchField: queryKey.searchField?.trim()
            ? queryKey.searchField.trim()
            : undefined,
          sort: queryKey.sort || undefined,
          order: queryKey.order || undefined,
        });

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
    <div className="space-y-6">
      {/* HERO */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-6 sm:px-8 py-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white/70">
                DYE STORE
              </span>
              <span className="text-xs text-white/45">Catálogo oficial</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Catálogo de Celulares
            </h1>

            <p className="text-sm text-white/60 leading-relaxed max-w-xl">
              Explora, filtra y ordena los dispositivos disponibles. Encuentra el
              modelo ideal en segundos.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Chip>Apple</Chip>
              <Chip>Samsung</Chip>
              <Chip>Xiaomi</Chip>
              <Chip>Motorola</Chip>
              <Chip>Stock disponible</Chip>
            </div>
          </div>

          <div className="text-sm text-white/60">
            <span className="text-white/45">Orden:</span>{" "}
            <span className="font-semibold text-white/75">
              {sort ? `${sort} ${order}` : "sin orden"}
            </span>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="px-6 sm:px-8 py-6">
          <div className="grid gap-6 md:grid-cols-12 items-end">
            <div className="md:col-span-6">
              <label className="text-xs font-semibold tracking-wide text-white/60">
                Buscar
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                           placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                placeholder="Ej: iPhone, Samsung, 256GB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-semibold tracking-wide text-white/60">
                Buscar por
              </label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                           focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
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

            <div className="md:col-span-3">
              <label className="text-xs font-semibold tracking-wide text-white/60">
                Ordenar
              </label>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <select
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                             focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
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
                  className="h-11 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
                  onClick={() => setOrder((o) => (o === "ASC" ? "DESC" : "ASC"))}
                  title="Cambiar ASC/DESC"
                >
                  {order}
                </button>
              </div>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-semibold tracking-wide text-white/60">
                Limit
              </label>
              <select
                className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-3 text-sm text-white/90 outline-none
                           focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>

              <button
                className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
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
        </div>
      </div>

      {/* ESTADOS */}
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-8 py-6 text-red-200">
          ❌ {error}
        </div>
      )}

      {!error && loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-8 py-6 text-white/70">
          No hay resultados.
        </div>
      )}

      {/* GRID */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Link
                key={c.id_celular}
                to={`/celulares/${c.id_celular}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 hover:bg-white/[0.06] hover:border-white/15 transition"
              >
                {/* “imagen” fake premium */}
                <div className="h-36 w-full rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02]">
                  <div className="h-full w-full rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_45%)]" />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold tracking-tight truncate">
                      {c.marca} {c.modelo}
                    </div>
                    <div className="mt-1 text-xs text-white/55">
                      Código: {c.codigo} • {c.color} • {c.almacenamiento} • {c.ram}
                    </div>
                  </div>
                  <Badge text={c.estado} />
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-white/55 text-xs">Precio</div>
                    <div className="text-white text-2xl font-semibold tracking-tight tabular-nums">
                      ${money(c.precio_venta)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-white/55 text-xs">Stock</div>
                    <div className="text-white font-semibold tabular-nums">
                      {c.stock_actual}
                    </div>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm text-white/70 group-hover:text-white/75 transition">
                  {c.descripcion}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/75 group-hover:text-white transition">
                  Ver detalle <span className="translate-x-0 group-hover:translate-x-0.5 transition">→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINACIÓN */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-40 transition"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              ← Anterior
            </button>

            <div className="text-sm text-white/60">
              Página <span className="text-white font-semibold">{page}</span> de{" "}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>

            <button
              className="h-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-40 transition"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
