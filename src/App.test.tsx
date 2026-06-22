import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App navigation and layout", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.setItem("ddt.employeeAccess.v1", "granted");
    document.documentElement.removeAttribute("data-theme");
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

  it("keeps OPSX out of the user interface", () => {
    render(<App />);
    expect(screen.queryByText(/OPSX/i)).not.toBeInTheDocument();
  });

  it("supports dark and light mode from the header toggle", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(document.documentElement.dataset.theme).toBe("light");
    await user.click(screen.getByRole("button", { name: "Toggle dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    await user.click(screen.getByRole("button", { name: "Toggle dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("searches active flights from the header and navigates to the record", async () => {
    const user = userEvent.setup();
    const records = [
      {
        id: "devon-active-search",
        location: "Devon",
        trackerPage: "Devon DDT Entry",
        date: "2026-06-22",
        shift: "AM",
        dock: "D7",
        loader: "Loader D",
        driver: "Driver Search",
        truck: "Truck Search",
        flights: [
          { flight: "SC 456", category: "" },
          { flight: "", category: "" },
          { flight: "", category: "" },
        ],
        scheduledDdt: "08:10",
        actualDdt: "08:20",
        scheduledKat: "",
        actualKat: "",
        delayReason: "Gate hold",
        notes: "Search navigation test",
        operationalComments: "",
      },
    ];
    localStorage.setItem("ddt.records.v1", JSON.stringify(records));

    render(<App />);
    await user.type(screen.getByLabelText("Flight Search"), "SC 456");
    expect(await screen.findByText("SC 456")).toBeInTheDocument();
    await user.click(screen.getByText("SC 456"));

    expect(screen.getByRole("heading", { name: "Devon DDT Entry" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Driver Search")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Truck Search")).toBeInTheDocument();
  });

  it("searches historical flight records by flight and date", async () => {
    const user = userEvent.setup();
    const historicalRecord = {
      id: "history-search",
      location: "Touhy",
      trackerPage: "Touhy DDT Entry",
      date: "2026-06-20",
      shift: "AM",
      dock: "T12",
      loader: "Loader H",
      driver: "Driver History",
      truck: "Truck History",
      flights: [
        { flight: "HX 789", category: "" },
        { flight: "", category: "" },
        { flight: "", category: "" },
      ],
      scheduledDdt: "09:00",
      actualDdt: "09:18",
      scheduledKat: "",
      actualKat: "",
      delayReason: "Late inbound",
      notes: "Historical lookup test",
      operationalComments: "",
    };
    localStorage.setItem(
      "ddt.snapshots.v1",
      JSON.stringify([
        {
          id: "Touhy-2026-06-20",
          location: "Touhy",
          date: "2026-06-20",
          closedAt: "2026-06-20T16:00:00.000Z",
          records: [historicalRecord],
          summary: {},
        },
      ]),
    );

    render(<App />);
    await user.type(screen.getByLabelText("Flight Search"), "HX 789 2026-06-20");

    expect(await screen.findByText("HX 789")).toBeInTheDocument();
    expect(screen.getByText(/2026-06-20 · Touhy · Dock T12/)).toBeInTheDocument();
    expect(screen.getByText(/09:00 \/ 09:18/)).toBeInTheDocument();
    expect(screen.getByText(/Late inbound/)).toBeInTheDocument();
    expect(screen.getByText(/Historical lookup test/)).toBeInTheDocument();
  });
});
