import { type JSX, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Card({
  title,
  desc,
  icon,
  onClick,
}: {
  title: string;
  desc: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition
                 focus:outline-none focus:ring-4 focus:ring-white/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-lg">
          {icon}
        </div>
        <span className="text-xs text-white/45 group-hover:text-white/60 transition">
          Abrir →
        </span>
      </div>

      <div className="mt-4">
        <div className="text-lg font-semibold tracking-tight text-white/90">{title}</div>
        <p className="mt-1 text-sm text-white/60 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}

export default function DashboardHome(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = useMemo(() => String((user as any)?.rol || "").toUpperCase(), [user]);
  const correo = (user as any)?.correo || (user as any)?.email || "—";

  // ✅ Accesos según rol (no cambia tu lógica de rutas, solo UI)
  const quick = useMemo(() => {
    const items: Array<{
      title: string;
      desc: string;
      icon: string;
      path: string;
      show: boolean;
    }> = [
      {
        title: "Mi Perfil",
        desc: "Completa tu información para poder comprar.",
        icon: "👤",
        path: "/dashboard/mi-perfil",
        show: true,
      },
      {
        title: "Carrito",
        desc: "Agrega productos y revisa tu total.",
        icon: "🛒",
        path: "/dashboard/carrito",
        show: true,
      },
      {
        title: "Compras",
        desc: "Genera tu factura y revisa tu historial.",
        icon: "🧾",
        path: "/dashboard/compras",
        show: role === "USER",
      },
      {
        title: "Celulares",
        desc: "Administra el catálogo (solo empleado).",
        icon: "📱",
        path: "/dashboard/celulares",
        show: role === "EMPLEADO",
      },
      {
        title: "Órdenes de compra",
        desc: "Registra compras a proveedores (empleado).",
        icon: "📦",
        path: "/dashboard/orden-compras",
        show: role === "EMPLEADO",
      },
      {
        title: "Proveedores",
        desc: "Gestión de proveedores (admin/empleado).",
        icon: "🏢",
        path: "/dashboard/proveedores",
        show: role === "ADMIN" || role === "EMPLEADO",
      },
      {
        title: "Usuarios",
        desc: "Administración de usuarios (admin).",
        icon: "🛡️",
        path: "/dashboard/admin/usuarios",
        show: role === "ADMIN",
      },
      {
        title: "Roles",
        desc: "Gestión de roles (admin).",
        icon: "🔐",
        path: "/dashboard/admin/roles",
        show: role === "ADMIN",
      },
    ];

    return items.filter((x) => x.show);
  }, [role]);

  return (
    <div className="space-y-6">
      {/* Hero / Welcome */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white/95">
              Dashboard DYE
            </h1>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              Bienvenido: <span className="text-white/80 font-semibold">{correo}</span>{" "}
              <span className="mx-2 text-white/30">•</span>
              Rol:{" "}
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/75">
                {role || "—"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="h-11 rounded-xl border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white/80 hover:bg-white/[0.06] transition"
            >
              Ir a público
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/carrito")}
              className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-black hover:bg-white/90 transition"
            >
              Ir al carrito
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-xs font-semibold text-white/50 tracking-wide">TIP</div>
            <div className="mt-2 text-sm text-white/70">
              Si eres <b className="text-white/85">USER</b>, completa tu perfil para poder comprar.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-xs font-semibold text-white/50 tracking-wide">RÁPIDO</div>
            <div className="mt-2 text-sm text-white/70">
              Ve a <b className="text-white/85">Carrito</b> para agregar productos y luego{" "}
              <b className="text-white/85">Compras</b> para generar factura.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="text-xs font-semibold text-white/50 tracking-wide">ACCESO</div>
            <div className="mt-2 text-sm text-white/70">
              Tus opciones cambian según tu <b className="text-white/85">rol</b>.
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white/90">
              Accesos rápidos
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Abre las secciones principales sin buscar en el menú.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quick.map((q) => (
            <Card
              key={q.path}
              title={q.title}
              desc={q.desc}
              icon={q.icon}
              onClick={() => navigate(q.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
