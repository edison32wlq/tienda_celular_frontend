import { type JSX } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition border border-white/10";
const linkIdle = "text-white/70 hover:text-white hover:bg-white/10";
const linkActive = "bg-white/15 text-white";

export default function PublicHeader(): JSX.Element {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a2a2f]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0dd3c6]/20 border border-[#0dd3c6]/40 text-[#9ef7ef]">
            📱
          </div>
          <div className="font-display text-lg font-bold tracking-tight text-white">
            DYE
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
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
