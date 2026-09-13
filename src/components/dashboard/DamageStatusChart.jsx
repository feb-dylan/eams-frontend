import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = {
  Reported: "#dc3545",
  "Under Review": "#fd7e14",
  Repairing: "#0d6efd",
  Resolved: "#198754",
};

const DamageStatusChart = ({ dashboard }) => {
  const data = [
    { name: "Reported", value: dashboard?.reportedDamage ?? 0 },
    { name: "Under Review", value: dashboard?.underReviewDamage ?? 0 },
    { name: "Repairing", value: dashboard?.repairingDamage ?? 0 },
    { name: "Resolved", value: dashboard?.resolvedDamage ?? 0 },
  ];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis dataKey="name" tick={{ fontSize: 12 }} />

          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

          <Tooltip />

          <Legend />

          <Bar dataKey="value" name="Reports" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] || "#0d6efd"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DamageStatusChart;