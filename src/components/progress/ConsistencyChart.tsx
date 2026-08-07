import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { WeeklyConsistencyPoint } from '../../services/consistency.service';

interface Props {
  data: WeeklyConsistencyPoint[];
}

export default function ConsistencyChart({ data }: Props) {
  const chartData = data.map((point, index) => ({
    week: `W${index + 1}`,
    date: point.weekStart,
    minutes: point.totalMinutes
  }));

  return (
    <div className="consistency-chart p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Consistency Since Surgery</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis label={{ value: 'min/week', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value) => [`${value} min`, 'Activity']}
            labelFormatter={(label, payload) => payload?.[0]?.payload.date ?? label}
          />
          <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
