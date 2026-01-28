import { useEffect, useMemo, useState, type JSX } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCelulares, type Celular } from "../../services/celulares.service";
import aboutStorePhone from "../../assets/celular_mano.png";
import iphone17 from "../../assets/iphone17.png";

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
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700")
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

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const resolveImageUrl = (value?: string) => {
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
      return value;
    }
    return `${apiBaseUrl}${value}`;
  };

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

  const featured = items[0];
  const recommended = items.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative -mx-4 overflow-hidden bg-[#0a2a2f]">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#13d3c6]/20 blur-3xl" />
          <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-[#2b6dff]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#0dd3c6]/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                Novedades 2026
              </span>
              <h1 className="font-display mt-5 text-4xl font-bold leading-tight text-white md:text-5xl">
                Explora, compara y elige inteligente.
              </h1>
              <p className="mt-4 text-base text-white/70">
                Encuentra tu próximo smartphone con una experiencia limpia, rápida y
                segura. Filtra por marca, almacenamiento y precio en segundos.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#catalogo"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#16d3c6] px-6 text-sm font-semibold text-[#062428] transition hover:bg-[#22e2d6]"
                >
                  Comprar ahora
                </a>
                <a
                  href="#recomendados"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Ver recomendados
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-white/60">
                <div>
                  <div className="text-lg font-semibold text-white">+250</div>
                  Modelos disponibles
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">24/7</div>
                  Soporte dedicado
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">48h</div>
                  Entrega express
                </div>
              </div>
            </div>
            <img
              src={iphone17}
              alt="iPhone 17"
              className="mx-auto h-[660px] w-[550px] object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section id="recomendados" className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Recomendado</div>
            <h2 className="font-display mt-2 text-2xl font-semibold text-white">
              Selección destacada
            </h2>
          </div>
          <a href="#catalogo" className="text-sm text-[#9ef7ef] hover:text-white">
            Ver catálogo
          </a>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {(loading ? Array.from({ length: 4 }) : recommended).map((c, idx) => (
            <div
              key={c ? c.id_celular : `skeleton-${idx}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[#16d3c6]/60 hover:bg-white/10"
            >
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="rounded-full bg-white/10 px-2 py-1">New</span>
                <span>2026</span>
              </div>
              <div className="mt-4 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c3b46] via-[#10242a] to-[#0b1620]">
                {c?.imagen_url ? (
                  <img
                    src={resolveImageUrl(c.imagen_url)}
                    alt={`${c.marca} ${c.modelo}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="mt-4 text-sm text-white/70">
                {c ? `${c.marca} ${c.modelo}` : "Cargando..."}
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                {c ? `$${money(c.precio_venta)}` : "$--"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-slate-50 px-6 py-10 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Top mobile brands</div>
              <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">
                Marcas que lideran tendencia
              </h3>
            </div>
            <button className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
              Ver todas
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              "Apple",
              "Samsung",
              "Xiaomi",
              "Motorola",
              "OnePlus",
              "Google",
              "Realme",
              "Vivo",
            ].map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">{brand}</div>
                  <div className="text-xs text-slate-500">Shop now</div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section id="catalogo" className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-white/10 bg-[#101d22] px-6 py-8 text-white shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                Compra los mejores smartphones
              </div>
              <h3 className="font-display mt-2 text-2xl font-semibold text-white">
                Catálogo actualizado
              </h3>
            </div>
            <div className="text-sm text-white/60">
              Página {page} de {totalPages}
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-white/70">Buscar</label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none
                       placeholder:text-white/40 focus:ring-2 focus:ring-[#16d3c6]/40"
                placeholder="Ej: iPhone, Samsung, 256GB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/70">Buscar por</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none
                       focus:ring-2 focus:ring-[#16d3c6]/40"
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
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none
                         focus:ring-2 focus:ring-[#16d3c6]/40"
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
                  className="h-11 rounded-xl border border-white/10 px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                  onClick={() => setOrder((o) => (o === "ASC" ? "DESC" : "ASC"))}
                  title="Cambiar ASC/DESC"
                >
                  {order}
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-white/70">Límite</label>
              <select
                className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-white outline-none"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>

              <button
                className="h-10 rounded-xl border border-white/10 px-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
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

          {loading && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
              Cargando...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
              ❌ {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
              No hay resultados.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {items.map((c) => (
                  <Link
                    key={c.id_celular}
                    to={`/celulares/${c.id_celular}`}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">
                          {c.marca} {c.modelo}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          Código: {c.codigo} • {c.color} • {c.almacenamiento} • {c.ram}
                        </div>
                      </div>
                      <Badge text={c.estado} />
                    </div>

                    <div className="mt-4 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c3b46] via-[#10242a] to-[#0b1620]">
                      {c.imagen_url ? (
                        <img
                          src={resolveImageUrl(c.imagen_url)}
                          alt={`${c.marca} ${c.modelo}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-xs text-white/50">Precio</div>
                        <div className="text-lg font-bold text-white">
                          ${money(c.precio_venta)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-white/50">Stock</div>
                        <div className="font-semibold text-white/80">{c.stock_actual}</div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm text-white/60">
                      {c.descripcion}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  className="h-10 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ←
                </button>

                <div className="text-sm text-white/60">
                  Página <span className="font-semibold text-white">{page}</span> de{" "}
                  <span className="font-semibold text-white">{totalPages}</span>
                </div>

                <button
                  className="h-10 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  →
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1b1b1d] px-6 py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='104' viewBox='0 0 120 104'><g fill='none' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='1'><path d='M30 2 L90 2 L118 52 L90 102 L30 102 L2 52 Z'/></g></svg>\")",
              backgroundSize: "160px 140px",
            }}
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">
                Acerca de nuestra tienda
              </div>
              <h3 className="font-display mt-2 text-3xl font-semibold text-white">
                Conoce nuestra experiencia
              </h3>
              <p className="mt-4 text-sm text-white/70">
                En GYE Mobile reunimos los últimos smartphones y accesorios de
                marcas globales. Nuestra misión es hacer la tecnología accesible, segura y
                emocionante para todos.
              </p>
              <p className="mt-4 text-sm text-white/60">
                Desde modelos premium hasta opciones accesibles, cuidamos la calidad,
                la transparencia y el soporte para que encuentres tu próximo móvil ideal.
              </p>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/70">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                      <path
                        d="M3 7h11l3 5h4v6h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3V7z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M3 7V5a2 2 0 0 1 2-2h7" strokeWidth="1.5" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-white">Envío Gratis</div>
                    <div className="text-xs text-white/50">Por compras desde $500</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                      <path
                        d="M12 3l3.5 7H22l-5.5 4 2 7L12 17l-6.5 4 2-7L2 10h6.5z"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-white">Descuentos</div>
                    <div className="text-xs text-white/50">Ahorra en cada compra</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                      <path
                        d="M12 4a8 8 0 1 0 8 8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M12 8v4l3 2" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-white">24/7 Ayuda</div>
                    <div className="text-xs text-white/50">Soporte siempre activo</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-10 top-10 h-48 w-48 rounded-full bg-[#16d3c6]/10 blur-3xl" />
              <div className="relative mx-auto aspect-square w-full max-w-[360px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#23262a] to-[#141516] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                <img
                  src={aboutStorePhone}
                  alt="Smartphone"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
