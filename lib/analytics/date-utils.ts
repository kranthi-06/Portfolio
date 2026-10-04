import { subDays, startOfDay, endOfDay, subMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const ANALYTICS_TIMEZONE = "Asia/Kolkata";

/**
 * Get the current time in the analytics timezone
 */
export function getAnalyticsNow(): Date {
  return toZonedTime(new Date(), ANALYTICS_TIMEZONE);
}

/**
 * Parse a date range string into start/end ISO strings using the analytics timezone
 */
export function parseAnalyticsRange(range: string | null): { start: string; end: string } {
  const now = getAnalyticsNow();
  const end = endOfDay(now).toISOString();
  let start: Date;

  switch (range) {
    case "today":
      start = startOfDay(now);
      break;
    case "yesterday":
      start = startOfDay(subDays(now, 1));
      break;
    case "7":
      start = startOfDay(subDays(now, 7));
      break;
    case "30":
      start = startOfDay(subDays(now, 30));
      break;
    case "90":
      start = startOfDay(subDays(now, 90));
      break;
    case "all":
      start = new Date("2020-01-01");
      break;
    default:
      start = startOfDay(subDays(now, 30));
  }

  return { start: start.toISOString(), end };
}

/**
 * Get the active window threshold (e.g., for "active now" calculations)
 */
export function getActiveThreshold(windowMinutes: number = 5): string {
  return subMinutes(getAnalyticsNow(), windowMinutes).toISOString();
}