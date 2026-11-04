import { GenericErrorMessage } from "@/constants";
import { db } from "@/db";
import { playthroughSession } from "@/db/schema";
import { WeekStatsQueryType } from "@repo/schemas/schemas/stats";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { Request, Response } from "express";

import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";

const toKey = (d: Date) => format(d, "yyyy-MM-dd");

/** Consecutive days with a session, ending today, or yesterday if today has none yet. */
const currentStreak = (days: Set<string>, today: string) => {
  const todayDate = parseISO(today);
  let cursor = days.has(today) ? todayDate : subDays(todayDate, 1);
  let count = 0;
  while (days.has(toKey(cursor))) {
    count++;
    cursor = subDays(cursor, 1);
  }
  return count;
};

export const getWeeklyPlaytime = async (req: Request, res: Response) => {
  try {
    const { offset, today } = req.cleanQuery as WeekStatsQueryType;

    const userId = req.user.id;

    // Monday-based week containing `today`, moved back `offset` weeks.
    const weekStartDate = startOfWeek(subWeeks(parseISO(today), offset), {
      weekStartsOn: 1,
    });
    const weekStart = toKey(weekStartDate);
    const weekEnd = toKey(addDays(weekStartDate, 6));
    const prevStart = toKey(subWeeks(weekStartDate, 1));
    const rangeEndExclusive = toKey(addDays(parseISO(weekEnd), 1));

    const dayKey = sql<string>`to_char(${playthroughSession.playDate}, 'YYYY-MM-DD')`;

    const [dayRows, streakRows] = await Promise.all([
      // One query for the viewed week + the week before it.
      db
        .select({
          date: dayKey,
          seconds: sql<number>`coalesce(sum(${playthroughSession.secondsPlayed}), 0)::int`,
          sessions: sql<number>`count(*)::int`,
        })
        .from(playthroughSession)
        .where(
          and(
            eq(playthroughSession.userId, userId),
            gte(playthroughSession.playDate, prevStart),
            lt(playthroughSession.playDate, rangeEndExclusive),
          ),
        )
        .groupBy(dayKey),

      db
        .selectDistinct({ date: dayKey })
        .from(playthroughSession)
        .where(eq(playthroughSession.userId, userId))
        .orderBy(desc(dayKey))
        .limit(400),
    ]);

    const byDate = new Map(dayRows.map((r) => [String(r.date), r]));

    const days = eachDayOfInterval({
      start: weekStartDate,
      end: addDays(weekStartDate, 6),
    }).map((d) => {
      const date = toKey(d);
      const row = byDate.get(date);
      return { date, seconds: row?.seconds ?? 0, sessions: row?.sessions ?? 0 };
    });

    const previousWeekTotalSeconds = dayRows
      .filter((r) => String(r.date) >= prevStart && String(r.date) < weekStart)
      .reduce((sum, r) => sum + r.seconds, 0);

    const playDays = new Set(streakRows.map((r) => String(r.date)));

    const result = {
      weekStart,
      weekEnd,
      days,
      totalSeconds: days.reduce((sum, d) => sum + d.seconds, 0),
      activeDays: days.filter((d) => d.seconds > 0).length,
      previousWeekTotalSeconds,
      streak: {
        current: currentStreak(playDays, today),
        playedToday: playDays.has(today),
      },
    };

    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "GET_WEEKLY_PLAYTIME_STATS_ERROR");
    return res.status(500).json({ error: GenericErrorMessage });
  }
};
