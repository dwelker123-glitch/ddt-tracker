import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ComplianceChart({
  data,
}: {
  data: Array<{ date: string; Touhy: number | null; Devon: number | null }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Touhy" stroke="#9f1d22" strokeWidth={2.5} dot={false} connectNulls />
        <Line type="monotone" dataKey="Devon" stroke="#1f5f9f" strokeWidth={2.5} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DelayChart({ data }: { data: Array<{ reason: string; count: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data.slice(0, 7)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
