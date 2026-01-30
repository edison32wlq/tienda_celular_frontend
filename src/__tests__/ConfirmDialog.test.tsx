import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "../components/common/ConfirmDialog";

describe("Componente ConfirmDialog", () => {
  it("no se renderiza cuando está cerrado", () => {
    render(
      <ConfirmDialog
        open={false}
        title="Borrar"
        description="Seguro?"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.queryByText("Borrar")).not.toBeInTheDocument();
  });

  it("muestra el título y la descripción cuando está abierto", () => {
    render(
      <ConfirmDialog
        open
        title="Confirmar acción"
        description="Esta acción es irreversible."
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByText(/confirmar acción/i)).toBeInTheDocument();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
  });

  it("llama a onCancel al presionar Escape", () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDialog
        open
        title="Salir"
        description="¿Cerrar?"
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalled();
  });
});
