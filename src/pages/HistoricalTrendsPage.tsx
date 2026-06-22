import { ComplianceChart, DelayChart } from "../components/Charts";
import { KpiStrip } from "../components/KpiStrip";
import { complianceByDate, delayReasons, summarize } from "../services/calculations";
import { getSnapshots } from "../services/storage";
import type { DdtRecord } from "../types";

export function HistoricalTrendsPage({ records }: { records: DdtRecord[] }) {
  const snapshots = getSnapshots();
  const summary = summarize(records);
  return (
    <div className="stack">
      <KpiStrip summary={summary} />
      <section className="analytics-grid">
        <div className="panel">
          <div className="panel-heading"><h2>DDT Compliance</h2></div>
          <ComplianceChart data={complianceByDate(records)} />
        </div>
        <div className="panel">
          <div className="panel-heading"><h2>Top Delay Reasons</h2></div>
          <DelayChart data={delayReasons(records)} />
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><h2>Historical Snapshots</h2></div>
        <table className="data-table compact">
          <thead><tr><th>Date</th><th>Location</th><th>Closed At</th><th>Compliance</th><th>Records</th></tr></thead>
          <tbody>
            {snapshots.map((snapshot) => (
              <tr key={snapshot.id}>
                <td>{snapshot.date}</td>
                <td>{snapshot.location}</td>
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
