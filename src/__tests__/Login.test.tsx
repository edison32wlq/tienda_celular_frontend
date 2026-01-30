import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/public/Login";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/auth/login"]}>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Página de login", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    });
  });

  it("muestra los campos básicos del formulario", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(2);
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("envía credenciales y redirige al dashboard cuando es exitoso", async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: loginMock,
      register: jest.fn(),
      logout: jest.fn(),
    });

    const user = userEvent.setup();
    renderLogin();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "test@example.com");
    await user.type(inputs[1], "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(loginMock).toHaveBeenCalledWith({
      correo: "test@example.com",
      contrasena: "123456",
    });
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("muestra un error cuando el login falla", async () => {
    const loginMock = jest.fn().mockRejectedValue(new Error("bad credentials"));
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: loginMock,
      register: jest.fn(),
      logout: jest.fn(),
    });

    const user = userEvent.setup();
    renderLogin();

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "bad@example.com");
    await user.type(inputs[1], "wrong");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText(/credenciales/i)
    ).toBeInTheDocument();
  });
});
