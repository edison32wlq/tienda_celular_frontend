import React, { useEffect, type JSX } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean; // para botón rojo si quieres
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  onCancel,
  onConfirm,
}: Props): JSX.Element | null {
  // cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
        aria-label="Cerrar"
      />

      {/* modal */}
      <div className="relative w-[92%] max-w-md rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-2 text-sm text-white/70">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-xl border border-white/10 px-4 hover:bg-white/5"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={[
              "h-10 rounded-xl px-4 font-semibold transition",
              danger
                ? "bg-red-600 hover:bg-red-500"
                : "bg-emerald-600 hover:bg-emerald-500",
            ].join(" ")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
