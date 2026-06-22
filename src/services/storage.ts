import seedRecords from "../data/seedRecords.json";
import seedSchedules from "../data/seedSchedules.json";
import { trackerPageForLocation } from "../data/locations";
import { normalizeLocation } from "./importExport";
import type {
  DdtInputRecord,
  DdtRecord,
  Filters,
  HistoricalSnapshot,
  ScheduleRecord,
} from "../types";
import { summarize, withMetrics } from "./calculations";
import { debugLog } from "./debug";

const recordsKey = "ddt.records.v1";
const snapshotsKey = "ddt.snapshots.v1";
const schedulesKey = "ddt.schedules.v1";
const filtersKey = "ddt.filters.v1";
const themeKey = "ddt.theme.v1";

export const defaultFilters: Filters = {
  dateRange: "30d",
  location: "all",
  shift: "all",
  driver: "",
  loader: "",
  truck: "",
  manager: "",
  supervisor: "",
};

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    debugLog.warn("Failed to load saved data; using fallback.", { key });
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    debugLog.warn("Failed to save data.", { key, error: error instanceof Error ? error.name : "unknown" });
    throw error;
  }
}

export function normalizeRecord(record: Partial<DdtInputRecord> & { location?: unknown }): DdtInputRecord | null {
  if (!record.id || !record.date) {
    debugLog.warn("Rejected record missing required identity fields.");
    return null;
  }
  const location = normalizeLocation(record.location);
  const normalized: DdtInputRecord = {
    id: String(record.id),
    location,
    trackerPage: trackerPageForLocation(location),
    date: String(record.date),
    shift: record.shift ?? "AM",
    dock: String(record.dock ?? ""),
    opsx: String(record.opsx ?? ""),
    loader: String(record.loader ?? ""),
    driver: String(record.driver ?? ""),
    truck: String(record.truck ?? ""),
    flights: [
      record.flights?.[0] ?? { flight: "", category: "" },
      record.flights?.[1] ?? { flight: "", category: "" },
      record.flights?.[2] ?? { flight: "", category: "" },
    ],
    scheduledDdt: String(record.scheduledDdt ?? ""),
    actualDdt: String(record.actualDdt ?? ""),
    scheduledKat: String(record.scheduledKat ?? ""),
    actualKat: String(record.actualKat ?? ""),
    delayReason: String(record.delayReason ?? ""),
    notes: String(record.notes ?? ""),
    operationalComments: String(record.operationalComments ?? ""),
    manager: record.manager,
    supervisor: record.supervisor,
    closedAt: record.closedAt,
  };
  return normalized;
}

export function getInputRecords(): DdtInputRecord[] {
  const records = readStorage<unknown>(recordsKey, seedRecords);
  const source = Array.isArray(records) ? records : seedRecords;
  if (!Array.isArray(records)) debugLog.warn("Saved records were malformed; using seed data.");
  return source.flatMap((record) => {
    const normalized = normalizeRecord(record as Partial<DdtInputRecord>);
    return normalized ? [normalized] : [];
  });
}

export function saveInputRecords(records: DdtInputRecord[]) {
  write(recordsKey, records);
}

export function getRecords(): DdtRecord[] {
  return getInputRecords().map(withMetrics);
}

export function upsertRecord(record: DdtInputRecord) {
  const normalizedRecord = normalizeRecord(record);
  if (!normalizedRecord) throw new Error("Record is missing required fields.");
  debugLog.dev("Validated record for persistence.", { id: normalizedRecord.id, location: normalizedRecord.location });
  const records = getInputRecords();
  const next = records.some((item) => item.id === normalizedRecord.id)
    ? records.map((item) => (item.id === normalizedRecord.id ? normalizedRecord : item))
    : [normalizedRecord, ...records];
  saveInputRecords(next);
  return next.map(withMetrics);
}

export function getSnapshots(): HistoricalSnapshot[] {
  const snapshots = readStorage<unknown>(snapshotsKey, []);
  if (!Array.isArray(snapshots)) {
    debugLog.warn("Historical snapshot data was malformed; using empty history.");
    return [];
  }
  return snapshots.filter((snapshot): snapshot is HistoricalSnapshot => {
    const valid = Boolean(snapshot && typeof snapshot === "object" && "records" in snapshot);
    if (!valid) debugLog.warn("Rejected malformed historical snapshot.");
    return valid;
  });
}

export function closeDay(location: DdtInputRecord["location"], date: string) {
  const inputRecords = getInputRecords();
  const dayRecords = inputRecords
    .filter((record) => record.location === location && record.date === date)
    .map((record) => ({ ...record, closedAt: new Date().toISOString() }))
    .map(withMetrics);
  const snapshot: HistoricalSnapshot = {
    id: `${location}-${date}`,
    location,
    date,
    closedAt: new Date().toISOString(),
    records: dayRecords,
    summary: summarize(dayRecords),
  };
  const snapshots = getSnapshots().filter((item) => item.id !== snapshot.id);
  write(snapshotsKey, [snapshot, ...snapshots]);
  saveInputRecords(
    inputRecords.map((record) =>
      record.location === location && record.date === date
        ? { ...record, closedAt: snapshot.closedAt }
        : record,
    ),
  );
  return snapshot;
}

export function getSchedules(): ScheduleRecord[] {
  const schedules = readStorage<unknown>(schedulesKey, seedSchedules);
  if (!Array.isArray(schedules)) {
    debugLog.warn("Saved schedules were malformed; using seed schedules.");
    return seedSchedules.map((schedule) => ({
      ...(schedule as ScheduleRecord),
      location: normalizeLocation((schedule as ScheduleRecord).location),
    }));
  }
  return schedules.map((schedule) => ({
    ...(schedule as ScheduleRecord),
    location: normalizeLocation((schedule as ScheduleRecord).location),
  }));
}

export function saveSchedules(records: ScheduleRecord[]) {
  write(schedulesKey, records);
}

export function getFilters(): Filters {
  return readStorage<Filters>(filtersKey, defaultFilters);
}

export function saveFilters(filters: Filters) {
  write(filtersKey, filters);
}

export function getTheme(): "light" | "dark" {
  return readStorage<"light" | "dark">(themeKey, "light");
}

export function saveTheme(theme: "light" | "dark") {
  write(themeKey, theme);
}

export function resetLocalData() {
  localStorage.removeItem(recordsKey);
  localStorage.removeItem(snapshotsKey);
  localStorage.removeItem(schedulesKey);
  localStorage.removeItem(filtersKey);
}
