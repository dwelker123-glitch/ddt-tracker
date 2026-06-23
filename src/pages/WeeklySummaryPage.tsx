import { useMemo, useState } from "react";
import { KpiStrip } from "../components/KpiStrip";
import { summarize } from "../services/calculations";
import { locationLabel } from "../data/locations";
import { getSnapshots } from "../services/storage";
import type { DdtRecord } from "../types";

type SummaryMode = "weekly" | "daily";

function toDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function weekStartFor(dateString: string) {
  const date = toDate(dateString);
  const daysSinceSaturday = (date.getDay() + 1) % 7;
  date.setDate(date.getDate() - daysSinceSaturday);
  return formatDate(date);
}

function weekEndFor(weekStart: string) {
  const date = toDate(weekStart);
  date.setDate(date.getDate() + 6);
  return formatDate(date);
}

function uniqueRecords(records: DdtRecord[]) {
  return Array.from(
    records.reduce<Map<string, DdtRecord>>((acc, record) => {
      acc.set(`${record.location}-${record.date}-${record.id}`, record);
      return acc;
    }, new Map()).values(),
  );
}

function groupByLocation(records: DdtRecord[]) {
  return Object.entries(
    records.reduce<Record<string, DdtRecord[]>>((acc, record) => {
      acc[record.location] = [...(acc[record.location] ?? []), record];
      return acc;
    }, {}),
  );
}

function groupByDateAndLocation(records: DdtRecord[]) {
  return Object.entries(
    records.reduce<Record<string, DdtRecord[]>>((acc, record) => {
      const key = `${record.date}-${record.location}`;
      acc[key] = [...(acc[key] ?? []), record];
      return acc;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));
}

function flightList(record: DdtRecord) {
  return record.flights
    .map((flight) => flight.flight.trim())
    .filter(Boolean)
    .join(", ");
}

export function WeeklySummaryPage({ records }: { records: DdtRecord[] }) {
  const [mode, setMode] = useState<SummaryMode>("weekly");
  const allRecords = useMemo(
    () => uniqueRecords([...getSnapshots().flatMap((snapshot) => snapshot.records), ...records]),
    [records],
  );
  const dates = useMemo(
    () => Array.from(new Set(allRecords.map((record) => record.date))).sort((a, b) => b.localeCompare(a)),
    [allRecords],
  );
  const weekStarts = useMemo(
    () => Array.from(new Set(dates.map(weekStartFor))).sort((a, b) => b.localeCompare(a)),
    [dates],
  );
  const [selectedWeek, setSelectedWeek] = useState(() => weekStarts[0] ?? weekStartFor(formatDate(new Date())));
  const [selectedDay, setSelectedDay] = useState(() => dates[0] ?? formatDate(new Date()));
  const activeWeek = weekStarts.includes(selectedWeek) ? selectedWeek : weekStarts[0] ?? selectedWeek;
  const activeDay = dates.includes(selectedDay) ? selectedDay : dates[0] ?? selectedDay;
  const filteredRecords = allRecords.filter((record) => {
    if (mode === "daily") return record.date === activeDay;
    const start = activeWeek;
    const end = weekEndFor(start);
    return record.date >= start && record.date <= end;
  });
  const summary = summarize(filteredRecords);
  const byLocation = groupByLocation(filteredRecords);
  const rows = groupByDateAndLocation(filteredRecords);
  const rangeLabel = mode === "weekly" ? `${activeWeek} to ${weekEndFor(activeWeek)}` : activeDay;

  return (
    <div className="stack">
      <section className="panel summary-controls">
        <div className="summary-toggle" role="group" aria-label="Summary range">
          <button
            type="button"
            className={mode === "weekly" ? "active" : ""}
            onClick={() => setMode("weekly")}
          >
            Weekly
          </button>
          <button type="button" className={mode === "daily" ? "active" : ""} onClick={() => setMode("daily")}>
            Daily
          </button>
        </div>
        {mode === "weekly" ? (
          <label>
            Week
            <select value={activeWeek} onChange={(event) => setSelectedWeek(event.target.value)}>
              {weekStarts.map((weekStart) => (
                <option key={weekStart} value={weekStart}>
                  Week of {weekStart}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label>
            Day
            <input type="date" value={activeDay} onChange={(event) => setSelectedDay(event.target.value)} />
          </label>
        )}
        <div className="summary-range">
          <span>{mode === "weekly" ? "Selected week" : "Selected day"}</span>
          <strong>{rangeLabel}</strong>
        </div>
      </section>
      <KpiStrip summary={summary} />
      <section className="panel">
        <div className="panel-heading"><h2>Location Performance</h2></div>
        <div className="summary-grid">
          {byLocation.map(([location, items]) => {
            const itemSummary = summarize(items);
            return (
              <article className="summary-card" key={location}>
                <span>{locationLabel(location as DdtRecord["location"])}</span>
                <strong>{itemSummary.compliance}%</strong>
                <p>{itemSummary.onTimeDepartures} on-time · {itemSummary.lateDepartures} late</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><h2>{mode === "weekly" ? "Weekly Records" : "Daily Records"}</h2></div>
        <table className="data-table compact">
          <thead><tr><th>Date</th><th>Location</th><th>Departures</th><th>Compliance</th><th>Avg Variance</th></tr></thead>
          <tbody>
            {rows.map(([key, items]) => {
              const itemSummary = summarize(items);
              return (
                <tr key={key}>
                  <td>{items[0].date}</td>
                  <td>{locationLabel(items[0].location)}</td>
                  <td>{itemSummary.totalDepartures}</td>
                  <td>{itemSummary.compliance}%</td>
                  <td>{itemSummary.averageVariance}m</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      {mode === "daily" && (
        <section className="panel">
          <div className="panel-heading">
            <h2>Daily Flight Details</h2>
            <span>{filteredRecords.length} records</span>
          </div>
          <table className="data-table compact">
            <thead>
              <tr>
                <th>Location</th>
                <th>Dock</th>
                <th>Flights</th>
                <th>Scheduled DDT</th>
                <th>Seal Time</th>
                <th>Actual DDT</th>
                <th>Variance</th>
                <th>Status</th>
                <th>Driver</th>
                <th>Truck</th>
                <th>Delay Reason</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords
                .slice()
                .sort((a, b) => {
                  const timeSort = a.scheduledDdt.localeCompare(b.scheduledDdt);
                  if (timeSort) return timeSort;
                  return locationLabel(a.location).localeCompare(locationLabel(b.location));
                })
                .map((record) => (
                  <tr key={`${record.location}-${record.date}-${record.id}`}>
                    <td>{locationLabel(record.location)}</td>
                    <td>{record.dock || "N/A"}</td>
                    <td>{flightList(record) || "N/A"}</td>
                    <td>{record.scheduledDdt || "N/A"}</td>
                    <td>{record.sealTime || "N/A"}</td>
                    <td>{record.actualDdt || "N/A"}</td>
                    <td>
                      <span className={record.metrics.late ? "variance-pill late" : "variance-pill"}>
                        {record.metrics.ddtVarianceLabel}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${record.metrics.status.toLowerCase().replace("-", "")}`}>
                        {record.metrics.status}
                      </span>
                    </td>
                    <td>{record.driver || "N/A"}</td>
                    <td>{record.truck || "N/A"}</td>
                    <td>{record.delayReason || "None"}</td>
                    <td>{record.notes || "No notes"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
