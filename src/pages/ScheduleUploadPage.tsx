import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { readTabularFile, parseScheduleRows } from "../services/importExport";
import { debugLog } from "../services/debug";
import { getSchedules, saveSchedules } from "../services/storage";
import type { DdtRecord, ScheduleRecord } from "../types";

export function ScheduleUploadPage({ records }: { records: DdtRecord[] }) {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>(getSchedules());
  const [uploadError, setUploadError] = useState("");
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
    try {
      const rows = await readTabularFile(file);
      const parsed = parseScheduleRows(rows);
      if (!parsed.length) {
        setUploadError("No valid schedule rows were found in that file.");
        debugLog.warn("Rejected schedule upload with no valid rows.");
        return;
      }
      const next = [...parsed, ...schedules];
      saveSchedules(next);
      setSchedules(next);
      setUploadError("");
    } catch {
      setUploadError("Unable to import that schedule file.");
      debugLog.warn("Failed to import schedule file.");
    }
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
        {uploadError && <p className="error-text">{uploadError}</p>}
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
