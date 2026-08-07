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

// Reference table mapping Bikram Sambat year details with exact day counts per month
// Data mapped for BS years 2075-2090
const bsCalendarMap: Record<number, { startAD: string; days: number[] }> = {
  2075: { startAD: "2018-04-14", days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2076: { startAD: "2019-04-14", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30] },
  2077: { startAD: "2020-04-13", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31] },
  2078: { startAD: "2021-04-14", days: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30] },
  2079: { startAD: "2022-04-14", days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2080: { startAD: "2023-04-14", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30] },
  2081: { startAD: "2024-04-13", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30] },
  2082: { startAD: "2025-04-14", days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2083: { startAD: "2026-04-14", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30] },
  2084: { startAD: "2027-04-14", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30] },
  2085: { startAD: "2028-04-13", days: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30] },
  2086: { startAD: "2029-04-14", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30] },
  2087: { startAD: "2030-04-14", days: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 30] },
};

/**
 * Converts a given AD Date object into precise Bikram Sambat (BS) date info
 */
export function getNepaliDateString(date: Date = new Date()): {
  formattedNP: string;
  formattedEN: string;
  bsYear: number;
  bsMonthName: string;
  bsDay: number;
} {
  const targetTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  // Find corresponding BS Year from calendar map
  let matchedBsYear = 2081;
  const sortedYears = Object.keys(bsCalendarMap)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < sortedYears.length; i++) {
    const yr = sortedYears[i];
    const startAD = new Date(bsCalendarMap[yr].startAD).getTime();
    const nextYr = sortedYears[i + 1];
    const nextStartAD = nextYr
      ? new Date(bsCalendarMap[nextYr].startAD).getTime()
      : startAD + 365 * 24 * 60 * 60 * 1000;

    if (targetTime >= startAD && targetTime < nextStartAD) {
      matchedBsYear = yr;
      break;
    }
  }

  const yrInfo = bsCalendarMap[matchedBsYear] || bsCalendarMap[2081];
  const startADTime = new Date(yrInfo.startAD).getTime();
  let remainingDays = Math.floor((targetTime - startADTime) / (1000 * 60 * 60 * 24));

  let bsMonthIndex = 0;
  for (let m = 0; m < yrInfo.days.length; m++) {
    if (remainingDays < yrInfo.days[m]) {
      bsMonthIndex = m;
      break;
    }
    remainingDays -= yrInfo.days[m];
  }

  const bsDay = remainingDays + 1;
  const bsMonthNP = nepaliMonthsNP[bsMonthIndex];
  const bsMonthEN = nepaliMonthsEN[bsMonthIndex];

  const formattedNP = `${bsMonthNP} ${toDevanagariNumerals(bsDay)}, ${toDevanagariNumerals(matchedBsYear)}`;
  const formattedEN = `${bsMonthEN} ${bsDay}, ${matchedBsYear} BS`;

  return {
    formattedNP,
    formattedEN,
    bsYear: matchedBsYear,
    bsMonthName: bsMonthEN,
    bsDay,
  };
}