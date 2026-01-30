import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequireAuth from "../routes/RequireAuth";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderRequireAuth() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <div>Protected</div>
            </RequireAuth>
          }
        />
        <Route path="/auth/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Guardia de ruta RequireAuth", () => {
  it("redirige al login cuando no hay token", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderRequireAuth();
    expect(await screen.findByText(/login page/i)).toBeInTheDocument();
  });

  it("renderiza los hijos cuando hay token", async () => {
    mockUseAuth.mockReturnValue({
      user: { correo: "user@test.com", rol: "CLIENTE" },
      token: "token",
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderRequireAuth();
    expect(await screen.findByText(/protected/i)).toBeInTheDocument();
  });
});
