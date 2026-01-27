import { type JSX } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition border border-white/10 bg-white/[0.02]";
const linkIdle = "text-white/75 hover:text-white hover:bg-white/[0.06] hover:border-white/20";
const linkActive = "bg-white/[0.08] text-white border-white/25";

export default function PublicHeader(): JSX.Element {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-dye-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.03] border border-white/10">
            📱
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <div className="text-white font-semibold tracking-tight">
                Tienda Celular
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-white/70">
                DYE
              </span>
            </div>
            <div className="text-[11px] text-white/50 -mt-0.5">
              Catálogo • Carrito • Compras
            </div>
          </div>
        </NavLink>

        {/* Nav */}
        <nav className="flex flex-wrap items-center justify-end gap-2">
          <NavLink
            to="/"
            className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
          >
            Home
          </NavLink>

          {!token ? (
            <>
              <NavLink
                to="/auth/register"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                Register
              </NavLink>

              {/* botón principal */}
              <NavLink
                to="/auth/login"
                className={({ isActive }) =>
                  [
                    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                    "bg-white text-black hover:bg-white/90",
                    isActive ? "ring-4 ring-white/10" : "",
                  ].join(" ")
                }
              >
                Entrar
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}
              >
                Dashboard
              </NavLink>

              <button
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
