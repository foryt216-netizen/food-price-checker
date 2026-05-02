import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map(p => (
        p.value != null && (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value.toLocaleString()} 円
          </p>
        )
      ))}
    </div>
  )
}

export default function PriceChart({ data, areaName, showRegional = false }) {
  const hasRegional = showRegional && data.some(d => d.regional != null)

  // Filter out months with no data at all
  const chartData = data.map(d => ({
    ...d,
    national: d.national,
    regional: d.regional,
  }))

  const allValues = chartData.flatMap(d => [d.national, d.regional]).filter(v => v != null)
  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)
  const padding = (maxVal - minVal) * 0.15 || 10
  const yMin = Math.max(0, Math.floor((minVal - padding) / 10) * 10)
  const yMax = Math.ceil((maxVal + padding) / 10) * 10

  return (
    <div className="price-chart">
      <h2 className="section-title">過去6ヶ月の価格推移</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={v => `¥${v.toLocaleString()}`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => value === 'national' ? '全国平均' : areaName}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="national"
            name="national"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
          {hasRegional && (
            <Line
              type="monotone"
              dataKey="regional"
              name="regional"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#f59e0b' }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
