import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { casualSession, playthroughSession } from "@/db/schema";
import { WeekStatsQueryType } from "@repo/schemas/schemas/stats";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { Request, Response } from "express";

import {
  casualNotInArchivedCollection,
  notInArchivedCollection,
} from "@/lib/queryHelpers";

import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

const DAY_FORMAT = "yyyy-MM-dd";
const MAX_STREAK_LOOKBACK = 400;

/** Calendar day as a string. parseISO + format round-trip in any server timezone. */
const toDay = (d: Date) => format(d, DAY_FORMAT);

/** Consecutive days with a session, ending today, or yesterday if today has none yet. */
const currentStreak = (playDays: Set<string>, today: Date) => {
  let cursor = playDays.has(toDay(today)) ? today : subDays(today, 1);
  let count = 0;
  while (playDays.has(toDay(cursor))) {
    count++;
    cursor = subDays(cursor, 1);
  }
  return count;
};

type DayRow = { date: string; seconds: number; sessions: number };

/** Sums rows from several sources into one row per day. */
const mergeDayRows = (...sources: DayRow[][]) => {
  const merged = new Map<string, DayRow>();
  for (const row of sources.flat()) {
    const existing = merged.get(row.date);
    merged.set(
      row.date,
      existing
        ? {
            date: row.date,
            seconds: existing.seconds + row.seconds,
            sessions: existing.sessions + row.sessions,
          }
        : row,
    );
  }
  return [...merged.values()];
};

export const getWeeklyPlaytime = async (req: Request, res: Response) => {
  try {
    const { offset, today } = req.cleanQuery as WeekStatsQueryType;
    const userId = req.user.id;

    // Parse once; all date math below uses this Date.
    const todayDate = parseISO(today);

    // Monday-based week containing `today`, moved back `offset` weeks.
    const weekStartDate = startOfWeek(subWeeks(todayDate, offset), {
      weekStartsOn: 1,
    });

    // Convert to strings once, here. Used for the DB range, output and comparisons.
    const weekStart = toDay(weekStartDate);
    const weekEnd = toDay(addDays(weekStartDate, 6));
    const prevStart = toDay(subWeeks(weekStartDate, 1));
    const rangeEnd = toDay(addDays(weekStartDate, 7));
    const todayKey = toDay(todayDate);

    const playthroughDayKey = sql<string>`to_char(${playthroughSession.playDate}, 'YYYY-MM-DD')`;
    const casualDayKey = sql<string>`to_char(${casualSession.playDate}, 'YYYY-MM-DD')`;

    const [
      playthroughDayRows,
      casualDayRows,
      playthroughStreakRows,
      casualStreakRows,
    ] = await Promise.all([
      // Playthrough sessions: the viewed week and the week before it.
      db
        .select({
          date: playthroughDayKey,
          seconds: sql<number>`coalesce(sum(${playthroughSession.secondsPlayed}), 0)::int`,
          sessions: sql<number>`count(*)::int`,
        })
        .from(playthroughSession)
        .where(
          and(
            eq(playthroughSession.userId, userId),
            gte(playthroughSession.playDate, sql`${prevStart}::timestamp`),
            lt(playthroughSession.playDate, sql`${rangeEnd}::timestamp`),
            notInArchivedCollection(),
          ),
        )
        .groupBy(playthroughDayKey),

      // Casual sessions: same range.
      db
        .select({
          date: casualDayKey,
          seconds: sql<number>`coalesce(sum(${casualSession.secondsPlayed}), 0)::int`,
          sessions: sql<number>`count(*)::int`,
        })
        .from(casualSession)
        .where(
          and(
            eq(casualSession.userId, userId),
            gte(casualSession.playDate, sql`${prevStart}::timestamp`),
            lt(casualSession.playDate, sql`${rangeEnd}::timestamp`),
            casualNotInArchivedCollection(),
          ),
        )
        .groupBy(casualDayKey),

      // Distinct play days for the streak, newest first.
      db
        .selectDistinct({ date: playthroughDayKey })
        .from(playthroughSession)
        .where(
          and(eq(playthroughSession.userId, userId), notInArchivedCollection()),
        )
        .orderBy(desc(playthroughDayKey))
        .limit(MAX_STREAK_LOOKBACK),

      db
        .selectDistinct({ date: casualDayKey })
        .from(casualSession)
        .where(
          and(
            eq(casualSession.userId, userId),
            casualNotInArchivedCollection(),
          ),
        )
        .orderBy(desc(casualDayKey))
        .limit(MAX_STREAK_LOOKBACK),
    ]);

    const dayRows = mergeDayRows(playthroughDayRows, casualDayRows);
    const byDate = new Map(dayRows.map((r) => [r.date, r]));

    const days = eachDayOfInterval({
      start: weekStartDate,
      end: addDays(weekStartDate, 6),
    }).map((d) => {
      const date = toDay(d);
      const row = byDate.get(date);
      return { date, seconds: row?.seconds ?? 0, sessions: row?.sessions ?? 0 };
    });

    // ISO date strings sort lexicographically, so string comparison is safe.
    const previousWeekTotalSeconds = dayRows
      .filter((r) => r.date >= prevStart && r.date < weekStart)
      .reduce((sum, r) => sum + r.seconds, 0);

    const playDays = new Set([
      ...playthroughStreakRows.map((r) => r.date),
      ...casualStreakRows.map((r) => r.date),
    ]);

    return res.json({
      weekStart,
      weekEnd,
      days,
      totalSeconds: days.reduce((sum, d) => sum + d.seconds, 0),
      activeDays: days.filter((d) => d.seconds > 0).length,
      previousWeekTotalSeconds,
      streak: {
        current: currentStreak(playDays, todayDate),
        playedToday: playDays.has(todayKey),
      },
    });
  } catch (err) {
    req.log.error({ err }, "GET_WEEKLY_PLAYTIME_STATS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
