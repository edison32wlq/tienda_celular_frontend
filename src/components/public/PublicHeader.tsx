import { type JSX } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkBase =
  "rounded-xl px-3 py-2 text-sm font-semibold transition border border-white/10";
const linkIdle = "text-white/70 hover:text-white hover:bg-white/10";
const linkActive = "bg-white/10 text-white";

export default function PublicHeader(): JSX.Element {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 border border-white/10">
            📱
          </div>
          <div className="text-white font-extrabold tracking-tight">Tienda Celular</div>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
            Home
          </NavLink>

          {!token ? (
            <>
              <NavLink to="/auth/login" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
                Login
              </NavLink>
              <NavLink to="/auth/register" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkIdle}`}>
                Dashboard
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className={`${linkBase} ${linkIdle}`}
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
