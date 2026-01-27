import { type JSX } from "react";

export default function PublicFooter(): JSX.Element {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-dye-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Marca */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span className="font-semibold text-white/70">DYE</span>
          <span className="hidden sm:inline text-white/40">Tienda Celular</span>
        </div>

        {/* Centro */}
        <div className="hidden md:block text-xs text-white/40">
          Tecnología • Catálogo • Compras
        </div>

        {/* Legal */}
        <small className="text-xs text-white/45 text-right">
          © 2026 Tienda Celular DYE
        </small>
      </div>
    </footer>
  );
}
