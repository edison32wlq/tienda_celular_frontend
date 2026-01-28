import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createPerfilCliente,
  getPerfilClientes,
  updatePerfilCliente,
  type PerfilCliente,
} from "../../services/perfil-clientes.service";

type FormState = {
  cedula: string;
  telefono: string;
  direccion: string;
};

export default function PerfilClientePage() {
  const { user } = useAuth();

  const userId = useMemo(() => {
    return (user as any)?.id_usuario || (user as any)?.id || "";
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);

  const [form, setForm] = useState<FormState>({
    cedula: "",
    telefono: "",
    direccion: "",
  });

  const isEdit = Boolean(perfil?.id_cliente);

  async function loadMyPerfil() {
    if (!userId) {
      setError("No se detectó id del usuario logueado.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await getPerfilClientes({ page: 1, limit: 200 });

      const found = res.items.find((p) => p.id_usuario === userId) || null;
      setPerfil(found);

      if (found) {
        setForm({
          cedula: found.cedula ?? "",
          telefono: found.telefono ?? "",
          direccion: found.direccion ?? "",
        });
      } else {
        setForm({ cedula: "", telefono: "", direccion: "" });
      }
    } catch (e: any) {
      setError("No se pudo cargar tu perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const onChange = (k: keyof FormState, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setOk(null);
    setError(null);

    if (!userId) {
      setError("No se detectó id del usuario logueado.");
      return;
    }

    if (!form.cedula.trim() || !form.telefono.trim() || !form.direccion.trim()) {
      setError("Completa cédula, teléfono y dirección.");
      return;
    }

    try {
      setSaving(true);

      if (!perfil) {
        const created = await createPerfilCliente({
          id_usuario: userId,
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
        });
        setPerfil(created);
        setOk("Perfil creado ✅");
      } else {
        const updated = await updatePerfilCliente(perfil.id_cliente, {
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
        });
        setPerfil(updated);
        setOk("Perfil actualizado ✅");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        "No se pudo guardar. (Si ya existe perfil, solo se puede actualizar).";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft">
        <div className="px-8 py-7 border-b border-white/10">
          <h1 className="text-3xl font-semibold tracking-tight">Mi Perfil</h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            Aquí puedes guardar y actualizar tu información básica. No se permite borrar.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft px-8 py-6 text-white/70">
          Cargando...
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-6 py-5 text-red-200">
              ❌ {error}
            </div>
          )}

          {ok && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-6 py-5 text-emerald-200">
              ✅ {ok}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-soft">
            <div className="px-8 pt-7 pb-5 border-b border-white/10 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {isEdit ? "Actualizar información" : "Completa tu información"}
              </h2>
              <span className="text-xs rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-white/65">
                Usuario: {userId.slice(0, 8)}...
              </span>
            </div>

            <div className="px-8 py-7">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold tracking-wide text-white/60">
                      Cédula
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                                 placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                      value={form.cedula}
                      onChange={(e) => onChange("cedula", e.target.value)}
                      placeholder="0102030405"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold tracking-wide text-white/60">
                      Teléfono
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                                 placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                      value={form.telefono}
                      onChange={(e) => onChange("telefono", e.target.value)}
                      placeholder="0999999999"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold tracking-wide text-white/60">
                      Dirección
                    </label>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm text-white/90 outline-none
                                 placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition"
                      value={form.direccion}
                      onChange={(e) => onChange("direccion", e.target.value)}
                      placeholder="Av..., Calle..., Nro..., Referencia..."
                    />
                  </div>
                </div>

                <button
                  disabled={saving}
                  className="h-11 w-full rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60"
                >
                  {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar perfil"}
                </button>

                {isEdit ? (
                  <p className="text-xs text-white/45">
                    * No existe botón “Eliminar” porque el perfil es único por usuario.
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
