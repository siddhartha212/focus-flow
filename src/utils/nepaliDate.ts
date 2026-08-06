// Bikram Sambat (BS) date converter utility
const nepaliMonthsEN = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const nepaliMonthsNP = [
  "वैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भाद्र",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
];

const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toDevanagariNumerals(num: number | string): string {
  return num
    .toString()
    .split("")
    .map((char) => {
      const digit = parseInt(char, 10);
      return isNaN(digit) ? char : devanagariDigits[digit];
    })
    .join("");
}

/**
 * Converts a Gregorian Date to an approximate Bikram Sambat (BS) date string
 */
export function getNepaliDateString(date: Date = new Date()): {
  formattedNP: string;
  formattedEN: string;
  bsYear: number;
  bsMonthName: string;
  bsDay: number;
} {
  // Approximate BS conversion logic (BS is ~56 years, 8 months ahead)
  const adYear = date.getFullYear();
  const adMonth = date.getMonth(); // 0-11
  const adDay = date.getDate();

  // Reference offset for 2024/2025 AD -> 2081 BS
  let bsYear = adYear + 56;
  let bsMonthIndex = (adMonth + 8) % 12;

  // New Year in BS happens around mid-April
  if (adMonth > 3 || (adMonth === 3 && adDay >= 13)) {
    bsYear = adYear + 57;
  }

  // Rough day approximation for Bikram Sambat month shift
  let bsDay = (adDay + 16) % 30;
  if (bsDay === 0) bsDay = 30;

  const bsMonthNP = nepaliMonthsNP[bsMonthIndex];
  const bsMonthEN = nepaliMonthsEN[bsMonthIndex];

  const formattedNP = `${bsMonthNP} ${toDevanagariNumerals(bsDay)}, ${toDevanagariNumerals(bsYear)}`;
  const formattedEN = `${bsMonthEN} ${bsDay}, ${bsYear} BS`;

  return {
    formattedNP,
    formattedEN,
    bsYear,
    bsMonthName: bsMonthEN,
    bsDay,
  };
}