import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // resolver URL de imagen
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const resolveImageUrl = (value?: string) => {
    if (!value) return "";
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
      return value;
    }
    return `${apiBaseUrl}${value}`;
  };

  // consulta de productos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCelulares({
          page: page,
          limit: limit,
          search: debouncedSearch?.trim() || undefined,
          searchField: searchField?.trim() || undefined,
          sort: sort || undefined,
          order: order || undefined,
        });

        setItems(res.items);
      } catch (err) {
        setError("No se pudieron cargar los celulares.");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, debouncedSearch, sort, order, searchField]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>

      {loading && <div className="text-white">Cargando...</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-white/70">No hay productos disponibles.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((cel) => (
            <div key={cel.id_celular} className="p-5 border rounded-lg bg-white/5">
              {/* Imagen del celular */}
              <div className="mb-4 w-full h-40">
                {cel.imagen_url ? (
                  <img
                    src={resolveImageUrl(cel.imagen_url)}
                    alt={`${cel.marca} ${cel.modelo}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 text-center flex items-center justify-center">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Detalles del celular */}
              <div className="font-semibold text-white">{cel.marca} {cel.modelo}</div>
              <div className="text-sm text-white/60">{cel.codigo} • {cel.color} • {cel.almacenamiento} • {cel.ram}</div>
              <div className="text-lg font-bold text-white">${money(cel.precio_venta)}</div>

              <Badge text={cel.estado} />

              <button
                onClick={() => {}}
                className="mt-4 w-full h-12 bg-blue-600 text-white rounded-lg"
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
