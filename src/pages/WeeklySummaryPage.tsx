import { KpiStrip } from "../components/KpiStrip";
import { summarize } from "../services/calculations";
import { locationLabel } from "../data/locations";
import type { DdtRecord } from "../types";

export function WeeklySummaryPage({ records }: { records: DdtRecord[] }) {
  const summary = summarize(records);
  const byLocation = Object.entries(
    records.reduce<Record<string, DdtRecord[]>>((acc, record) => {
      acc[record.location] = [...(acc[record.location] ?? []), record];
      return acc;
    }, {}),
  );
  return (
    <div className="stack">
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
        <div className="panel-heading"><h2>Weekly Records</h2></div>
        <table className="data-table compact">
          <thead><tr><th>Date</th><th>Location</th><th>Departures</th><th>Compliance</th><th>Avg Variance</th></tr></thead>
          <tbody>
            {Object.entries(records.reduce<Record<string, DdtRecord[]>>((acc, record) => {
              const key = `${record.date}-${record.location}`;
              acc[key] = [...(acc[key] ?? []), record];
              return acc;
            }, {})).map(([key, items]) => {
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
    </div>
  );
}
