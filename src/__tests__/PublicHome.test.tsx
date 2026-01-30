import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PublicHome from "../pages/public/PublicHome";
import { getCelulares } from "../services/celulares.service";

jest.mock("../services/celulares.service", () => ({
  getCelulares: jest.fn(),
}));

const getCelularesMock = getCelulares as jest.MockedFunction<typeof getCelulares>;

const mockItems = [
  {
    id_celular: "1",
    codigo: "IPH-001",
    marca: "Apple",
    modelo: "iPhone 17",
    color: "Negro",
    almacenamiento: "256GB",
    ram: "8GB",
    precio_venta: 999,
    costo_compra: 800,
    stock_actual: 5,
    estado: "DISPONIBLE",
    descripcion: "Nuevo modelo",
    imagen_url: "",
    imagen: "",
    precio: () => null,
  },
];

function renderHome() {
  return render(
    <MemoryRouter>
      <PublicHome />
    </MemoryRouter>
  );
}

describe("Página PublicHome", () => {
  beforeEach(() => {
    getCelularesMock.mockResolvedValue({
      data: null,
      items: mockItems,
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalPages: 2,
        currentPage: 1,
      },
    });
  });

  it("muestra los celulares obtenidos", async () => {
    renderHome();

    expect(await screen.findByText(/iphone 17/i)).toBeInTheDocument();
    expect(screen.getAllByText(/página/i).length).toBeGreaterThan(0);
  });

  it("muestra un error cuando falla la API", async () => {
    getCelularesMock.mockRejectedValue(new Error("boom"));
    renderHome();

    expect(await screen.findByText(/no se pudieron/i)).toBeInTheDocument();
  });

  it("cambia el botón de orden de ASC a DESC", async () => {
    const user = userEvent.setup();
    renderHome();

    const orderButton = await screen.findByRole("button", { name: "ASC" });
    await user.click(orderButton);

    expect(orderButton).toHaveTextContent("DESC");
  });
});
