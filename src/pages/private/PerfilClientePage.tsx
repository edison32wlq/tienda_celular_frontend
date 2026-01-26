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

      // ⚠️ Como tu backend no tiene endpoint "mi perfil", traemos lista y filtramos.
      // Para que no explote si hay muchos, usa limit alto (100 o 200).
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
        // ✅ crear 1 vez
        const created = await createPerfilCliente({
          id_usuario: userId,
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
        });
        setPerfil(created);
        setOk("Perfil creado ✅");
      } else {
        // ✅ actualizar
        const updated = await updatePerfilCliente(perfil.id_cliente, {
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
        });
        setPerfil(updated);
        setOk("Perfil actualizado ✅");
      }
    } catch (e: any) {
      // tu backend cuando ya existe devuelve null y controller lanza 500
      // aquí lo mostramos más humano:
      const msg =
        e?.response?.data?.message ||
        "No se pudo guardar. (Si ya existe perfil, solo se puede actualizar).";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">Mi Perfil</h1>
        <p className="mt-1 text-sm text-white/60">
          Aquí puedes guardar y actualizar tu información básica. No se permite borrar.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
          Cargando...
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-200">
              ❌ {error}
            </div>
          )}

          {ok && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-200">
              ✅ {ok}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                {isEdit ? "Actualizar información" : "Completa tu información"}
              </h2>
              <span className="text-xs rounded-full border border-white/10 px-3 py-1 text-white/70">
                Usuario: {userId.slice(0, 8)}...
              </span>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-white/70">Cédula</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                               focus:ring-2 focus:ring-blue-600/40"
                    value={form.cedula}
                    onChange={(e) => onChange("cedula", e.target.value)}
                    placeholder="0102030405"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-white/70">Teléfono</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                               focus:ring-2 focus:ring-blue-600/40"
                    value={form.telefono}
                    onChange={(e) => onChange("telefono", e.target.value)}
                    placeholder="0999999999"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-white/70">Dirección</label>
                  <input
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-transparent px-4 outline-none
                               focus:ring-2 focus:ring-blue-600/40"
                    value={form.direccion}
                    onChange={(e) => onChange("direccion", e.target.value)}
                    placeholder="Av..., Calle..., Nro..., Referencia..."
                  />
                </div>
              </div>

              <button
                disabled={saving}
                className="h-11 w-full rounded-xl bg-blue-600 font-semibold hover:bg-blue-500 transition disabled:opacity-60"
              >
                {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar perfil"}
              </button>

              {isEdit ? (
                <p className="text-xs text-white/50">
                  * No existe botón “Eliminar” porque el perfil es único por usuario.
                </p>
              ) : null}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
