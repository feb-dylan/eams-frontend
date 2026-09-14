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
  Scheduled: "#fd7e14",
  "In Progress": "#0d6efd",
  Completed: "#198754",
};

const MaintenanceStatusChart = ({ dashboard }) => {
  const data = [
    {
      name: "Scheduled",
      value: dashboard?.scheduledMaintenance ?? 0,
    },
    {
      name: "In Progress",
      value: dashboard?.inProgressMaintenance ?? 0,
    },
    {
      name: "Completed",
      value: dashboard?.completedMaintenance ?? 0,
    },
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

          <Bar dataKey="value" name="Records" radius={[6, 6, 0, 0]}>
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

export default MaintenanceStatusChart;