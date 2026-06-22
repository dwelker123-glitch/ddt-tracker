import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { DdtInputRecord, LocationId, ScheduleRecord, Shift } from "../types";

const normalize = (value: unknown) => String(value ?? "").trim();

export function parseScheduleRows(rows: Record<string, unknown>[]): ScheduleRecord[] {
  return rows
    .map((row, index) => ({
      id: `schedule-${Date.now()}-${index}`,
      manager: normalize(row.Manager ?? row.manager),
      supervisor: normalize(row.Supervisor ?? row.supervisor),
      shift: normalize(row.Shift ?? row.shift),
      startTime: normalize(row["Start Time"] ?? row.startTime),
      endTime: normalize(row["End Time"] ?? row.endTime),
      area: normalize(row.Area ?? row.area),
      date: normalize(row.Date ?? row.date),
      location: (normalize(row.Location ?? row.location).toLowerCase().includes("devon")
        ? "devon-a"
        : "touhy") as LocationId,
    }))
    .filter((row) => row.manager || row.supervisor || row.date);
}

export async function readTabularFile(file: File): Promise<Record<string, unknown>[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) {
    const text = await file.text();
    const result = Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true });
    return result.data;
  }
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);
}

export function recordsToCsv(records: DdtInputRecord[]) {
  return Papa.unparse(
    records.map((record) => ({
      Location: record.location,
      Date: record.date,
      Shift: record.shift,
      Dock: record.dock,
      OPSX: record.opsx,
      Loader: record.loader,
      Driver: record.driver,
      Truck: record.truck,
      Flight1: record.flights[0]?.flight ?? "",
      Flight2: record.flights[1]?.flight ?? "",
      Flight3: record.flights[2]?.flight ?? "",
      ScheduledDDT: record.scheduledDdt,
      ActualDDT: record.actualDdt,
      ScheduledKAT: record.scheduledKat,
      ActualKAT: record.actualKat,
      DelayReason: record.delayReason,
      Notes: record.notes,
      OperationalComments: record.operationalComments,
    })),
  );
}

export function makeBlankRecord(location: LocationId): DdtInputRecord {
  return {
    id: `record-${Date.now()}`,
    location,
    date: new Date().toISOString().slice(0, 10),
    shift: "AM" as Shift,
    dock: "",
    opsx: "",
    loader: "",
    driver: "",
    truck: "",
    flights: [
      { flight: "", category: "" },
      { flight: "", category: "" },
      { flight: "", category: "" },
    ],
    scheduledDdt: "",
    actualDdt: "",
    scheduledKat: "",
    actualKat: "",
    delayReason: "",
    notes: "",
    operationalComments: "",
  };
}
