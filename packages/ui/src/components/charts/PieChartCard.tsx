"use client";

import { DataType } from "@repo/schemas/types/index";
import { useBuildChart } from "@repo/ui/hooks/useBuildChart";
import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Props<T extends string> {
  title: string;
  data: DataType[];
  colorMap?: Record<T, string>;
}

const PieChartCard = <T extends string>({
  title,
  data,
  colorMap,
}: Props<T>) => {
  const { ChartConfig, chartData } = useBuildChart(data, colorMap);

  return (
    <>
      {/* <div className="flex flex-col h-full bg-card p-4 rounded-xl border-border border">
        <h1 className="leading-none font-semibold mb-1">{title}</h1>

        <ChartContainer config={ChartConfig}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              outerRadius={105}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/3 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </div> */}

      <Card className="pb-3">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 pb-0 px-0">
          <ChartContainer
            config={ChartConfig}
            className="mx-auto h-80"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                outerRadius={105}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="label" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default PieChartCard;
