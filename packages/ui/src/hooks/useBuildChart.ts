import { DataType } from "@repo/schemas/types/index";
import { ChartConfig } from "@repo/ui/components/ui/chart";

const normalizeKey = (label: string) =>
  label
    .toLowerCase()
    .replaceAll("+", "_plus")
    .replaceAll(/[^a-z0-9_]/g, "_")
    .replaceAll(/_+/g, "_")
    .replaceAll(/^_|_$/g, "");

export function useBuildChart<T extends string>(
  data: DataType[],
  colorMap?: Record<T, string>,
) {
  const ChartConfig = data.reduce<ChartConfig>(
    (acc, d, idx) => {
      const key = normalizeKey(d.label);

      acc[key] = {
        label: d.label,
        color: colorMap ? colorMap[d.label as T] : `var(--chart-${idx + 1})`,
      };

      return acc;
    },
    {
      value: { label: "" },
    },
  );

  const chartData = data.map((d) => {
    const key = normalizeKey(d.label);

    return {
      label: key,
      value: Number(d.value),
      fill: `var(--color-${key})`,
    };
  });

  return { ChartConfig, chartData };
}
