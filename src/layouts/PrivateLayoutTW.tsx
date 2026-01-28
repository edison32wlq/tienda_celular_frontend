import { useState, type JSX } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Item({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "block rounded-xl px-3 py-2 text-sm font-semibold border border-white/10 transition",
          isActive
            ? "bg-white/10 text-white"
            : "text-white/70 hover:text-white hover:bg-white/10",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function PrivateLayoutTW(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ siempre convertir a string para evitar undefined
  const role = String((user as any)?.rol || "").toUpperCase();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
              onClick={() => setOpen((s) => !s)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <div className="font-extrabold tracking-tight text-base sm:text-lg">
              Dashboard
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <div className="min-w-0 max-w-[220px] sm:max-w-[320px] md:max-w-[420px]">
              <span className="block truncate text-xs sm:text-sm text-white/70">
                {(user as any)?.correo}
              </span>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] sm:text-xs">
              {role || "—"}
            </span>

            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/10 px-2.5 py-2 text-xs sm:text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Ir a público
            </button>

            <button
              onClick={onLogout}
              className="rounded-xl bg-red-600 px-2.5 py-2 text-xs sm:text-sm font-semibold hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-6 md:grid md:grid-cols-[240px_1fr] md:gap-5">
        {/* Sidebar */}
        <aside className={["md:block", open ? "block" : "hidden md:block"].join(" ")}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
            <Item to="/dashboard" label="Inicio" onClick={() => setOpen(false)} />

            {/* ✅ Celulares SOLO ADMIN o EMPLEADO */}
            {role === "EMPLEADO" ? (
              <Item
                to="/dashboard/celulares"
                label="Celulares"
                onClick={() => setOpen(false)}
              />
            ) : null}

            {/* ✅ Mi Perfil para TODOS */}
            <Item
              to="/dashboard/mi-perfil"
              label="Mi Perfil"
              onClick={() => setOpen(false)}
            />
            <Item to="/dashboard/carrito" label="Carrito" onClick={() => setOpen(false)} />
            {role === "EMPLEADO" || role === "ADMIN" ? (
              <Item to="/dashboard/proveedores" label="Proveedores" onClick={() => setOpen(false)} />
            ) : null}


            {/* ✅ ADMIN */}
            {role === "ADMIN" ? (
              <>
                <div className="pt-2 text-xs font-bold text-white/40 px-1">ADMIN</div>
                <Item
                  to="/dashboard/admin/usuarios"
                  label="Usuarios"
                  onClick={() => setOpen(false)}
                />
                <Item
                  to="/dashboard/admin/roles"
                  label="Roles"
                  onClick={() => setOpen(false)}
                />

                <Item
                  to="/dashboard/admin/kardex"
                  label="Kardex"
                  onClick={() => setOpen(false)}
                />
              </>
            ) : null}

            {/* ✅ EMPLEADO */}
            {role === "EMPLEADO" ? (
              <Item
                to="/dashboard/orden-compras"
                label="Ordenes de Compra"
                onClick={() => setOpen(false)}
              />
            ) : null}

            {/* ✅ USER */}
            {role === "USER" ? (
              <Item to="/dashboard/compras" label="Compras" onClick={() => setOpen(false)} />
            ) : null}
          </div>
        </aside>

        {/* Content */}
        <main className="min-h-[60vh] min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
