import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  Available: "#198754",
  Assigned: "#0d6efd",
  Damaged: "#dc3545",
  Maintenance: "#fd7e14",
  Retired: "#6c757d",
};

const AssetStatusChart = ({ dashboard }) => {
  const data = [
    { name: "Available", value: dashboard?.availableAssets ?? 0 },
    { name: "Assigned", value: dashboard?.assignedAssets ?? 0 },
    { name: "Damaged", value: dashboard?.damagedAssets ?? 0 },
    { name: "Maintenance", value: dashboard?.maintenanceAssets ?? 0 },
    { name: "Retired", value: dashboard?.retiredAssets ?? 0 },
  ].filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        No asset data available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name] || "#adb5bd"}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetStatusChart;