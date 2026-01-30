import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PublicHeader from "../components/public/PublicHeader";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <PublicHeader />
              <div>Home</div>
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Componente PublicHeader", () => {
  it("muestra login/register cuando el usuario no está autenticado", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderHeader();

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  it("muestra dashboard y logout cuando el usuario tiene token", () => {
    mockUseAuth.mockReturnValue({
      user: { correo: "admin@test.com", rol: "ADMIN" },
      token: "token",
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });

    renderHeader();

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it("ejecuta logout y navega al home al hacer clic", async () => {
    const logoutMock = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { correo: "admin@test.com", rol: "ADMIN" },
      token: "token",
      login: jest.fn(),
      register: jest.fn(),
      logout: logoutMock,
    });

    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByText(/logout/i));
    expect(logoutMock).toHaveBeenCalled();
  });
});
