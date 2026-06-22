import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordGate } from "./PasswordGate";

describe("PasswordGate", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("requires the exact SkyChefs2026 password", async () => {
    const user = userEvent.setup();
    render(<PasswordGate><div>Tracker Open</div></PasswordGate>);

    await user.type(screen.getByLabelText("Password"), "SkyChefs2026 ");
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(screen.queryByText("Tracker Open")).not.toBeInTheDocument();
    expect(screen.getByText("Incorrect employee password.")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "SkyChefs2026");
    await user.click(screen.getByRole("button", { name: "Enter" }));
    expect(screen.getByText("Tracker Open")).toBeInTheDocument();
  });

  it("toggles password visibility with accessible labels", async () => {
    const user = userEvent.setup();
    render(<PasswordGate><div>Tracker Open</div></PasswordGate>);

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });
});
