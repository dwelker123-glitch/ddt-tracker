import seedRecords from "../data/seedRecords.json";
import seedSchedules from "../data/seedSchedules.json";
import type {
  DdtInputRecord,
  DdtRecord,
  Filters,
  HistoricalSnapshot,
  ScheduleRecord,
} from "../types";
import { summarize, withMetrics } from "./calculations";

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

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getInputRecords(): DdtInputRecord[] {
  const records = read<unknown>(recordsKey, seedRecords);
  return Array.isArray(records) ? (records as DdtInputRecord[]) : (seedRecords as DdtInputRecord[]);
}

export function saveInputRecords(records: DdtInputRecord[]) {
  write(recordsKey, records);
}

export function getRecords(): DdtRecord[] {
  return getInputRecords().map(withMetrics);
}

export function upsertRecord(record: DdtInputRecord) {
  const normalizedRecord: DdtInputRecord = {
    ...record,
    flights: [
      record.flights?.[0] ?? { flight: "", category: "" },
      record.flights?.[1] ?? { flight: "", category: "" },
      record.flights?.[2] ?? { flight: "", category: "" },
    ],
  };
  const records = getInputRecords();
  const next = records.some((item) => item.id === normalizedRecord.id)
    ? records.map((item) => (item.id === normalizedRecord.id ? normalizedRecord : item))
    : [normalizedRecord, ...records];
  saveInputRecords(next);
  return next.map(withMetrics);
}

export function getSnapshots(): HistoricalSnapshot[] {
  const snapshots = read<unknown>(snapshotsKey, []);
  return Array.isArray(snapshots) ? (snapshots as HistoricalSnapshot[]) : [];
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
  const schedules = read<unknown>(schedulesKey, seedSchedules);
  return Array.isArray(schedules) ? (schedules as ScheduleRecord[]) : (seedSchedules as ScheduleRecord[]);
}

export function saveSchedules(records: ScheduleRecord[]) {
  write(schedulesKey, records);
}

export function getFilters(): Filters {
  return read<Filters>(filtersKey, defaultFilters);
}

export function saveFilters(filters: Filters) {
  write(filtersKey, filters);
}

export function getTheme(): "light" | "dark" {
  return read<"light" | "dark">(themeKey, "light");
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
