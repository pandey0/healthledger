"use client";

import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
  Dot,
} from "recharts";
import type { ReferenceRange } from "@/lib/referenceRanges";

type DataPoint = {
  id: string;
  numericValue: number | null;
  unit: string | null;
  testDate: Date;
  flag: string | null;
};

type Props = {
  data: DataPoint[];
  referenceRange?: ReferenceRange | null;
};

function getDotColor(value: number, ref?: ReferenceRange | null): string {
  if (!ref) return "#0ea5e9";
  if (value >= ref.min && value <= ref.max) return "#10b981"; // emerald — normal
  const pct = (ref.max - ref.min) * 0.15;
  if (value >= ref.min - pct && value <= ref.max + pct) return "#f59e0b"; // amber — borderline
  return "#ef4444"; // red — abnormal
}

export default function TrendGraph({ data, referenceRange }: Props) {
  const numericData = data.filter((d) => d.numericValue !== null);

  const chartData = numericData.map((d) => ({
    date: format(new Date(d.testDate), "MMM yy"),
    fullDate: format(new Date(d.testDate), "MMM d, yyyy"),
    value: d.numericValue as number,
    unit: d.unit,
    flag: d.flag,
    color: getDotColor(d.numericValue as number, referenceRange),
  }));

  if (chartData.length < 1) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[20px] border border-dashed border-slate-200">
        <p className="text-[14px] font-semibold">Not enough data to plot a trend.</p>
        <p className="text-[12px] mt-1 text-slate-300">Upload more reports containing this marker.</p>
      </div>
    );
  }

  const values = chartData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // Y-axis domain: accommodate both data and reference range
  const refMin = referenceRange?.min ?? minVal;
  const refMax = referenceRange?.max === 999 ? maxVal : (referenceRange?.max ?? maxVal);
  const domainMin = Math.floor(Math.min(minVal, refMin) * 0.85);
  const domainMax = Math.ceil(Math.max(maxVal, refMax) * 1.15);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const inRange = referenceRange
        ? d.value >= referenceRange.min && d.value <= (referenceRange.max === 999 ? Infinity : referenceRange.max)
        : null;

      return (
        <div className="bg-white border border-slate-200 shadow-xl p-4 rounded-[16px] min-w-[160px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">{d.fullDate}</p>
          <p className="text-[22px] font-extrabold text-slate-800 leading-none">
            {d.value}
            <span className="text-[13px] font-semibold text-slate-400 ml-1">{d.unit}</span>
          </p>
          {referenceRange && inRange !== null && (
            <div className={`mt-2 flex items-center gap-1.5 text-[12px] font-bold ${inRange ? "text-emerald-600" : "text-red-500"}`}>
              <div className={`w-2 h-2 rounded-full ${inRange ? "bg-emerald-500" : "bg-red-500"}`} />
              {inRange ? "Within normal range" : "Outside normal range"}
            </div>
          )}
          {referenceRange && (
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Normal: {referenceRange.min}–{referenceRange.max === 999 ? "↑" : referenceRange.max} {referenceRange.unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = getDotColor(payload.value, referenceRange);
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = getDotColor(payload.value, referenceRange);
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={7}
        fill={color}
        stroke="white"
        strokeWidth={2.5}
      />
    );
  };

  return (
    <div className="bg-white rounded-[20px] p-5 border border-slate-100 shadow-sm">

      {/* Legend */}
      {referenceRange && (
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[12px] font-semibold text-slate-500">Normal range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[12px] font-semibold text-slate-500">Borderline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[12px] font-semibold text-slate-500">Abnormal</span>
          </div>
        </div>
      )}

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            {/* Normal range band */}
            {referenceRange && referenceRange.max !== 999 && (
              <ReferenceArea
                y1={referenceRange.min}
                y2={referenceRange.max}
                fill="#10b981"
                fillOpacity={0.06}
                stroke="#10b981"
                strokeOpacity={0.2}
                strokeDasharray="4 4"
              />
            )}

            {/* Reference lines at boundaries */}
            {referenceRange && referenceRange.max !== 999 && (
              <>
                <ReferenceLine
                  y={referenceRange.max}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  strokeWidth={1}
                  label={{ value: `Max ${referenceRange.max}`, position: "right", fontSize: 10, fill: "#10b981" }}
                />
                <ReferenceLine
                  y={referenceRange.min}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  strokeWidth={1}
                  label={{ value: `Min ${referenceRange.min}`, position: "right", fontSize: 10, fill: "#10b981" }}
                />
              </>
            )}

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
              domain={[domainMin, domainMax]}
              width={40}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }} />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#1A365D"
              strokeWidth={2.5}
              dot={<CustomDot />}
              activeDot={<CustomActiveDot />}
              connectNulls
            />

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
