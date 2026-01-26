import type { RouteObject } from "react-router-dom";
import { publicRoutes } from "./public.routes";
import { privateRoutes } from "./private.routes";
import RequireAuth from "./RequireAuth";
import PrivateLayoutTW from "../layouts/PrivateLayoutTW";

export const appRoutes: RouteObject[] = [
  publicRoutes,
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <PrivateLayoutTW />
      </RequireAuth>
    ),
    children: privateRoutes.children,
  },
];
