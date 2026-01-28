import React, { useEffect, useState, type JSX } from "react";
import { Link, useParams } from "react-router-dom";
import { type CelularDto, getCelularById } from "../../services/celulares.service";

function money(v: string | number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

export default function PublicCelularDetail(): JSX.Element {
  const { id } = useParams();
  const [celular, setCelular] = useState<CelularDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) throw new Error("missing id");
        setLoading(true);
        setError(null);

        const res = await getCelularById(id);
        setCelular(res);
      } catch {
        setError("No se pudo cargar el detalle del celular.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft px-8 py-6 text-white/70">
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-8 py-6 text-red-200">
          ❌ {error}
        </div>
      </div>
    );
  }

  if (!celular) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-4">
        <div className="text-2xl font-semibold tracking-tight">Celular no encontrado</div>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
        >
          Volver al Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
        >
          ← Volver
        </Link>

        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65">
          Código: <span className="ml-2 text-white/85 font-medium">{celular.codigo}</span>
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft">
        <div className="px-8 pt-7 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {celular.marca} {celular.modelo}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Estado: <span className="text-white/80 font-medium">{celular.estado}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/55">Precio venta</div>
              <div className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                ${money(celular.precio_venta)}
              </div>
              <div className="mt-2 text-xs text-white/55">
                Stock:{" "}
                <span className="text-white/85 font-semibold tabular-nums">
                  {celular.stock_actual}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-xs text-white/55">Color</div>
              <div className="mt-1 font-semibold text-white/90">{celular.color}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-xs text-white/55">Almacenamiento</div>
              <div className="mt-1 font-semibold text-white/90">{celular.almacenamiento}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-xs text-white/55">RAM</div>
              <div className="mt-1 font-semibold text-white/90">{celular.ram}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-xs text-white/55">Costo compra</div>
              <div className="mt-1 font-semibold text-white/90 tabular-nums">
                ${money(celular.costo_compra)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold tracking-wide text-white/55">
              Descripción
            </div>
            <p className="mt-3 text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
              {celular.descripcion}
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              className="w-full rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-500 transition"
              onClick={() => alert("Agregado al carrito")} // Cambia este handler según lógica de carrito
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
