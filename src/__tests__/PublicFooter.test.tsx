import { render, screen } from "@testing-library/react";
import PublicFooter from "../components/public/PublicFooter";

describe("Componente PublicFooter", () => {
  it("muestra el contenido del footer", () => {
    render(<PublicFooter />);

    expect(screen.getByText(/copyright/i)).toBeInTheDocument();
  });

  it("incluye el año 2026", () => {
    render(<PublicFooter />);

    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("usa el rol contentinfo", () => {
    render(<PublicFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
