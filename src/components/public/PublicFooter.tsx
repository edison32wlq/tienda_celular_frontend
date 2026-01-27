import { type JSX } from "react";

export default function PublicFooter(): JSX.Element {
  return (
    <footer className="border-t border-white/10 bg-[#081a1f]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="font-display text-xl font-bold text-white">TechNest</div>
            <p className="mt-2 text-sm text-white/60">
              Tu tienda de celulares con selecciÃ³n curada, soporte rÃ¡pido y envÃ­os seguros.
            </p>
          </div>
          <div className="text-sm text-white/60">
            <div className="text-white font-semibold">NavegaciÃ³n</div>
            <div className="mt-2 grid gap-1">
              <span>Home</span>
              <span>CatÃ¡logo</span>
              <span>Ofertas</span>
              <span>Contacto</span>
            </div>
          </div>
          <div className="text-sm text-white/60">
            <div className="text-white font-semibold">SuscrÃ­bete</div>
            <div className="mt-2 flex gap-2">
              <input
                className="h-11 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none"
                placeholder="Tu correo"
              />
              <button className="h-11 rounded-full bg-[#16d3c6] px-4 text-sm font-semibold text-[#062428] hover:bg-[#22e2d6] transition">
                Ir
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/50">
          Â© 2026 TechNest. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
