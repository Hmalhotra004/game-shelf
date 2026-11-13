import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import { THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/useThemeStore";
import { DAY_FORMAT, formatRange, MAX_OFFSET } from "@repo/utils/lib/stats";
import { betterTimeText } from "@repo/utils/lib/utils";
import { getWeeklyPlaytimeStatsQueryOptions } from "@repo/utils/queries/stats";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Fragment, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
  GamepadIcon,
} from "lucide-react-native";

const WeeklyPlaytimeChart = () => {
  const { width } = useWindowDimensions();
  const theme = useThemeStore((s) => s.theme);
  const colors = THEME[theme];

  const [offset, setOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Device-local calendar day; the API treats `today` as an opaque date string.
  const todayKey = format(new Date(), DAY_FORMAT);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery(
    getWeeklyPlaytimeStatsQueryOptions(api, { today: todayKey, offset }),
  );

  const changeWeek = (next: number) => {
    setSelectedDate(null);
    setOffset(next);
  };

  const chart = useMemo(() => {
    if (!data) return null;

    const maxSeconds = Math.max(...data.days.map((d) => d.seconds), 0);
    const useHours = maxSeconds >= 3600;
    const divisor = useHours ? 3600 : 60;

    const bars = data.days.map((d) => {
      const isFuture = d.date > todayKey; // ISO strings sort lexicographically
      const isToday = d.date === todayKey;
      const isSelected = d.date === selectedDate;

      return {
        value: d.seconds / divisor,
        label: format(parseISO(d.date), "EEEEE"),
        frontColor: isFuture
          ? colors.muted
          : isSelected || isToday
            ? colors.primary
            : colors.secondary,
        onPress: () => setSelectedDate(isSelected ? null : d.date),
      };
    });

    return { bars, unit: useHours ? "h" : "m", maxSeconds };
  }, [data, selectedDate, todayKey, colors]);

  if (isError) {
    return (
      <ErrorState
        refetch={refetch}
        error={error}
      />
    );
  }

  const selected =
    data && selectedDate
      ? data.days.find((d) => d.date === selectedDate)
      : null;

  const prev = data?.previousWeekTotalSeconds ?? 0;
  const deltaPct =
    data && prev > 0
      ? Math.round(((data.totalSeconds - prev) / prev) * 100)
      : null;

  // Card padding (16*2) + screen padding (16*2) + y-axis labels (~32)
  const chartWidth = width - 96;
  const spacing = (chartWidth - 7 * 28) / 7;

  return (
    <View className="gap-4 rounded-xl bg-card p-3 border border-border">
      {/* Header: week pager */}
      <View className="flex-row items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          hitSlop={12}
          disabled={offset >= MAX_OFFSET || isLoading}
          onPress={() => changeWeek(offset + 1)}
          className={cn("", offset >= MAX_OFFSET && "opacity-30")}
        >
          <ChevronLeftIcon
            size={20}
            color={colors.foreground}
          />
        </Button>

        <Text className="text-sm font-medium text-foreground">
          {offset === 0
            ? "This week"
            : data
              ? formatRange(data.weekStart, data.weekEnd)
              : "…"}
        </Text>

        <Button
          variant="ghost"
          size="icon"
          hitSlop={12}
          disabled={offset === 0 || isLoading}
          onPress={() => changeWeek(offset - 1)}
          className={cn("", offset === 0 && "opacity-30")}
        >
          <ChevronRightIcon
            size={20}
            color={colors.foreground}
          />
        </Button>
      </View>

      {isLoading || !data || !chart ? (
        <View className="h-40 items-center justify-center">
          <Loader />
        </View>
      ) : data?.totalSeconds === 0 || !data || !chart ? (
        <EmptyState
          icon={GamepadIcon}
          title="No playtime this week"
          description={
            offset === 0
              ? "Start a playthrough and your time will show up here."
              : "You didn't log any playtime in this week."
          }
        />
      ) : (
        <Fragment>
          {/* Total + delta */}
          <View className="gap-1">
            <Text className="text-3xl font-bold text-foreground">
              {betterTimeText(data.totalSeconds)}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {formatRange(data.weekStart, data.weekEnd)}
              {deltaPct !== null && (
                <Text
                  className={
                    deltaPct >= 0 ? "text-success" : "text-destructive"
                  }
                >
                  {"  "}
                  {deltaPct >= 0 ? "+" : ""}
                  {deltaPct}% vs last week
                </Text>
              )}
            </Text>
          </View>

          {/* Chart */}
          <View className={cn(isFetching && "opacity-60")}>
            <BarChart
              key={data.weekStart}
              data={chart.bars}
              width={chartWidth}
              barWidth={28}
              spacing={spacing}
              initialSpacing={spacing / 2}
              endSpacing={spacing / 2}
              barBorderTopLeftRadius={6}
              barBorderTopRightRadius={6}
              noOfSections={4}
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisLabelSuffix={chart.unit}
              yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
              xAxisLabelTextStyle={{
                color: colors.mutedForeground,
                fontSize: 11,
              }}
              maxValue={undefined}
              isAnimated
              disableScroll
            />
          </View>

          {/* Selected-day detail, otherwise the summary chips */}
          {selected ? (
            <Text className="text-center text-sm text-foreground">
              {format(parseISO(selected.date), "EEEE, d MMM")} ·{" "}
              {betterTimeText(selected.seconds)} · {selected.sessions}{" "}
              {selected.sessions === 1 ? "session" : "sessions"}
            </Text>
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted-foreground">
                Active {data.activeDays}/7 days
              </Text>

              <View
                className={cn(
                  "flex-row items-center gap-1",
                  !data.streak.playedToday && "opacity-50",
                )}
              >
                <FlameIcon
                  size={16}
                  color={colors.primary}
                />
                <Text className="text-sm text-foreground">
                  {data.streak.current} day streak
                </Text>
              </View>
            </View>
          )}
        </Fragment>
      )}
    </View>
  );
};

export default WeeklyPlaytimeChart;
