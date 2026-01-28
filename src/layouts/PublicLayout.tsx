import { type JSX } from "react";
import { Outlet } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import PublicFooter from "../components/public/PublicFooter";

export default function PublicLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#050f14] text-slate-100">
      <PublicHeader />

      {/* espacio por header fijo */}
      <main className="mx-auto w-full px-0 pt-16">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
