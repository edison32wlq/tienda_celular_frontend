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

        const res = await getCelularById(id); // 👈 devuelve el celular directo
        setCelular(res); // ✅ ya no es res.data
      } catch {
        setError("No se pudo cargar el detalle del celular.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
        ❌ {error}
      </div>
    );
  }

  if (!celular) {
    return (
      <div className="space-y-3">
        <div className="text-xl font-extrabold">Celular no encontrado</div>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold hover:bg-white/10 transition"
        >
          Volver al Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-sm font-semibold hover:bg-white/10 transition"
      >
        ← Volver
      </Link>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">
              {celular.marca} {celular.modelo}
            </h1>
            <p className="mt-1 text-white/60 text-sm">
              Código: {celular.codigo} • Estado: {celular.estado}
            </p>
          </div>

          <div className="text-right">
            <div className="text-white/60 text-xs">Precio venta</div>
            <div className="text-2xl font-extrabold">
              ${money(celular.precio_venta)}
            </div>
            <div className="mt-1 text-white/60 text-xs">
              Stock:{" "}
              <span className="text-white font-bold">{celular.stock_actual}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-white/60 text-xs">Color</div>
            <div className="font-semibold">{celular.color}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-white/60 text-xs">Almacenamiento</div>
            <div className="font-semibold">{celular.almacenamiento}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-white/60 text-xs">RAM</div>
            <div className="font-semibold">{celular.ram}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-white/60 text-xs">Costo compra</div>
            <div className="font-semibold">${money(celular.costo_compra)}</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-white/60 text-xs">Descripción</div>
          <p className="mt-2 text-white/80 whitespace-pre-wrap">{celular.descripcion}</p>
        </div>
      </div>
    </div>
  );
}
