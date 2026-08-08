import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCalendar, type CalendarSystem, type CalendarViewMode } from "@/context/CalendarContext";
import {
  getBsCalendarMonth,
  getAdCalendarMonth,
  getAdWeekDays,
  getBsWeekDays,
  formatDualDate,
  addAdDays,
  addBsMonths,
  adDateToBs,
  bsDateToAd,
  toDevanagariNumerals,
  NEPALI_MONTHS_EN,
  NEPALI_MONTHS_NP,
  type BsDate,
} from "@/utils/nepaliDate";
import { useLanguage } from "@/context/LanguageContext";

interface DualCalendarViewProps {
  /** Called when user picks a date (always AD canonical) */
  onDateSelect?: (date: Date) => void;
  compact?: boolean;
}

export const DualCalendarView: React.FC<DualCalendarViewProps> = ({
  onDateSelect,
  compact = false,
}) => {
  const { language } = useLanguage();
  const {
    defaultCalendar,
    setDefaultCalendar,
    numeralStyle,
    setNumeralStyle,
    viewMode,
    setViewMode,
    selectedDate,
    selectedBsDate,
    setSelectedDate,
    setSelectedBsDate,
  } = useCalendar();

  const useDevanagari = numeralStyle === "devanagari" || language === "np";
  const fmtNum = (n: number | string) =>
    useDevanagari ? toDevanagariNumerals(n) : String(n);

  const handleSelectAd = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleSelectBs = (bs: BsDate) => {
    const ad = bsDateToAd(bs);
    setSelectedDate(ad);
    onDateSelect?.(ad);
  };

  const navigatePrev = () => {
    if (viewMode === "month") {
      if (defaultCalendar === "BS") {
        setSelectedBsDate(addBsMonths(selectedBsDate, -1));
      } else {
        setSelectedDate(
          new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, selectedDate.getDate())
        );
      }
    } else if (viewMode === "week") {
      setSelectedDate(subDays(selectedDate, 7));
    } else {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      if (defaultCalendar === "BS") {
        setSelectedBsDate(addBsMonths(selectedBsDate, 1));
      } else {
        setSelectedDate(
          new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate())
        );
      }
    } else if (viewMode === "week") {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const headerLabel = useMemo(() => {
    if (viewMode === "day") {
      return formatDualDate(selectedDate, defaultCalendar, {
        language,
        numerals: numeralStyle,
        includeWeekday: true,
      });
    }
    if (viewMode === "week") {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const we = endOfWeek(selectedDate, { weekStartsOn: 0 });
      if (defaultCalendar === "BS") {
        const bsStart = adDateToBs(ws);
        const bsEnd = adDateToBs(we);
        const mName = language === "np" ? NEPALI_MONTHS_NP[bsStart.month - 1] : NEPALI_MONTHS_EN[bsStart.month - 1];
        return `${mName} ${fmtNum(bsStart.day)} – ${fmtNum(bsEnd.day)}, ${fmtNum(bsStart.year)}`;
      }
      return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
    }
    if (defaultCalendar === "BS") {
      const mName =
        language === "np"
          ? NEPALI_MONTHS_NP[selectedBsDate.month - 1]
          : NEPALI_MONTHS_EN[selectedBsDate.month - 1];
      return `${mName} ${fmtNum(selectedBsDate.year)}`;
    }
    return format(selectedDate, "MMMM yyyy");
  }, [selectedDate, selectedBsDate, defaultCalendar, viewMode, language, numeralStyle, fmtNum]);

  const secondaryLabel = useMemo(() => {
    if (defaultCalendar === "BS") {
      return formatDualDate(selectedDate, "AD", { language, numerals: numeralStyle });
    }
    return formatDualDate(selectedDate, "BS", { language, numerals: numeralStyle });
  }, [selectedDate, defaultCalendar, language, numeralStyle]);

  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm", compact ? "p-3" : "p-4")}>
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={navigatePrev} className="h-8 w-8 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[140px]">
            <p className="text-sm font-semibold">{headerLabel}</p>
            <p className="text-[10px] text-primary/80">{secondaryLabel}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={navigateNext} className="h-8 w-8 rounded-full">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {(["AD", "BS"] as CalendarSystem[]).map((sys) => (
            <Badge
              key={sys}
              variant={defaultCalendar === sys ? "default" : "outline"}
              className="cursor-pointer text-[10px] px-2 py-0.5"
              onClick={() => setDefaultCalendar(sys)}
            >
              {sys}
            </Badge>
          ))}
          {(["month", "week", "day"] as CalendarViewMode[]).map((mode) => (
            <Badge
              key={mode}
              variant={viewMode === mode ? "secondary" : "outline"}
              className="cursor-pointer text-[10px] px-2 py-0.5 capitalize"
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </Badge>
          ))}
          <Badge
            variant={numeralStyle === "devanagari" ? "secondary" : "outline"}
            className="cursor-pointer text-[10px] px-2 py-0.5"
            onClick={() =>
              setNumeralStyle(numeralStyle === "devanagari" ? "english" : "devanagari")
            }
          >
            {numeralStyle === "devanagari" ? "०१२" : "012"}
          </Badge>
        </div>
      </div>

      {/* View content */}
      {viewMode === "month" && defaultCalendar === "BS" && (
        <BsMonthGrid
          bs={selectedBsDate}
          selectedDate={selectedDate}
          onSelect={handleSelectBs}
          useDevanagari={useDevanagari}
          language={language}
        />
      )}
      {viewMode === "month" && defaultCalendar === "AD" && (
        <AdMonthGrid
          date={selectedDate}
          onSelect={handleSelectAd}
          useDevanagari={useDevanagari}
          language={language}
        />
      )}
      {viewMode === "week" && (
        <WeekGrid
          selectedDate={selectedDate}
          defaultCalendar={defaultCalendar}
          onSelectAd={handleSelectAd}
          useDevanagari={useDevanagari}
          language={language}
        />
      )}
      {viewMode === "day" && (
        <DayView
          selectedDate={selectedDate}
          defaultCalendar={defaultCalendar}
          useDevanagari={useDevanagari}
          language={language}
        />
      )}
    </div>
  );
};

function BsMonthGrid({
  bs,
  selectedDate,
  onSelect,
  useDevanagari,
  language,
}: {
  bs: BsDate;
  selectedDate: Date;
  onSelect: (bs: BsDate) => void;
  useDevanagari: boolean;
  language: string;
}) {
  const cal = getBsCalendarMonth(bs.year, bs.month, { locale: language === "np" ? "ne" : "en" });
  const selectedBs = adDateToBs(selectedDate);
  const fmt = (n: number) => (useDevanagari ? toDevanagariNumerals(n) : String(n));

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {cal.weekdayHeadersShort.map((h) => (
          <div key={h} className="text-[10px] text-center font-semibold text-muted-foreground py-1">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cal.weeks.flatMap((w) => w.days).map((cell) => {
          const isSelected =
            cell.bs.year === selectedBs.year &&
            cell.bs.month === selectedBs.month &&
            cell.bs.day === selectedBs.day;
          return (
            <button
              key={`${cell.bs.year}-${cell.bs.month}-${cell.bs.day}`}
              type="button"
              onClick={() => onSelect(cell.bs)}
              className={cn(
                "rounded-lg p-1.5 text-center transition-all min-h-[44px] flex flex-col items-center justify-center",
                !cell.isCurrentMonth && "opacity-40",
                cell.isToday && !isSelected && "ring-1 ring-primary/40",
                isSelected && "bg-primary text-primary-foreground shadow-sm",
                cell.isSaturday && !isSelected && "text-rose-500"
              )}
            >
              <span className="text-xs font-semibold">{fmt(cell.bs.day)}</span>
              <span className="text-[9px] opacity-70">{fmt(cell.adDay)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AdMonthGrid({
  date,
  onSelect,
  useDevanagari,
  language,
}: {
  date: Date;
  onSelect: (d: Date) => void;
  useDevanagari: boolean;
  language: string;
}) {
  const days = getAdCalendarMonth(date.getFullYear(), date.getMonth() + 1);
  const selectedStr = format(date, "yyyy-MM-dd");
  const fmt = (n: number) => (useDevanagari ? toDevanagariNumerals(n) : String(n));
  const weekdays =
    language === "np"
      ? ["आ", "सो", "म", "बु", "बि", "श", "श"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekdays.map((h) => (
          <div key={h} className="text-[10px] text-center font-semibold text-muted-foreground py-1">
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((cell) => {
          const cellStr = format(cell.date, "yyyy-MM-dd");
          const isSelected = cellStr === selectedStr;
          return (
            <button
              key={cellStr}
              type="button"
              onClick={() => onSelect(cell.date)}
              className={cn(
                "rounded-lg p-1.5 text-center transition-all min-h-[44px] flex flex-col items-center justify-center",
                !cell.isCurrentMonth && "opacity-40",
                cell.isToday && !isSelected && "ring-1 ring-primary/40",
                isSelected && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <span className="text-xs font-semibold">{fmt(cell.date.getDate())}</span>
              <span className="text-[9px] opacity-70">{fmt(cell.bs.day)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({
  selectedDate,
  defaultCalendar,
  onSelectAd,
  useDevanagari,
  language,
}: {
  selectedDate: Date;
  defaultCalendar: CalendarSystem;
  onSelectAd: (d: Date) => void;
  useDevanagari: boolean;
  language: string;
}) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const adDays = getAdWeekDays(weekStart);
  const fmt = (n: number) => (useDevanagari ? toDevanagariNumerals(n) : String(n));

  return (
    <div className="grid grid-cols-7 gap-1">
      {adDays.map((d) => {
        const bs = adDateToBs(d);
        const isSelected = format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
        const isToday = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
        const primary =
          defaultCalendar === "BS"
            ? fmt(bs.day)
            : fmt(d.getDate());
        const secondary =
          defaultCalendar === "BS"
            ? fmt(d.getDate())
            : fmt(bs.day);

        return (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => onSelectAd(d)}
            className={cn(
              "rounded-xl p-2 text-center border transition-all",
              isSelected && "bg-primary text-primary-foreground border-primary",
              isToday && !isSelected && "ring-1 ring-primary/40",
              !isSelected && "hover:border-primary/40"
            )}
          >
            <p className="text-[10px] opacity-70">
              {language === "np"
                ? ["आ", "सो", "म", "बु", "बि", "श", "श"][d.getDay()]
                : format(d, "EEE")}
            </p>
            <p className="text-sm font-bold">{primary}</p>
            <p className="text-[10px] opacity-70">{secondary}</p>
          </button>
        );
      })}
    </div>
  );
}

function DayView({
  selectedDate,
  defaultCalendar,
  useDevanagari,
  language,
}: {
  selectedDate: Date;
  defaultCalendar: CalendarSystem;
  useDevanagari: boolean;
  language: string;
}) {
  const bs = adDateToBs(selectedDate);
  const fmt = (n: number) => (useDevanagari ? toDevanagariNumerals(n) : String(n));

  return (
    <div className="text-center py-4 space-y-2">
      <p className="text-3xl font-bold">
        {defaultCalendar === "BS"
          ? fmt(bs.day)
          : fmt(selectedDate.getDate())}
      </p>
      <p className="text-sm text-muted-foreground">
        {formatDualDate(selectedDate, "AD", {
          language,
          numerals: useDevanagari ? "devanagari" : "english",
          includeWeekday: true,
        })}
      </p>
      <p className="text-sm text-primary font-medium">
        {formatDualDate(selectedDate, "BS", {
          language,
          numerals: useDevanagari ? "devanagari" : "english",
          includeWeekday: true,
        })}
      </p>
    </div>
  );
}

export { getBsWeekDays };
