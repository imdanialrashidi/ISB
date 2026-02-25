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
