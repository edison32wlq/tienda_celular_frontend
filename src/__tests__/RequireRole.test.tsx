import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequireRole from "../routes/RequireRole";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderRequireRole() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/usuarios"]}>
      <Routes>
        <Route
          path="/dashboard/admin/usuarios"
          element={
            <RequireRole allow={["ADMIN"]}>
              <div>Admin Area</div>
            </RequireRole>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Guardia de ruta RequireRole", () => {
  it("renderiza los hijos para roles permitidos", async () => {
    mockUseAuth.mockReturnValue({
      user: { correo: "admin@test.com", rol: "ADMIN" },
      token: "token",
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderRequireRole();
    expect(await screen.findByText(/admin area/i)).toBeInTheDocument();
  });

  it("redirige al dashboard cuando el rol no está permitido", async () => {
    mockUseAuth.mockReturnValue({
      user: { correo: "client@test.com", rol: "CLIENTE" },
      token: "token",
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderRequireRole();
    expect(await screen.findByText(/dashboard/i)).toBeInTheDocument();
  });
});
