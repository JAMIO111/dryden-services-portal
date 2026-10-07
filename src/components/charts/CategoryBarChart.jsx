import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Horizontal "ranked list" bar chart for comparing a magnitude across
 * categories (e.g. bookings per property). Plain HTML/CSS rather than an
 * SVG chart library axis - Recharts' categorical YAxis sizes its tick
 * labels off its own internal width estimate, which doesn't reliably
 * respect a configured width or a custom tickFormatter once labels vary
 * in length, so longer property names were getting clipped unpredictably.
 * A CSS `truncate` + native `title` tooltip is a simpler, guaranteed-
 * correct way to keep full names readable (on hover) while never
 * overflowing the row.
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
  const maxValue = Math.max(...chartData.map((entry) => entry[dataKey]), 1);

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
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {chartData.map((entry) => {
          const value = entry[dataKey];
          // Floor so a near-zero value still renders a visible sliver.
          const widthPct = Math.max((value / maxValue) * 100, 4);

          return (
            <div
              key={entry[categoryKey]}
              className="flex items-center gap-3"
              title={`${entry[categoryKey]}: ${value} ${valueLabel.toLowerCase()}`}>
              <span className="w-32 sm:w-40 shrink-0 truncate text-sm text-secondary-text">
                {entry[categoryKey]}
              </span>
              <div className="flex-1 h-5 bg-primary-bg rounded-md overflow-hidden">
                <div
                  className="h-full rounded-md transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-medium text-primary-text tabular-nums">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
