import { Download, Upload } from "lucide-react";
import { readTabularFile, recordsToCsv } from "../services/importExport";
import { getInputRecords, saveInputRecords } from "../services/storage";
import type { DdtInputRecord, DdtRecord, Shift } from "../types";

export function ImportExportPage({
  records,
  onRecordsChange,
}: {
  records: DdtRecord[];
  onRecordsChange: () => void;
}) {
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
    const rows = await readTabularFile(file);
    const imported: DdtInputRecord[] = rows.map((row, index) => ({
      id: `import-${Date.now()}-${index}`,
      location: "touhy" as const,
      date: String(row.Date ?? row.date ?? ""),
      shift: String(row.Shift ?? row.shift ?? "AM") as Shift,
      dock: String(row.Dock ?? row.dock ?? ""),
      opsx: String(row.OPSX ?? row.opsx ?? ""),
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
    }));
    saveInputRecords([...imported, ...getInputRecords()]);
    onRecordsChange();
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
      </section>
      <section className="panel">
        <div className="panel-heading"><h2>Local JSON Storage</h2></div>
        <pre className="json-preview">{JSON.stringify(records.slice(0, 4), null, 2)}</pre>
      </section>
    </div>
  );
}
