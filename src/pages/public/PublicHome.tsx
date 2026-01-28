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
                  className="h-11 rounded-full bg-[#16d3c6] px-6 text-sm font-semibold text-[#062428] hover:bg-[#22e2d6] transition"
                >
                  Comprar ahora
                </a>
                <a
                  href="#recomendados"
                  className="h-11 rounded-full border border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/10 transition"
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
            <div className="relative">
              <div className="relative mx-auto h-[360px] w-[250px] rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-[#1b4b57] to-[#0b2227] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-4 rounded-[2.1rem] bg-gradient-to-br from-[#3d74ff] via-[#0f3d4c] to-[#0b1820] opacity-90" />
                <div className="relative h-full rounded-[2.1rem] border border-white/10 bg-gradient-to-br from-[#0dd3c6]/20 to-transparent p-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-white/60">TechNest</div>
                  <div className="mt-4 text-lg font-semibold text-white">
                    {featured ? `${featured.marca} ${featured.modelo}` : "Smartphone Pro"}
                  </div>
                  <div className="mt-1 text-xs text-white/60">Edición 2026</div>
                </div>
              </div>
              <div className="absolute -right-4 top-16 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white">
                <div className="text-xs text-white/60">Precio desde</div>
                <div className="font-semibold">
                  {featured ? `$${money(featured.precio_venta)}` : "$899"}
                </div>
              </div>
              <div className="absolute -left-8 bottom-10 rounded-full border border-white/10 bg-[#16d3c6] px-4 py-2 text-xs font-semibold text-[#062428]">
                Stock inmediato
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recomendados" className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Recommended</div>
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
              <div className="mt-4 h-32 rounded-2xl bg-gradient-to-br from-[#1c3b46] via-[#10242a] to-[#0b1620]" />
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

      <section className="mx-auto max-w-6xl px-4">
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
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 rounded-3xl bg-[#101d22] px-6 py-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">About our store</div>
            <h3 className="font-display mt-2 text-2xl font-semibold text-white">
              Conoce nuestra experiencia
            </h3>
            <p className="mt-4 text-sm text-white/60">
              Seleccionamos los mejores smartphones con garantía, envíos rápidos y
              asesoría personalizada para que compres seguro.
            </p>
            <div className="mt-6 grid gap-4 text-sm text-white/70 md:grid-cols-3">
              {[
                "Envío gratis a partir de $500",
                "Descuentos semanales",
                "Atención 24/7",
              ].map((text) => (
                <div key={text} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 right-0 h-20 w-20 rounded-2xl bg-[#16d3c6]/30 blur-2xl" />
            <div className="h-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a3b45] to-[#0d1c21]" />
          </div>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-slate-50 px-6 py-8 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Shop the latest smartphones
              </div>
              <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">
                Catálogo actualizado
              </h3>
            </div>
            <div className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600">Buscar</label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none
                       placeholder:text-slate-400 focus:ring-2 focus:ring-[#16d3c6]/40"
                placeholder="Ej: iPhone, Samsung, 256GB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">Buscar por</label>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none
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
              <label className="text-sm font-semibold text-slate-600">Ordenar</label>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none
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
                  className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                  onClick={() => setOrder((o) => (o === "ASC" ? "DESC" : "ASC"))}
                  title="Cambiar ASC/DESC"
                >
                  {order}
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">Limit</label>
              <select
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 outline-none"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>

              <button
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
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
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-slate-500">
              Cargando...
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
              ❌ {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-slate-500">
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
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(15,23,42,0.15)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {c.marca} {c.modelo}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Código: {c.codigo} • {c.color} • {c.almacenamiento} • {c.ram}
                        </div>
                      </div>
                      <Badge text={c.estado} />
                    </div>

                    <div className="mt-4 h-28 rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-200" />

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Precio</div>
                        <div className="text-lg font-bold text-slate-900">
                          ${money(c.precio_venta)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-500">Stock</div>
                        <div className="font-semibold text-slate-800">{c.stock_actual}</div>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm text-slate-500">
                      {c.descripcion}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ←
                </button>

                <div className="text-sm text-slate-600">
                  Página <span className="font-semibold text-slate-900">{page}</span> de{" "}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                </div>

                <button
                  className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
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
        <div className="rounded-3xl bg-[#0d2227] px-6 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">Limited-time deals</div>
              <h3 className="font-display mt-2 text-2xl font-semibold text-white">
                Ofertas relámpago
              </h3>
            </div>
            <div className="flex gap-4 text-center text-xs text-white/60">
              {[
                { label: "Days", value: "03" },
                { label: "Hours", value: "06" },
                { label: "Minutes", value: "16" },
                { label: "Seconds", value: "33" },
              ].map((t) => (
                <div key={t.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-lg font-semibold text-white">{t.value}</div>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Sarah Johnson",
              text: "Totalmente satisfecha con mi compra. La experiencia fue rápida y segura.",
            },
            {
              name: "Michael Lee",
              text: "Me encantó la variedad y el soporte. Muy recomendado.",
            },
            {
              name: "Daniel Perez",
              text: "Gran atención al cliente y entregas puntuales.",
            },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              <div className="text-sm italic">"{t.text}"</div>
              <div className="mt-4 text-sm font-semibold text-white">{t.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-slate-50 px-6 py-10 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.15)]">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Get in touch</div>
              <h3 className="font-display mt-2 text-2xl font-semibold text-slate-900">
                ¿Tienes preguntas? Hablemos.
              </h3>
              <p className="mt-3 text-sm text-slate-500">
                Escríbenos y un asesor te ayudará a elegir el smartphone ideal.
              </p>
            </div>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  placeholder="Nombre"
                />
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  placeholder="Correo"
                />
              </div>
              <textarea
                className="h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                placeholder="Tu mensaje"
              />
              <button className="h-11 rounded-full bg-[#16d3c6] px-6 text-sm font-semibold text-[#062428] hover:bg-[#22e2d6] transition">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}