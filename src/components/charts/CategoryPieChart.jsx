import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Fixed hue order from the app's existing chart palette (src/index.css) -
// assigned by category identity, never cycled/re-sorted by value.
const CATEGORICAL_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

/**
 * Generic donut chart for a part-to-whole breakdown across a small number
 * of categories (e.g. properties by management package). Keep category
 * counts low - this isn't meant for high-cardinality breakdowns.
 */
export default function CategoryPieChart({
  data,
  title,
  subtitle,
  dataKey,
  nameKey,
  colorMap,
}) {
  const chartConfig = useMemo(() => {
    if (!data?.length) return {};
    return data.reduce((acc, entry, index) => {
      const name = entry[nameKey];
      acc[name] = {
        label: name,
        color:
          colorMap?.[name] ||
          CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
      };
      return acc;
    }, {});
  }, [data, nameKey, colorMap]);

  if (!data || data.length === 0) {
    return (
      <Card className="h-full shadow-m flex flex-col overflow-hidden">
        <CardHeader className="flex w-full justify-between flex-shrink-0 h-14 px-6">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-primary-text text-lg">{title}</CardTitle>
            <CardDescription className="text-secondary-text">
              {subtitle}
            </CardDescription>
          </div>
        </CardHeader>
        <div className="flex-1 flex items-center justify-center text-secondary-text">
          No data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-m flex flex-col overflow-hidden">
      <CardHeader className="flex w-full justify-between flex-shrink-0 h-14 px-6">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-primary-text text-lg">{title}</CardTitle>
          <CardDescription className="text-secondary-text">
            {subtitle}
          </CardDescription>
        </div>
      </CardHeader>
      <ChartContainer config={chartConfig} className="flex-1 min-h-0 px-4 pb-2">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey={nameKey} />} />
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius="45%"
            outerRadius="75%"
            paddingAngle={2}>
            {data.map((entry) => (
              <Cell
                key={entry[nameKey]}
                fill={chartConfig[entry[nameKey]]?.color}
                stroke="var(--color-secondary-bg)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />
        </PieChart>
      </ChartContainer>
    </Card>
  );
}
