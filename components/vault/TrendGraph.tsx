"use client";

import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot
} from "recharts";

type DataPoint = {
  id: string;
  numericValue: number | null;
  unit: string | null;
  testDate: Date;
  flag: string | null;
};

export default function TrendGraph({ data }: { data: DataPoint[] }) {
  // Format data for the chart
  const chartData = data.map(d => ({
    date: format(new Date(d.testDate), "MMM yy"),
    fullDate: format(new Date(d.testDate), "MMM d, yyyy"),
    value: d.numericValue,
    unit: d.unit,
    flag: d.flag,
  }));

  if (chartData.length < 2) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-sm font-medium">Not enough data to map a trend.</p>
        <p className="text-xs mt-1">Upload more reports containing this marker.</p>
      </div>
    );
  }

  // Custom tooltip to maintain our calm UI
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{data.fullDate}</p>
          <p className="text-lg font-bold tabular-nums">
            {data.value} <span className="text-xs font-medium text-slate-400">{data.unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          {/* Minimalist Axes */}
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
            domain={['dataMin - 10', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          {/* The Data Line */}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#0ea5e9" // Calm sky blue
            strokeWidth={3} 
            dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#0284c7', strokeWidth: 0 }}
          />
          
          {/* Highlight abnormal flags softly */}
          {chartData.map((entry, index) => (
            (entry.flag === 'high' || entry.flag === 'low') && (
              <ReferenceDot 
                key={index} 
                x={entry.date} 
                y={entry.value as number} 
                r={6} 
                fill="#fbbf24" // Gentle Amber
                stroke="none" 
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}