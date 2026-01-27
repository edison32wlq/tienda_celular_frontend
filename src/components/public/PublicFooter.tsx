import { type JSX } from "react";

export default function PublicFooter(): JSX.Element {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-14 border-t border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-4">
        <small className="text-white/50">
          © 2026 Tienda Celular | Todos los derechos reservados
        </small>
      </div>
    </footer>
  );
}
