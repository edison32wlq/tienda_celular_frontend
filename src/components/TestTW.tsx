import React, { useState, type JSX } from "react";

export default function TestTW(): JSX.Element {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  return (
    <div className={mode === "dark" ? "dark" : ""}>
      <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
        {/* Top bar */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="font-extrabold tracking-tight">Tailwind Smoke Test</div>

            <button
              onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold hover:bg-black/5 transition
                         dark:border-white/10 dark:hover:bg-white/10"
            >
              Cambiar a {mode === "dark" ? "claro" : "oscuro"}
            </button>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-4 py-10">
          {/* Alert */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
            ✅ Si ves este “alert” con borde, fondo y colores, Tailwind está funcionando.
          </div>

          {/* Cards */}
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="font-bold">Card</h3>
              <p className="mt-2 text-sm text-black/60 dark:text-white/70">
                Border + bg + shadow + spacing.
              </p>
              <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition">
                Botón
              </button>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="font-bold">Inputs</h3>
              <label className="mt-3 block text-sm font-semibold text-black/70 dark:text-white/70">
                Nombre
              </label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-transparent px-4 outline-none
                           focus:ring-2 focus:ring-blue-600/40 dark:border-white/10"
                placeholder="Escribe aquí..."
              />
              <p className="mt-2 text-xs text-black/50 dark:text-white/50">
                Si el focus ring se ve, Tailwind está activo.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="font-bold">Badges</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 dark:text-emerald-200">
                  Success
                </span>
                <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-800 dark:text-amber-200">
                  Warn
                </span>
                <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-700 dark:text-red-200">
                  Error
                </span>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-black/5 text-black/70 dark:bg-white/5 dark:text-white/70">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: "David", r: "Admin", s: "ok" },
                  { n: "Edison", r: "Editor", s: "warn" },
                  { n: "Alexis", r: "User", s: "err" },
                ].map((row) => (
                  <tr key={row.n} className="border-t border-black/10 dark:border-white/10">
                    <td className="px-4 py-3">{row.n}</td>
                    <td className="px-4 py-3">{row.r}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex rounded-full border px-3 py-1 text-xs " +
                          (row.s === "ok"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                            : row.s === "warn"
                            ? "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                            : "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-200")
                        }
                      >
                        {row.s}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
