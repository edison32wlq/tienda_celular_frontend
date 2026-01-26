import React, { type JSX } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateLayout(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-extrabold">Dashboard</div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              {user?.correo} {user?.rol ? `(${user.rol})` : ""}
            </span>
            <button
              onClick={onLogout}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
