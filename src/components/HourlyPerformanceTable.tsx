import { hourlyPerformance } from "../services/calculations";
import type { DdtRecord } from "../types";

type Props = {
  records: DdtRecord[];
  title?: string;
};

function varianceClass(averageVariance: number, completedDepartures: number) {
  if (!completedDepartures) return "variance-pill incomplete";
  return averageVariance > 0 ? "variance-pill late" : "variance-pill";
}

function complianceClass(compliance: number, completedDepartures: number) {
  if (!completedDepartures) return "status-pill incomplete";
  return compliance >= 90 ? "status-pill ontime" : "status-pill late";
}

export function HourlyPerformanceTable({ records, title = "Performance by Hour" }: Props) {
  const rows = hourlyPerformance(records);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>Grouped by scheduled DDT hour.</p>
        </div>
      </div>
      {rows.length ? (
        <div className="table-frame">
          <table className="data-table compact hourly-table">
            <thead>
              <tr>
                <th>Hour</th>
                <th>Departures</th>
                <th>Completed</th>
                <th>On-time</th>
                <th>Late</th>
                <th>Compliance</th>
                <th>Avg Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.hour}>
                  <td>{row.label}</td>
                  <td>{row.totalDepartures}</td>
                  <td>{row.completedDepartures}</td>
                  <td>{row.onTimeDepartures}</td>
                  <td>{row.lateDepartures}</td>
                  <td>
                    <span className={complianceClass(row.compliance, row.completedDepartures)}>
                      {row.completedDepartures ? `${row.compliance}%` : "Incomplete"}
                    </span>
                  </td>
                  <td>
                    <span className={varianceClass(row.averageVariance, row.completedDepartures)}>
                      {row.completedDepartures ? `${row.averageVariance}m` : "Calculated"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">No scheduled DDT times available for hourly review.</p>
      )}
    </section>
  );
}
