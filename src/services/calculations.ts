import type { CalculatedMetrics, DdtInputRecord, DdtRecord, SummaryMetrics } from "../types";

const trendLocations = ["Touhy", "Devon"] as const;

const minutesInDay = 24 * 60;

export function parseTimeToMinutes(value: string): number | null {
  if (!value) return null;
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{1,2}):?(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) return null;
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (hours > 23) return null;
  return hours * 60 + minutes;
}

export function formatVariance(minutes: number | null): string {
  if (minutes === null) return "Calculated";
  if (minutes === 0) return "0m";
  const sign = minutes > 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return `${sign}${hours ? `${hours}h ` : ""}${mins}m`;
}

export function varianceMinutes(scheduled: string, actual: string): number | null {
  const scheduledMinutes = parseTimeToMinutes(scheduled);
  const actualMinutes = parseTimeToMinutes(actual);
  if (scheduledMinutes === null || actualMinutes === null) return null;
  let diff = actualMinutes - scheduledMinutes;
  if (diff < -12 * 60) diff += minutesInDay;
  if (diff > 12 * 60) diff -= minutesInDay;
  return diff;
}

export function calculateRecord(record: DdtInputRecord): CalculatedMetrics {
  const ddtVarianceMinutes = varianceMinutes(record.scheduledDdt, record.actualDdt);
  const status =
    ddtVarianceMinutes === null ? "Incomplete" : ddtVarianceMinutes <= 0 ? "On-time" : "Late";
  return {
    ddtVarianceMinutes,
    ddtVarianceLabel: formatVariance(ddtVarianceMinutes),
    status,
    late: status === "Late",
    onTime: status === "On-time",
  };
}

export function withMetrics(record: DdtInputRecord): DdtRecord {
  return { ...record, metrics: calculateRecord(record) };
}

export function summarize(records: DdtRecord[]): SummaryMetrics {
  const completed = records.filter((record) => record.metrics.status !== "Incomplete");
  const onTime = completed.filter((record) => record.metrics.onTime);
  const late = completed.filter((record) => record.metrics.late);
  const variances = completed
    .map((record) => record.metrics.ddtVarianceMinutes)
    .filter((value): value is number => value !== null);
  const averageVariance = variances.length
    ? Math.round(variances.reduce((sum, value) => sum + value, 0) / variances.length)
    : 0;
  return {
    totalDepartures: records.length,
    completedDepartures: completed.length,
    onTimeDepartures: onTime.length,
    lateDepartures: late.length,
    compliance: completed.length ? Math.round((onTime.length / completed.length) * 1000) / 10 : 0,
    averageVariance,
  };
}

export function complianceByDate(records: DdtRecord[]) {
  const grouped = records.reduce<Record<string, DdtRecord[]>>((acc, record) => {
    acc[record.date] = [...(acc[record.date] ?? []), record];
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      compliance: summarize(items).compliance,
      averageVariance: summarize(items).averageVariance,
      lateDepartures: summarize(items).lateDepartures,
    }));
}

export function complianceByDateAndLocation(records: DdtRecord[]) {
  const grouped = records.reduce<Record<string, Record<(typeof trendLocations)[number], DdtRecord[]>>>(
    (acc, record) => {
      acc[record.date] = acc[record.date] ?? { Touhy: [], Devon: [] };
      acc[record.date][record.location] = [...acc[record.date][record.location], record];
      return acc;
    },
    {},
  );
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, byLocation]) => ({
      date,
      Touhy: byLocation.Touhy.length ? summarize(byLocation.Touhy).compliance : null,
      Devon: byLocation.Devon.length ? summarize(byLocation.Devon).compliance : null,
    }));
}

export function delayReasons(records: DdtRecord[]) {
  const counts = records.reduce<Record<string, number>>((acc, record) => {
    const reason = record.delayReason || (record.metrics.late ? "Unassigned" : "");
    if (!reason) return acc;
    acc[reason] = (acc[reason] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}
