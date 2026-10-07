import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const truncateLabel = (value, maxLength = 16) =>
  value && value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;

/**
 * Generic horizontal bar chart for comparing a magnitude across categories
 * (e.g. bookings per property). Horizontal layout reads better than rotated
 * x-axis labels once category names get longer than a word or two.
 */
export default function CategoryBarChart({
  data,
  title,
  subtitle,
  dataKey,
  categoryKey,
  valueLabel = "Count",
  color = "var(--chart-1)",
  maxCategories = 10,
}) {
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
          No data for this period
        </div>
      </Card>
    );
  }

  const chartData = data.slice(0, maxCategories);
  const rowHeight = 32;
  const chartHeight = Math.max(chartData.length * rowHeight, 160);

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
      <div className="flex-1 min-h-0 overflow-y-auto px-2">
        <ChartContainer
          config={{ [dataKey]: { label: valueLabel, color } }}
          style={{ height: chartHeight, width: "100%" }}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid
              stroke="var(--color-border-color)"
              horizontal={false}
            />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey={categoryKey}
              width={112}
              tick={{ fontSize: 12 }}
              tickFormatter={truncateLabel}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
