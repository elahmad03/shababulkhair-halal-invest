import React from "react";

interface DataPoint {
  label: string;
  value: number; // numeric value (NGN)
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
}

/**
 * Small, dependency-free SVG bar chart used for dashboard overviews.
 * - Expects numeric values (not bigint/kobo). Convert using Number(bigint)/100 before passing.
 */
export const BarChart: React.FC<BarChartProps> = ({ data, height = 140 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-sm text-gray-500">
        No data available
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));

  // Visual padding so tiny values are still visible
  const valueRange = max - min || max || 1;

  const barWidth = Math.max(20, Math.floor(100 / data.length));
  const gap = 12;

  return (
    <div className="w-full">
      <svg className="w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" height={height}>
        {/* Bars */}
        {data.map((d, i) => {
          const x = (i * (100 / data.length));
          const normalized = (d.value - min) / valueRange;
          const barH = Math.max(6, normalized * (height - 40));
          const y = height - 28 - barH;
          return (
            <g key={d.label}>
              <rect
                x={`${x + 2}%`}
                y={y}
                width={`${(100 / data.length) - 4}%`}
                height={barH}
                rx={4}
                fill="var(--color-chart-3)"
                className="transition-opacity duration-200 hover:opacity-80"
              />
              <text
                x={`${x + (100 / data.length) / 2}%`}
                y={height - 8}
                textAnchor="middle"
                fontSize={8}
                fill="var(--tw-text-opacity, 0.65)"
                className="text-xs text-gray-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
        {/* Top labels (values) */}
        {data.map((d, i) => {
          const x = (i * (100 / data.length));
          const normalized = (d.value - min) / valueRange;
          const barH = Math.max(6, normalized * (height - 40));
          const y = height - 28 - barH - 4;
          return (
            <text
              key={`v-${d.label}`}
              x={`${x + (100 / data.length) / 2}%`}
              y={y}
              textAnchor="middle"
              fontSize={8}
              fill="var(--tw-text-opacity, 0.65)"
              className="text-xs text-gray-600 dark:text-gray-300"
            >
              {d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default BarChart;
