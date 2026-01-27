import { type JSX } from "react";
import { Outlet } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";

export default function PublicLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-dye-bg text-white overflow-x-hidden">
      {/* ✅ fondo tipo Opal */}
      <div className="pointer-events-none fixed inset-0 bg-dye-radial" />

      <PublicHeader />

      {/* ✅ espacio por header fijo */}
      <div className="h-16" />

      <main className="relative mx-auto max-w-6xl px-4 py-8">
        {/* ✅ marco suave para que todo se vea premium sin tocar cada página */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-6">
          <Outlet />
        </div>
      </main>

      {/* ✅ espacio por footer fijo */}
      <div className="h-14" />

      <PublicFooter />
    </div>
  );
}
