import { ComplianceChart, DelayChart } from "../components/Charts";
import { HourlyPerformanceTable } from "../components/HourlyPerformanceTable";
import { KpiStrip } from "../components/KpiStrip";
import { complianceByDateAndLocation, delayReasons, summarize, uniqueRecords } from "../services/calculations";
import { locationLabel } from "../data/locations";
import { getSnapshots } from "../services/storage";
import type { DdtRecord } from "../types";

export function DashboardPage({ records }: { records: DdtRecord[] }) {
  const snapshots = getSnapshots();
  const dashboardRecords = uniqueRecords([...snapshots.flatMap((snapshot) => snapshot.records), ...records]);
  const summary = summarize(dashboardRecords);
  return (
    <div className="stack">
      <KpiStrip summary={summary} />
      <section className="analytics-grid">
        <div className="panel">
          <div className="panel-heading"><h2>DDT Compliance Trend</h2></div>
          <ComplianceChart data={complianceByDateAndLocation(dashboardRecords)} />
        </div>
        <div className="panel">
          <div className="panel-heading"><h2>Top Delay Reasons</h2></div>
          <DelayChart data={delayReasons(dashboardRecords)} />
        </div>
      </section>
      <HourlyPerformanceTable records={dashboardRecords} title="Historical Performance by Hour" />
      <section className="panel">
        <div className="panel-heading"><h2>Historical Snapshots</h2></div>
        <table className="data-table compact">
          <thead><tr><th>Date</th><th>Location</th><th>Closed At</th><th>Compliance</th><th>Records</th></tr></thead>
          <tbody>
            {snapshots.map((snapshot) => (
              <tr key={snapshot.id}>
                <td>{snapshot.date}</td>
                <td>{locationLabel(snapshot.location)}</td>
                <td>{new Date(snapshot.closedAt).toLocaleString()}</td>
                <td>{snapshot.summary.compliance}%</td>
                <td>{snapshot.records.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
