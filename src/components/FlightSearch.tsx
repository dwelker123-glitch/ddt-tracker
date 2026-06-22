import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { getSnapshots } from "../services/storage";
import type { DdtRecord } from "../types";

type Props = {
  records: DdtRecord[];
  onSelect: (record: DdtRecord) => void;
};

type FlightSearchResult = {
  key: string;
  flightNumber: string;
  record: DdtRecord;
};

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function searchableText(result: FlightSearchResult) {
  const { record, flightNumber } = result;
  return normalizeSearch(
    [
      flightNumber,
      record.date,
      record.location,
      record.dock,
      record.scheduledDdt,
      record.sealTime,
      record.actualDdt,
      record.metrics.ddtVarianceLabel,
      record.driver,
      record.truck,
      record.delayReason,
      record.notes,
    ].join(" "),
  );
}

function buildResults(records: DdtRecord[]) {
  const snapshots = getSnapshots();
  const history = snapshots.flatMap((snapshot) => snapshot.records);
  const byRecordAndFlight = new Map<string, FlightSearchResult>();

  [...records, ...history].forEach((record) => {
    record.flights
      .map((leg) => leg.flight.trim())
      .filter(Boolean)
      .forEach((flightNumber) => {
        const key = `${record.location}-${record.date}-${record.id}-${normalizeSearch(flightNumber)}`;
        byRecordAndFlight.set(key, { key, flightNumber, record });
      });
  });

  return Array.from(byRecordAndFlight.values()).sort((a, b) => b.record.date.localeCompare(a.record.date));
}

export function FlightSearch({ records, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const allResults = useMemo(() => buildResults(records), [records]);
  const tokens = normalizeSearch(query).split(" ").filter(Boolean);
  const results = useMemo(() => {
    if (!tokens.length) return [];
    return allResults.filter((result) => tokens.every((token) => searchableText(result).includes(token))).slice(0, 10);
  }, [allResults, tokens]);

  return (
    <div className="flight-search">
      <label className="flight-search-label" htmlFor="global-flight-search">
        Flight Search
      </label>
      <div className="flight-search-input">
        <Search size={16} aria-hidden="true" />
        <input
          id="global-flight-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(Boolean(event.target.value.trim()));
          }}
          onFocus={() => setOpen(Boolean(query.trim()))}
          placeholder="Flight number or flight + date"
          autoComplete="off"
        />
      </div>
      {open && (
        <div className="flight-search-results" role="listbox" aria-label="Flight search results">
          {results.length ? (
            results.map((result) => {
              const record = result.record;
              return (
                <button
                  key={result.key}
                  type="button"
                  className="flight-search-result"
                  onClick={() => {
                    onSelect(record);
                    setOpen(false);
                    setQuery(result.flightNumber);
                  }}
                >
                  <span>
                    <strong>{result.flightNumber}</strong>
                    <small>{record.date} · {record.location} · Dock {record.dock || "N/A"}</small>
                  </span>
                  <span>
                    <b>DDT</b>
                    <small>
                      {record.scheduledDdt || "N/A"} / {record.sealTime || "N/A"} / {record.actualDdt || "N/A"}
                    </small>
                  </span>
                  <span>
                    <b>Variance</b>
                    <small>{record.metrics.ddtVarianceLabel}</small>
                  </span>
                  <span>
                    <b>Driver / Truck</b>
                    <small>{record.driver || "N/A"} / {record.truck || "N/A"}</small>
                  </span>
                  <span>
                    <b>Delay / Notes</b>
                    <small>{record.delayReason || "None"} · {record.notes || "No notes"}</small>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="flight-search-empty">No matching flights found.</p>
          )}
        </div>
      )}
    </div>
  );
}
