import { LockKeyhole, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { KpiStrip } from "../components/KpiStrip";
import { HourlyPerformanceTable } from "../components/HourlyPerformanceTable";
import { RecordEditor } from "../components/RecordEditor";
import { RecordTable } from "../components/RecordTable";
import { summarize } from "../services/calculations";
import { closeDay, upsertRecord } from "../services/storage";
import { makeBlankRecord } from "../services/importExport";
import type { DdtInputRecord, DdtRecord, LocationId } from "../types";

type Props = {
  location: LocationId;
  records: DdtRecord[];
  focusedRecordId?: string;
  onRecordsChange: () => void;
};

export function EntryPage({ location, records, focusedRecordId, onRecordsChange }: Props) {
  const locationRecords = records.filter((record) => record.location === location);
  const [selectedId, setSelectedId] = useState(locationRecords[0]?.id);
  const [saveError, setSaveError] = useState("");
  const [boardQuery, setBoardQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const selected = locationRecords.find((record) => record.id === selectedId) ?? locationRecords[0];
  const summary = summarize(locationRecords);
  const date = selected?.date ?? new Date().toISOString().slice(0, 10);
  const dayRecords = locationRecords.filter((record) => record.date === date);

  useEffect(() => {
    if (focusedRecordId && locationRecords.some((record) => record.id === focusedRecordId)) {
      setSelectedId(focusedRecordId);
    }
  }, [focusedRecordId, locationRecords]);

  const filtered = useMemo(() => {
    const query = boardQuery.toLowerCase().trim();
    return locationRecords
      .filter((record) => {
        const statusMatches = statusFilter === "all" || record.metrics.status === statusFilter;
        const queryMatches =
          !query ||
          [
            record.date,
            record.dock,
            record.loader,
            record.driver,
            record.truck,
            record.delayReason,
            record.notes,
            ...record.flights.map((flight) => flight.flight),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        return statusMatches && queryMatches;
      })
      .slice(0, 120);
  }, [boardQuery, locationRecords, statusFilter]);

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
    try {
      closeDay(location, date);
      setSaveError("");
      onRecordsChange();
    } catch {
      setSaveError("Unable to close this day right now. Check saved data and try again.");
    }
  };

  return (
    <div className="stack">
      <KpiStrip summary={summary} />
      <section className="filter-bar" aria-label="Filters">
        <label>
          Board search
          <input
            value={boardQuery}
            onChange={(event) => setBoardQuery(event.target.value)}
            placeholder="Filter flight, dock, driver, truck"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="On-time">On-time</option>
            <option value="Late">Late</option>
            <option value="Incomplete">Incomplete</option>
          </select>
        </label>
      </section>
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
      <HourlyPerformanceTable records={dayRecords} title="Day-of Performance by Hour" />
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Departure Board</h2>
            <p>Protected calculated values update automatically.</p>
          </div>
        </div>
        <RecordTable records={filtered} selectedId={selected?.id} onSelect={(record) => setSelectedId(record.id)} />
      </section>
    </div>
  );
}
