import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App navigation and layout", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.setItem("ddt.employeeAccess.v1", "granted");
  });

  it("shows one Devon DDT Entry navigation item with no Devon A/B references", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Devon DDT Entry" })).toBeInTheDocument();
    expect(screen.queryByText("Devon DDT Entry A")).not.toBeInTheDocument();
    expect(screen.queryByText("Devon DDT Entry B")).not.toBeInTheDocument();
  });

  it("places the new data entry tray above the departure board", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add" }));
    const tray = screen.getByLabelText("New data entry tray");
    const board = screen.getByRole("heading", { name: "Departure Board" }).closest("section");
    expect(tray.compareDocumentPosition(board as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
