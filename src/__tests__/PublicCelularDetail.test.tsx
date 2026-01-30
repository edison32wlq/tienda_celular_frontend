import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PublicCelularDetail from "../pages/public/PublicCelularDetail";
import { getCelularById } from "../services/celulares.service";

jest.mock("../services/celulares.service", () => ({
  getCelularById: jest.fn(),
}));

const getCelularByIdMock = getCelularById as jest.MockedFunction<typeof getCelularById>;

const mockCelular = {
  id_celular: "1",
  codigo: "SAM-777",
  marca: "Samsung",
  modelo: "Galaxy Z",
  color: "Azul",
  almacenamiento: "512GB",
  ram: "12GB",
  precio_venta: 1200,
  costo_compra: 1000,
  stock_actual: 3,
  estado: "DISPONIBLE",
  descripcion: "Edicion especial",
  imagen_url: "",
  imagen: "",
  precio: () => null,
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={["/celulares/1"]}>
      <Routes>
        <Route path="/celulares/:id" element={<PublicCelularDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Pagina PublicCelularDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCelularByIdMock.mockResolvedValue(mockCelular);
  });

  it("muestra el detalle del celular despues de cargar", async () => {
    renderDetail();

    expect(await screen.findByText(/galaxy z/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /agregar al carrito/i })
    ).toBeInTheDocument();
  });

  it("muestra un error cuando falla la API", async () => {
    getCelularByIdMock.mockRejectedValueOnce(new Error("fail"));
    renderDetail();

    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument();
  });

  it("dispara la alerta al agregar al carrito", async () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();

    renderDetail();

    await user.click(await screen.findByRole("button", { name: /agregar al carrito/i }));
    expect(alertMock).toHaveBeenCalled();

    alertMock.mockRestore();
  });
});
