import React, { type JSX } from "react";

export default function DashboardHome(): JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <p className="mt-2 text-white/70">
        Este dashboard está vacío. En la siguiente página agregamos menú y CRUD.
      </p>
    </div>
  );
}
