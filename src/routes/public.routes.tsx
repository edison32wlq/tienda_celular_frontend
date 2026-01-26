import React from "react";
import type { RouteObject } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import PublicHome from "../pages/public/PublicHome";
import PublicCelularDetail from "../pages/public/PublicCelularDetail";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

export const publicRoutes: RouteObject = {
  path: "/",
  element: <PublicLayout />,
  children: [
    { index: true, element: <PublicHome /> },
    { path: "celulares/:id", element: <PublicCelularDetail /> },
    { path: "auth/login", element: <Login /> },
    { path: "auth/register", element: <Register /> },
  ],
};
