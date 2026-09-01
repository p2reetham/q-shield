import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  NORMAL: "#4c9a6a",
  LOW: "#4dd8ce",
  MEDIUM: "#e8a33d",
  HIGH: "#d1786a",
  CRITICAL: "#d1493f",
};

export default function ThreatOverview({ distribution }: { distribution: Record<string, number> }) {
  const data = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="panel p-4 h-full flex flex-col">
      <div className="data-label mb-2">Threat Distribution</div>
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-graphite-500 text-sm">
          No events logged yet
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-4">
          <ResponsiveContainer width="55%" height={160}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                {data.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name] ?? "#565e68"} stroke="#141619" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#191c20", border: "1px solid #2a2f36", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 text-[12px] font-mono">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[d.name] }} />
                <span className="text-graphite-500 w-16">{d.name}</span>
                <span>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
