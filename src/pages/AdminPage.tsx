import { RotateCcw } from "lucide-react";
import { resetLocalData } from "../services/storage";

export function AdminPage({ onRecordsChange }: { onRecordsChange: () => void }) {
  const reset = () => {
    if (!confirm("Reset local drafts, filters, schedules, and snapshots back to seeded workbook data?")) return;
    resetLocalData();
    onRecordsChange();
  };

  return (
    <div className="stack">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Administration</h2>
            <p>System-controlled calculations and closed historical records are not directly editable.</p>
          </div>
        </div>
        <div className="admin-list">
          <div><strong>Protected calculations</strong><span>DDT variance, KAT variance, status, compliance, rolling summaries</span></div>
          <div><strong>Storage mode</strong><span>Local JSON, shaped for future database migration</span></div>
          <div><strong>Historical path</strong><span>/data/history/YYYY/MM/DD/</span></div>
        </div>
        <button className="secondary-button danger" type="button" onClick={reset}>
          <RotateCcw size={16} />
          Reset Local Data
        </button>
      </section>
    </div>
  );
}
