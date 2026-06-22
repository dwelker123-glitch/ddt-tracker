import {
  BarChart3,
  CalendarClock,
  Database,
  FileSpreadsheet,
  MapPin,
  Settings,
  Upload,
} from "lucide-react";
import { summarize } from "../services/calculations";
import type { DdtRecord, PageId } from "../types";

const navItems: Array<{ id: PageId; label: string; icon: typeof MapPin }> = [
  { id: "touhy", label: "Touhy DDT Entry", icon: MapPin },
  { id: "devon", label: "Devon DDT Entry", icon: MapPin },
  { id: "weekly", label: "Weekly Summary", icon: CalendarClock },
  { id: "trends", label: "Historical Trends", icon: BarChart3 },
  { id: "schedule", label: "Management Schedule Upload", icon: Upload },
  { id: "import-export", label: "Import / Export", icon: FileSpreadsheet },
  { id: "admin", label: "Administration", icon: Settings },
];

type Props = {
  page: PageId;
  title: string;
  records: DdtRecord[];
  toolbar: React.ReactNode;
  children: React.ReactNode;
  onNavigate: (page: PageId) => void;
};

export function AppShell({ page, title, records, toolbar, children, onNavigate }: Props) {
  const summary = summarize(records);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Database size={22} />
          <span>DDT Tracker</span>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={page === item.id ? "nav-item active" : "nav-item"}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>Auto-saved · Calculated fields are locked</p>
          </div>
          <div className="topbar-actions">
            <div className="mini-stat">
              <span>DDT Compliance</span>
              <strong>{summary.compliance}%</strong>
            </div>
            {toolbar}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
