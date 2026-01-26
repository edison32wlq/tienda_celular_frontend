import React, { type JSX } from "react";

export default function PrivatePlaceholder({ title }: { title: string }): JSX.Element {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-white/70">
        Placeholder. El CRUD de este módulo se implementa después.
      </p>
    </div>
  );
}
