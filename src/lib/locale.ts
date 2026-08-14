const enToFaDigits: Record<string, string> = {
  "0": "۰",
  "1": "۱",
  "2": "۲",
  "3": "۳",
  "4": "۴",
  "5": "۵",
  "6": "۶",
  "7": "۷",
  "8": "۸",
  "9": "۹",
};

export const toPersianDigits = (value: string | number): string =>
  String(value).replace(/\d/g, (digit) => enToFaDigits[digit] ?? digit);

export const formatFaDate = (value: string): string =>
  toPersianDigits(value).replaceAll("/", " / ");

export const normalizePhoneForDisplay = (value: string): string => {
  const digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("98") && digits.length === 12) {
    return `0${digits.slice(2)}`;
  }
  return digits;
};

export const compactWebsiteLabel = (value: string): string =>
  value.replace(/^https?:\/\//, "").replace(/\/$/, "");

const JALALI_MONTHS: Record<string, number> = {
  فروردین: 1,
  اردیبهشت: 2,
  خرداد: 3,
  تیر: 4,
  مرداد: 5,
  شهریور: 6,
  مهر: 7,
  آبان: 8,
  آذر: 9,
  دی: 10,
  بهمن: 11,
  اسفند: 12,
};

/** Max days per Jalaali month (months 1-6: 31, 7-11: 30, 12: 29/30). */
const JALALI_MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

const faToEnDigits = Object.fromEntries(
  Object.entries(enToFaDigits).map(([en, fa]) => [fa, en]),
);

const div = (a: number, b: number): number => Math.trunc(a / b);
const mod = (a: number, b: number): number => a - Math.trunc(a / b) * b;

// Standard Jalaali↔Gregorian algorithm (jalaali-js, public domain) — the same
// math used by Intl Persian calendars. Needed because schema.org dates must be
// ISO 8601 (Gregorian) while company content records Jalaali dates.
const jalaaliToJulianDay = (jy: number, jm: number, jd: number): number => {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm0 = 0;
  let jump = 0;
  for (let i = 1; i < breaks.length; i += 1) {
    jm0 = breaks[i];
    jump = jm0 - jp;
    if (jy < jm0) break;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm0;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  // Julian day number of the first day of the Jalaali year (1 Farvardin).
  const gregorianToJulianDay = (gYear: number, gMonth: number, gDay: number): number => {
    let d = div((gYear + div(gMonth - 8, 6) + 100100) * 1461, 4) +
      div(153 * mod(gMonth + 9, 12) + 2, 5) +
      gDay -
      34840408;
    d = d - div(div(gYear + 100100 + div(gMonth - 8, 6), 100) * 3, 4) + 752;
    return d;
  };

  return (
    gregorianToJulianDay(gy, 3, march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
  );
};

const julianDayToGregorian = (jdn: number): { year: number; month: number; day: number } => {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const day = div(mod(i, 153), 5) + 1;
  const month = mod(div(i, 153), 12) + 1;
  const year = div(j, 1461) - 100100 + div(8 - month, 6);
  return { year, month, day };
};

/**
 * Convert a Persian (Jalaali) calendar date to an ISO 8601 Gregorian date
 * string. Accepts the company content format "۲۴ تیر ۱۴۰۳" (day month year,
 * Persian digits). Returns undefined when the input does not match.
 */
export const jalaaliDateToIso = (value: string): string | undefined => {
  const normalized = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[۰-۹]/g, (digit) => faToEnDigits[digit] ?? digit);
  const match = normalized.match(/^(\d{1,2}) ([\u0600-\u06FF]+) (\d{4})$/);
  if (!match) return undefined;
  const day = Number(match[1]);
  const month = JALALI_MONTHS[match[2]];
  const year = Number(match[3]);
  if (!month || day < 1 || day > JALALI_MONTH_DAYS[month - 1] || year < 1200) return undefined;
  const gregorian = julianDayToGregorian(jalaaliToJulianDay(year, month, day));
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${gregorian.year}-${pad(gregorian.month)}-${pad(gregorian.day)}`;
};
