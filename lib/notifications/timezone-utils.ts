/**
 * Timezone utilities for notification scheduling
 */

/**
 * Get the user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a local time (HH:MM) to UTC for storage
 * @param localTime - Time in HH:MM format
 * @param timezone - User's timezone (defaults to current)
 * @returns UTC time in HH:MM format
 */
export function localTimeToUTC(localTime: string, timezone?: string): string {
  const tz = timezone || getUserTimezone();
  const [hours, minutes] = localTime.split(":").map(Number);

  // Create a date object for today in the target timezone
  const now = new Date();

  // Create date string in target timezone format
  const dateStr = now.toLocaleDateString("en-US", { timeZone: tz });
  const [month, day, year] = dateStr.split("/").map(Number);

  // Create a UTC date with the local time components
  const localInTargetTz = new Date(year, month - 1, day, hours, minutes);

  // Get the offset for the target timezone at this specific date/time
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Parse the formatted date to get the actual offset
  const parts = formatter.formatToParts(localInTargetTz);
  const tzHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const tzMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

  // Calculate offset between local interpretation and target timezone
  const offsetHours = hours - tzHour;
  const offsetMinutes = minutes - tzMinute;
  const totalOffsetMinutes = offsetHours * 60 + offsetMinutes;

  // Adjust to UTC
  const utcTime = new Date(localInTargetTz);
  utcTime.setMinutes(utcTime.getMinutes() + totalOffsetMinutes);

  return `${String(utcTime.getHours()).padStart(2, "0")}:${String(utcTime.getMinutes()).padStart(
    2,
    "0"
  )}`;
}

/**
 * Convert UTC time to local time for display
 * @param utcTime - Time in HH:MM format (UTC)
 * @param timezone - User's timezone (defaults to current)
 * @returns Local time in HH:MM format
 */
export function utcTimeToLocal(utcTime: string, timezone?: string): string {
  const tz = timezone || getUserTimezone();
  const [hours, minutes] = utcTime.split(":").map(Number);

  // Create a date object for today at the specified UTC time
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes)
  );

  // Convert to local timezone
  const localDate = new Date(utcDate.toLocaleString("en-US", { timeZone: tz }));

  return `${String(localDate.getHours()).padStart(2, "0")}:${String(
    localDate.getMinutes()
  ).padStart(2, "0")}`;
}

/**
 * Get the next occurrence of a specific time in the user's timezone
 * @param time - Time in HH:MM format (local time)
 * @param timezone - User's timezone (defaults to current)
 * @returns Date object for the next occurrence
 */
export function getNextOccurrence(time: string, _timezone?: string): Date {
  const [hours, minutes] = time.split(":").map(Number);

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

  // If the time has already passed today, schedule for tomorrow
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  return targetDate;
}

/**
 * Check if a reminder should be sent now
 * @param reminderTime - Time in HH:MM format (stored as local time)
 * @param lastSent - Last sent timestamp
 * @param timezone - User's timezone
 * @returns boolean indicating if reminder should be sent
 */
export function shouldSendReminder(
  reminderTime: string,
  lastSent: string | null,
  timezone: string
): boolean {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(":").map(Number);

  // Get the current time in the user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Parse the current time in the user's timezone
  const parts = formatter.formatToParts(now);
  const currentYear = parseInt(parts.find((p) => p.type === "year")?.value || "0");
  const currentMonth = parseInt(parts.find((p) => p.type === "month")?.value || "0") - 1; // 0-indexed
  const currentDay = parseInt(parts.find((p) => p.type === "day")?.value || "0");
  const currentHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const currentMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

  // Create date objects for comparison (both in the same reference frame)
  const currentTimeInTz = new Date(
    currentYear,
    currentMonth,
    currentDay,
    currentHour,
    currentMinute
  );
  const reminderTimeToday = new Date(currentYear, currentMonth, currentDay, hours, minutes);

  // Calculate the time difference in minutes
  const timeDiffMinutes =
    Math.abs(currentTimeInTz.getTime() - reminderTimeToday.getTime()) / (1000 * 60);
  const isWithinWindow = timeDiffMinutes <= 5; // Within 5 minutes

  // Debug logging
  console.log(`[shouldSendReminder] Checking reminder for timezone: ${timezone}`);
  console.log(
    `[shouldSendReminder] Current time in ${timezone}: ${currentHour}:${String(currentMinute).padStart(2, "0")}`
  );
  console.log(`[shouldSendReminder] Reminder time: ${hours}:${String(minutes).padStart(2, "0")}`);
  console.log(`[shouldSendReminder] Time difference: ${timeDiffMinutes} minutes`);
  console.log(`[shouldSendReminder] Within 5-minute window: ${isWithinWindow}`);

  if (!isWithinWindow) return false;

  // Check if we've already sent today in the user's timezone
  if (lastSent) {
    const lastSentDate = new Date(lastSent);

    // Get the last sent date in the user's timezone
    const lastSentParts = formatter.formatToParts(lastSentDate);
    const lastSentDay = parseInt(lastSentParts.find((p) => p.type === "day")?.value || "0");
    const lastSentMonth = parseInt(lastSentParts.find((p) => p.type === "month")?.value || "0") - 1;
    const lastSentYear = parseInt(lastSentParts.find((p) => p.type === "year")?.value || "0");

    const isSameDay =
      lastSentDay === currentDay && lastSentMonth === currentMonth && lastSentYear === currentYear;

    console.log(`[shouldSendReminder] Last sent: ${lastSent}`);
    console.log(`[shouldSendReminder] Already sent today: ${isSameDay}`);

    if (isSameDay) return false;
  }

  console.log(`[shouldSendReminder] ✅ Should send reminder: true`);
  return true;
}

/**
 * Format a date for display in the user's timezone
 * @param date - Date to format
 * @param timezone - User's timezone
 * @param format - Format options
 * @returns Formatted date string
 */
export function formatDateInTimezone(
  date: Date | string,
  timezone: string,
  format: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  }
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleString("en-US", { ...format, timeZone: timezone });
}

/**
 * Get timezone abbreviation (e.g., PST, EST)
 * @param timezone - IANA timezone string
 * @returns Timezone abbreviation
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(date);
  const timeZoneName = parts.find((part) => part.type === "timeZoneName");

  return timeZoneName?.value || timezone;
}
