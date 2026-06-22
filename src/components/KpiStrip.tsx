import { Clock, ShieldCheck, Timer, TriangleAlert } from "lucide-react";
import type { SummaryMetrics } from "../types";

type Props = {
  summary: SummaryMetrics;
};

export function KpiStrip({ summary }: Props) {
  const items = [
    { label: "DDT Compliance", value: `${summary.compliance}%`, icon: ShieldCheck, tone: "good" },
    { label: "Avg Variance", value: `${summary.averageVariance}m`, icon: Timer, tone: "neutral" },
    { label: "Late Departures", value: summary.lateDepartures, icon: TriangleAlert, tone: "warn" },
    { label: "Historical Snapshot", value: summary.totalDepartures, icon: Clock, tone: "neutral" },
  ];
  return (
    <section className="kpi-strip">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className={`kpi ${item.tone}`} key={item.label}>
            <Icon size={18} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        );
      })}
    </section>
  );
}
