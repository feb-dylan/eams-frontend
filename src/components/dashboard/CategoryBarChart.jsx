import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Bar chart for [{label, value}] data from the dashboard API. */
const CategoryBarChart = ({ data = [], color = "#0d6efd" }) => {
  if (data.length === 0) return <p className="text-muted mb-0">No data yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data.map((d) => ({ label: d.label, value: Number(d.value) }))}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={55} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryBarChart;
