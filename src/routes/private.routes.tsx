import type { RouteObject } from "react-router-dom";
import DashboardHome from "../pages/private/DashboardHome";
import CelularesPage from "../pages/private/CelularesPage";
import OrdenComprasPage from "../pages/private/OrdenComprasPage";

import AdminUsuariosPage from "../pages/private/AdminUsuariosPage";
import AdminRolesPage from "../pages/private/AdminRolesPage";
import RequireRole from "./RequireRole";
import PerfilClientePage from "../pages/private/PerfilClientePage";

export const privateRoutes: RouteObject = {
  // ✅ IMPORTANTE: aquí NO va "/dashboard" porque ya está en appRoutes
  path: "",
  children: [
    // /dashboard
    { index: true, element: <DashboardHome /> },

    // /dashboard/celulares
    { path: "celulares", element: <CelularesPage /> },

    // /dashboard/orden-compras
    { path: "orden-compras", element: <OrdenComprasPage /> },

    // /dashboard/mi-perfil
    { path: "mi-perfil", element: <PerfilClientePage /> },

    // ✅ /dashboard/admin/usuarios (SOLO ADMIN)
    {
      path: "admin/usuarios",
      element: (
        <RequireRole allow={["ADMIN"]}>
          <AdminUsuariosPage />
        </RequireRole>
      ),
    },

    // ✅ /dashboard/admin/roles (SOLO ADMIN)
    {
      path: "admin/roles",
      element: (
        <RequireRole allow={["ADMIN"]}>
          <AdminRolesPage />
        </RequireRole>
      ),
    },
  ],
};
