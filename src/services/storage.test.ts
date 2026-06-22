import { makeBlankRecord } from "./importExport";
import {
  closeDay,
  getInputRecords,
  getRecords,
  getSnapshots,
  normalizeRecord,
  readStorage,
  resetLocalData,
  upsertRecord,
} from "./storage";

describe("storage safeguards and persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    resetLocalData();
  });

  it("persists driver and truck after add, edit, refresh-style read, and historical close", () => {
    const record = {
      ...makeBlankRecord("Touhy"),
      id: "persist-driver-truck",
      date: "2026-06-22",
      dock: "12",
      loader: "Loader A",
      scheduledDdt: "08:00",
      driver: "Driver A",
      truck: "Truck 42",
    };

    upsertRecord(record);
    expect(getRecords().find((item) => item.id === record.id)).toMatchObject({
      driver: "Driver A",
      truck: "Truck 42",
    });

    upsertRecord({ ...record, driver: "Driver B", truck: "Truck 88" });
    expect(getInputRecords().find((item) => item.id === record.id)).toMatchObject({
      driver: "Driver B",
      truck: "Truck 88",
    });

    closeDay("Touhy", "2026-06-22");
    expect(getSnapshots()[0].records.find((item) => item.id === record.id)).toMatchObject({
      driver: "Driver B",
      truck: "Truck 88",
    });
  });

  it("normalizes old Devon A/B location values to one Devon location", () => {
    expect(normalizeRecord({ ...makeBlankRecord("Touhy"), id: "old-a", location: "devon-a" as never })?.location).toBe(
      "Devon",
    );
    expect(
      normalizeRecord({ ...makeBlankRecord("Touhy"), id: "old-b", location: "devon-b" as never })?.trackerPage,
    ).toBe("Devon DDT Entry");
  });

  it("falls back safely when local storage JSON is malformed", () => {
    localStorage.setItem("broken-json", "{not-json");
    expect(readStorage("broken-json", { ok: true })).toEqual({ ok: true });

    localStorage.setItem("ddt.records.v1", "{not-json");
    expect(getInputRecords().length).toBeGreaterThan(0);
  });
});
