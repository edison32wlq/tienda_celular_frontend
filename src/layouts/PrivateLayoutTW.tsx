import { useState, type JSX } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Item({
  to,
  label,
  icon,
  onClick,
}: {
  to: string;
  label: string;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition border",
          "border-white/10 bg-white/[0.02] text-white/80 hover:bg-white/[0.06] hover:border-white/15",
          isActive ? "bg-white/[0.08] border-white/20 text-white font-semibold" : "",
        ].join(" ")
      }
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-[13px] text-white/80 group-hover:bg-white/[0.06] transition">
        {icon || "•"}
      </span>
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="pt-3 pb-1 px-2 text-[11px] font-semibold tracking-widest text-white/35">
      {children}
    </div>
  );
}

export default function PrivateLayoutTW(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // ✅ siempre convertir a string para evitar undefined
  const role = String((user as any)?.rol || "").toUpperCase();
  const correo = (user as any)?.correo || (user as any)?.email || "—";

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-dye-bg text-white overflow-x-hidden">
      {/* ✅ fondo “opal” */}
      <div className="pointer-events-none fixed inset-0 bg-dye-radial" />

      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-dye-bg/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06] transition"
              onClick={() => setOpen((s) => !s)}
              aria-label="Abrir menú"
            >
              ☰
            </button>

            {/* Brand */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06] transition"
              title="Ir al inicio del dashboard"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03]">
                📱
              </span>
              <div className="leading-tight text-left">
                <div className="text-sm font-semibold tracking-tight">DYE</div>
                <div className="text-[11px] text-white/50 -mt-0.5">Dashboard</div>
              </div>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <div className="min-w-0 max-w-[240px] sm:max-w-[360px] md:max-w-[460px]">
              <span className="block truncate text-sm text-white/55">
                {correo}
              </span>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] sm:text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              {role || "—"}
            </span>

            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
            >
              Público
            </button>

            <button
              onClick={onLogout}
              className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-7 md:grid md:grid-cols-[300px_1fr] md:gap-8">
        {/* Sidebar */}
        <aside className={["md:block", open ? "block" : "hidden md:block"].join(" ")}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3 space-y-2">
            <SectionTitle>CUENTA</SectionTitle>

            <Item to="/dashboard" label="Inicio" icon="🏠" onClick={() => setOpen(false)} />

            <Item
              to="/dashboard/mi-perfil"
              label="Mi Perfil"
              icon="👤"
              onClick={() => setOpen(false)}
            />

            <Item
              to="/dashboard/carrito"
              label="Carrito"
              icon="🛒"
              onClick={() => setOpen(false)}
            />

            {role === "USER" ? (
              <Item
                to="/dashboard/compras"
                label="Compras"
                icon="🧾"
                onClick={() => setOpen(false)}
              />
            ) : null}

            {(role === "EMPLEADO" || role === "ADMIN") ? (
              <>
                <SectionTitle>OPERACIÓN</SectionTitle>

                {role === "EMPLEADO" ? (
                  <Item
                    to="/dashboard/celulares"
                    label="Celulares"
                    icon="📱"
                    onClick={() => setOpen(false)}
                  />
                ) : null}

                <Item
                  to="/dashboard/proveedores"
                  label="Proveedores"
                  icon="🏢"
                  onClick={() => setOpen(false)}
                />

                {role === "EMPLEADO" ? (
                  <Item
                    to="/dashboard/orden-compras"
                    label="Órdenes de compra"
                    icon="📦"
                    onClick={() => setOpen(false)}
                  />
                ) : null}
              </>
            ) : null}

            {role === "ADMIN" ? (
              <>
                <SectionTitle>ADMIN</SectionTitle>

                <Item
                  to="/dashboard/admin/usuarios"
                  label="Usuarios"
                  icon="🛡️"
                  onClick={() => setOpen(false)}
                />
                <Item
                  to="/dashboard/admin/roles"
                  label="Roles"
                  icon="🔐"
                  onClick={() => setOpen(false)}
                />

                <Item
                  to="/dashboard/admin/kardex"
                  label="Kardex"
                  onClick={() => setOpen(false)}
                />
              </>
            ) : null}

            <div className="pt-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="text-xs font-semibold text-white/50 tracking-wide">
                  ACCESO RÁPIDO
                </div>
                <p className="mt-2 text-sm text-white/65">
                  Puedes volver al catálogo público para ver los celulares como cliente.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/");
                  }}
                  className="mt-3 w-full h-10 rounded-xl border border-white/10 bg-white/[0.02] text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
                >
                  Ir a público
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-h-[60vh] min-w-0">
          {/* marco suave para que TODAS tus páginas se vean “premium” sin tocarlas */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
