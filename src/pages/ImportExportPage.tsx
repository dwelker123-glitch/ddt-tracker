import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { normalizeLocation, readTabularFile, recordsToCsv } from "../services/importExport";
import { debugLog } from "../services/debug";
import { getInputRecords, normalizeRecord, saveInputRecords } from "../services/storage";
import type { DdtInputRecord, DdtRecord, Shift } from "../types";

export function ImportExportPage({
  records,
  onRecordsChange,
}: {
  records: DdtRecord[];
  onRecordsChange: () => void;
}) {
  const [importError, setImportError] = useState("");

  const download = () => {
    const blob = new Blob([recordsToCsv(records)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ddt-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const rows = await readTabularFile(file);
      const imported: DdtInputRecord[] = rows.flatMap((row, index) => {
        const normalized = normalizeRecord({
          id: `import-${Date.now()}-${index}`,
          location: normalizeLocation(row.Location ?? row.location),
          date: String(row.Date ?? row.date ?? ""),
          shift: String(row.Shift ?? row.shift ?? "AM") as Shift,
          dock: String(row.Dock ?? row.dock ?? ""),
          loader: String(row.Loader ?? row.loader ?? ""),
          driver: String(row.Driver ?? row.driver ?? ""),
          truck: String(row.Truck ?? row.truck ?? ""),
          flights: [
            { flight: String(row.Flight1 ?? ""), category: "" },
            { flight: String(row.Flight2 ?? ""), category: "" },
            { flight: String(row.Flight3 ?? ""), category: "" },
          ],
          scheduledDdt: String(row.ScheduledDDT ?? ""),
          actualDdt: String(row.ActualDDT ?? ""),
          scheduledKat: String(row.ScheduledKAT ?? ""),
          actualKat: String(row.ActualKAT ?? ""),
          delayReason: String(row.DelayReason ?? ""),
          notes: String(row.Notes ?? ""),
          operationalComments: String(row.OperationalComments ?? ""),
        });
        if (!normalized) {
          debugLog.warn("Rejected invalid imported row.", { index });
          return [];
        }
        return [normalized];
      });
      if (!imported.length) {
        setImportError("No valid DDT rows were found in that file.");
        return;
      }
      saveInputRecords([...imported, ...getInputRecords()]);
      setImportError("");
      onRecordsChange();
    } catch {
      setImportError("Unable to import that file. Check the format and try again.");
      debugLog.warn("Failed to import records.");
    }
  };

  return (
    <div className="stack">
      <section className="panel import-actions">
        <button className="primary-button" type="button" onClick={download}>
          <Download size={16} />
          Export CSV
        </button>
        <label className="file-button">
          <Upload size={16} />
          Import Excel or CSV
          <input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => upload(event.target.files?.[0])} />
        </label>
        {importError && <p className="error-text">{importError}</p>}
      </section>
      <section className="panel">
        <div className="panel-heading"><h2>Local JSON Storage</h2></div>
        <pre className="json-preview">{JSON.stringify(records.slice(0, 4), null, 2)}</pre>
      </section>
    </div>
  );
}
