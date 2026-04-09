import PieChartCard from "@/components/charts/PieChartCard";
import { OverviewCard } from "@/components/home/OverviewCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { overviewLabels } from "@repo/utils/constants";
import { getStatsQueryOptions } from "@repo/utils/queries/stats";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  completionStyleChartColorMap,
  platformChartColorMap,
  providerChartColorMap,
  statusChartColorMap,
} from "@repo/utils/lib/chartColors";

export const Route = createFileRoute("/_mainLayout/")({
  component: Index,
});

function Index() {
  const { data, isLoading } = useQuery(getStatsQueryOptions());

  if (isLoading || !data)
    return (
      <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {overviewLabels.map((label) => (
          <OverviewCard
            key={label}
            label={label}
          />
        ))}
      </div>
    );

  const overview = data.overview;

  const stats = [
    { label: "Games", value: overview.totalGames },
    { label: "DLCs", value: overview.totalDLCs },
    { label: "Money Spent", value: `₹${overview.totalSpent}` },
    { label: "Hours Played", value: overview.totalPlaytimeHours },
    { label: "Active Runs", value: overview.activePlaythroughs },
    { label: "Completions", value: overview.completedGames },
  ];

  return (
    <div className="flex flex-col w-full items-center flex-1 gap-4">
      <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <OverviewCard
            key={s.label}
            label={s.label}
            value={s.value}
          />
        ))}
      </div>

      <ScrollArea className="h-140">
        <div className="flex items-center justify-center flex-wrap gap-4">
          {data.statusDistribution.length > 0 && (
            <PieChartCard
              title="Status"
              data={data.statusDistribution}
              colorMap={statusChartColorMap}
            />
          )}

          {data.platformDistribution.length > 0 && (
            <PieChartCard
              title="Platform"
              data={data.platformDistribution}
              colorMap={platformChartColorMap}
            />
          )}

          {data.providerDistribution.length > 0 && (
            <PieChartCard
              title="Provider"
              data={data.providerDistribution}
              colorMap={providerChartColorMap}
            />
          )}

          {data.completionStyleDistribution.length > 0 && (
            <PieChartCard
              title="Completion Style"
              data={data.completionStyleDistribution}
              colorMap={completionStyleChartColorMap}
            />
          )}

          <ScrollBar orientation="vertical" />
        </div>
      </ScrollArea>
    </div>
  );
}
