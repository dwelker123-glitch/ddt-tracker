import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { readTabularFile, parseScheduleRows } from "../services/importExport";
import { getSchedules, saveSchedules } from "../services/storage";
import type { DdtRecord, ScheduleRecord } from "../types";

export function ScheduleUploadPage({ records }: { records: DdtRecord[] }) {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>(getSchedules());
  const correlated = useMemo(
    () =>
      schedules.map((schedule) => {
        const covered = records.filter(
          (record) => record.date === schedule.date && record.location === schedule.location,
        );
        const late = covered.filter((record) => record.metrics.late).length;
        return { ...schedule, departures: covered.length, late };
      }),
    [records, schedules],
  );

  const upload = async (file?: File) => {
    if (!file) return;
    const rows = await readTabularFile(file);
    const parsed = parseScheduleRows(rows);
    const next = [...parsed, ...schedules];
    saveSchedules(next);
    setSchedules(next);
  };

  return (
    <div className="stack">
      <section className="panel upload-panel">
        <div>
          <h2>Management Schedule Upload</h2>
          <p>Excel and CSV uploads are parsed into schedule history for manager and supervisor correlation.</p>
        </div>
        <label className="file-button">
          <Upload size={16} />
          Upload Excel or CSV
          <input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => upload(event.target.files?.[0])} />
        </label>
      </section>
      <section className="panel">
        <div className="panel-heading"><h2>Coverage Correlation</h2></div>
        <table className="data-table compact">
          <thead>
            <tr><th>Date</th><th>Location</th><th>Manager</th><th>Supervisor</th><th>Shift</th><th>Area</th><th>Departures</th><th>Late</th></tr>
          </thead>
          <tbody>
            {correlated.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td><td>{row.location}</td><td>{row.manager}</td><td>{row.supervisor}</td>
                <td>{row.shift}</td><td>{row.area}</td><td>{row.departures}</td><td>{row.late}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
