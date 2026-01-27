import { type JSX } from "react";
import { Outlet } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";

export default function PublicLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicHeader />

      {/* espacio por header fijo */}
      <div className="h-16" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* espacio por footer fijo */}
      <div className="h-14" />

      <PublicFooter />
    </div>
  );
}
