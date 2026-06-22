import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AppShell } from "./components/AppShell";
import { PasswordGate } from "./components/PasswordGate";
import { AdminPage } from "./pages/AdminPage";
import { EntryPage } from "./pages/EntryPage";
import { DashboardPage } from "./pages/HistoricalTrendsPage";
import { ImportExportPage } from "./pages/ImportExportPage";
import { ScheduleUploadPage } from "./pages/ScheduleUploadPage";
import { WeeklySummaryPage } from "./pages/WeeklySummaryPage";
import { getRecords, getTheme, saveTheme } from "./services/storage";
import type { DdtRecord, PageId } from "./types";

export default function App() {
  const [page, setPage] = useState<PageId>("touhy");
  const [theme, setTheme] = useState(getTheme());
  const [records, setRecords] = useState<DdtRecord[]>(getRecords());
  const [focusedRecordId, setFocusedRecordId] = useState<string>();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  const title = useMemo(() => {
    const labels: Record<PageId, string> = {
      touhy: "Touhy DDT Entry",
      devon: "Devon DDT Entry",
      weekly: "Weekly Summary",
      dashboard: "Dashboard",
      schedule: "Management Schedule Upload",
      "import-export": "Import / Export",
      admin: "Administration",
    };
    return labels[page];
  }, [page]);

  const refreshRecords = () => setRecords(getRecords());
  const navigateToRecord = (record: DdtRecord) => {
    setFocusedRecordId(record.id);
    setPage(record.location === "Devon" ? "devon" : "touhy");
  };

  return (
    <PasswordGate>
      <AppShell
        page={page}
        title={title}
        onNavigate={setPage}
        onSelectRecord={navigateToRecord}
        records={records}
        toolbar={
          <button
            className="icon-button"
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        }
      >
        {page === "touhy" && (
          <EntryPage
            location="Touhy"
            records={records}
            focusedRecordId={focusedRecordId}
            onRecordsChange={refreshRecords}
          />
        )}
        {page === "devon" && (
          <EntryPage
            location="Devon"
            records={records}
            focusedRecordId={focusedRecordId}
            onRecordsChange={refreshRecords}
          />
        )}
        {page === "weekly" && <WeeklySummaryPage records={records} />}
        {page === "dashboard" && <DashboardPage records={records} />}
        {page === "schedule" && <ScheduleUploadPage records={records} />}
        {page === "import-export" && <ImportExportPage records={records} onRecordsChange={refreshRecords} />}
        {page === "admin" && <AdminPage onRecordsChange={refreshRecords} />}
      </AppShell>
    </PasswordGate>
  );
}
