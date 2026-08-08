/**
 * Accurate Bikram Sambat (BS) ↔ Gregorian (AD) date engine.
 * Powered by nepali-date-pro-max (verified lookup tables, BS 1975–2099).
 * Future BS years can be added by updating the library — no converter rewrite needed.
 */
import {
  NepaliDate,
  adToBs,
  bsToAd,
  toDevanagariDigits,
  BS_MONTH_NAMES,
  BS_MONTH_NAMES_NP,
  getCalendarMonth,
  getCalendarDay,
  eachDayOfInterval,
  type BsDate,
  type AdDate,
  type CalendarMonth,
  type CalendarDayCell,
} from "nepali-date-pro-max";
import { format, parseISO } from "date-fns";

export type { BsDate, AdDate, CalendarMonth, CalendarDayCell };

export const NEPALI_MONTHS_EN = BS_MONTH_NAMES;
export const NEPALI_MONTHS_NP = BS_MONTH_NAMES_NP;

export function toDevanagariNumerals(num: number | string): string {
  return toDevanagariDigits(num);
}

/** Convert AD Date → BS date parts */
export function adDateToBs(date: Date): BsDate {
  return adToBs(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/** Convert BS date → AD Date (local midnight) */
export function bsDateToAd(bs: BsDate): Date {
  const ad = bsToAd(bs.year, bs.month, bs.day);
  return new Date(ad.year, ad.month - 1, ad.day);
}

/** Format AD date as YYYY-MM-DD */
export function formatAdDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Parse YYYY-MM-DD to Date */
export function parseAdDateStr(str: string): Date {
  return parseISO(str);
}

export interface NepaliDateDisplay {
  formattedNP: string;
  formattedEN: string;
  bsYear: number;
  bsMonth: number;
  bsMonthName: string;
  bsMonthNameNP: string;
  bsDay: number;
  adDate: Date;
}

/**
 * Backward-compatible display helper used across the app.
 */
export function getNepaliDateString(date: Date = new Date()): NepaliDateDisplay {
  const bs = adDateToBs(date);
  const monthIndex = bs.month - 1;
  const bsMonthEN = NEPALI_MONTHS_EN[monthIndex];
  const bsMonthNP = NEPALI_MONTHS_NP[monthIndex];

  const formattedNP = `${bsMonthNP} ${toDevanagariNumerals(bs.day)}, ${toDevanagariNumerals(bs.year)}`;
  const formattedEN = `${bsMonthEN} ${bs.day}, ${bs.year} BS`;

  return {
    formattedNP,
    formattedEN,
    bsYear: bs.year,
    bsMonth: bs.month,
    bsMonthName: bsMonthEN,
    bsMonthNameNP: bsMonthNP,
    bsDay: bs.day,
    adDate: date,
  };
}

/** Format a date for display in either calendar system */
export function formatDualDate(
  date: Date,
  system: "AD" | "BS",
  options: {
    language?: "en" | "np";
    numerals?: "english" | "devanagari";
    includeWeekday?: boolean;
  } = {}
): string {
  const { language = "en", numerals = "english", includeWeekday = false } = options;
  const useDevanagari = numerals === "devanagari" || language === "np";
  const nd = NepaliDate.fromJsDate(date);
  const locale = useDevanagari ? "ne" : "en";

  if (system === "BS") {
    const pattern = includeWeekday ? "dddd, DD MMMM YYYY" : "DD MMMM YYYY";
    return nd.locale(locale).format(pattern);
  }

  const adFmt = includeWeekday ? "EEEE, MMMM d, yyyy" : "MMMM d, yyyy";
  const adStr = format(date, adFmt);
  if (useDevanagari) {
    return adStr.replace(/\d/g, (d) => toDevanagariNumerals(d));
  }
  return adStr;
}

/** Build BS month calendar grid */
export function getBsCalendarMonth(
  year: number,
  month: number,
  options?: { locale?: "en" | "ne" }
): CalendarMonth {
  return getCalendarMonth(year, month, {
    locale: options?.locale === "ne" ? "ne" : "en",
    weekStartsOn: 0,
    padding: true,
  });
}

/** Build AD month grid with BS equivalents on each cell */
export function getAdCalendarMonth(
  year: number,
  month: number
): { date: Date; bs: BsDate; isCurrentMonth: boolean; isToday: boolean }[] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = first.getDay();
  const days: { date: Date; bs: BsDate; isCurrentMonth: boolean; isToday: boolean }[] = [];

  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - startPad);

  const todayStr = formatAdDateStr(new Date());

  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push({
      date: d,
      bs: adDateToBs(d),
      isCurrentMonth: d.getMonth() === month - 1,
      isToday: formatAdDateStr(d) === todayStr,
    });
  }
  return days;
}

/** Week days starting from a given AD date (7 days) */
export function getAdWeekDays(startDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
}

/** Week days in BS starting from a BS date */
export function getBsWeekDays(startBs: BsDate): BsDate[] {
  const start = NepaliDate.fromBs(startBs.year, startBs.month, startBs.day);
  const end = start.addDays(6);
  return eachDayOfInterval({ start, end }).map((d) => d.toBs());
}

export function getCalendarDayCell(date: Date): CalendarDayCell {
  return getCalendarDay(NepaliDate.fromJsDate(date));
}

/** Add/subtract days in AD, always returning a Date */
export function addAdDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Navigate BS month */
export function addBsMonths(bs: BsDate, delta: number): BsDate {
  const nd = NepaliDate.fromBs(bs.year, bs.month, bs.day).addMonths(delta);
  return nd.toBs();
}

/** Check if BS date is valid for its month */
export function isValidBsDate(bs: BsDate): boolean {
  try {
    bsToAd(bs.year, bs.month, bs.day);
    return true;
  } catch {
    return false;
  }
}
