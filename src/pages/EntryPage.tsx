import { LockKeyhole, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ComplianceChart, DelayChart } from "../components/Charts";
import { KpiStrip } from "../components/KpiStrip";
import { RecordEditor } from "../components/RecordEditor";
import { RecordTable } from "../components/RecordTable";
import { complianceByDate, delayReasons, summarize } from "../services/calculations";
import { closeDay, upsertRecord } from "../services/storage";
import { makeBlankRecord } from "../services/importExport";
import type { DdtInputRecord, DdtRecord, LocationId } from "../types";

type Props = {
  location: LocationId;
  records: DdtRecord[];
  onRecordsChange: () => void;
};

export function EntryPage({ location, records, onRecordsChange }: Props) {
  const locationRecords = records.filter((record) => record.location === location);
  const [selectedId, setSelectedId] = useState(locationRecords[0]?.id);
  const [saveError, setSaveError] = useState("");
  const selected = locationRecords.find((record) => record.id === selectedId) ?? locationRecords[0];
  const summary = summarize(locationRecords);
  const trend = complianceByDate(locationRecords);
  const reasons = delayReasons(locationRecords);
  const date = selected?.date ?? new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => locationRecords.slice(0, 80), [locationRecords]);

  const save = (record: DdtInputRecord) => {
    try {
      upsertRecord(record);
      setSaveError("");
      onRecordsChange();
    } catch {
      setSaveError("Unable to save this departure. Check required fields and try again.");
    }
  };

  const addRecord = () => {
    try {
      const record = makeBlankRecord(location);
      upsertRecord(record);
      setSelectedId(record.id);
      setSaveError("");
      onRecordsChange();
    } catch {
      setSaveError("Unable to add a new departure right now.");
    }
  };

  const handleCloseDay = () => {
    if (!confirm(`Close ${date}? This locks the day's records and creates a historical snapshot.`)) return;
    closeDay(location, date);
    onRecordsChange();
  };

  return (
    <div className="page-grid">
      <div className="main-column">
        <section className="entry-tray" aria-label="New data entry tray">
          <div className="entry-tray-actions">
            <button type="button" className="secondary-button" onClick={addRecord}>
              <Plus size={16} />
              Add
            </button>
            <button type="button" className="primary-button" onClick={handleCloseDay}>
              <LockKeyhole size={16} />
              Close Day
            </button>
          </div>
          {selected && <RecordEditor record={selected} onSave={save} error={saveError} />}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Departure Board</h2>
              <p>Protected calculated values update automatically.</p>
            </div>
          </div>
          <RecordTable records={filtered} selectedId={selected?.id} onSelect={(record) => setSelectedId(record.id)} />
        </section>
        <KpiStrip summary={summary} />
      </div>
      <aside className="side-column">
        <section className="panel">
          <div className="panel-heading"><h2>DDT Compliance</h2></div>
          <ComplianceChart data={trend} />
        </section>
        <section className="panel">
          <div className="panel-heading"><h2>Delay Reasons</h2></div>
          <DelayChart data={reasons} />
        </section>
      </aside>
    </div>
  );
}
