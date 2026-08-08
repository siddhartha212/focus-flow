import React, { createContext, useContext, useState, useCallback } from "react";
import {
  adDateToBs,
  bsDateToAd,
  formatAdDateStr,
  parseAdDateStr,
  type BsDate,
} from "@/utils/nepaliDate";

export type CalendarSystem = "AD" | "BS";
export type NumeralStyle = "english" | "devanagari";
export type CalendarViewMode = "month" | "week" | "day";

interface CalendarContextType {
  defaultCalendar: CalendarSystem;
  setDefaultCalendar: (system: CalendarSystem) => void;
  numeralStyle: NumeralStyle;
  setNumeralStyle: (style: NumeralStyle) => void;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  /** Currently selected AD date (canonical storage format) */
  selectedDate: Date;
  /** Currently selected BS date (synchronized) */
  selectedBsDate: BsDate;
  setSelectedDate: (date: Date) => void;
  setSelectedBsDate: (bs: BsDate) => void;
  selectedDateStr: string;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const SETTINGS_KEY = "ff_calendar_settings";

interface CalendarSettings {
  defaultCalendar: CalendarSystem;
  numeralStyle: NumeralStyle;
  viewMode: CalendarViewMode;
}

function loadSettings(): CalendarSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { defaultCalendar: "AD", numeralStyle: "english", viewMode: "day" };
}

function saveSettings(settings: CalendarSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadSettings();
  const [defaultCalendar, setDefaultCalendarState] = useState<CalendarSystem>(
    initial.defaultCalendar
  );
  const [numeralStyle, setNumeralStyleState] = useState<NumeralStyle>(initial.numeralStyle);
  const [viewMode, setViewModeState] = useState<CalendarViewMode>(initial.viewMode);
  const [selectedDate, setSelectedDateState] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const selectedBsDate = adDateToBs(selectedDate);
  const selectedDateStr = formatAdDateStr(selectedDate);

  const persist = useCallback(
    (patch: Partial<CalendarSettings>) => {
      saveSettings({
        defaultCalendar,
        numeralStyle,
        viewMode,
        ...patch,
      });
    },
    [defaultCalendar, numeralStyle, viewMode]
  );

  const setDefaultCalendar = (system: CalendarSystem) => {
    setDefaultCalendarState(system);
    persist({ defaultCalendar: system });
  };

  const setNumeralStyle = (style: NumeralStyle) => {
    setNumeralStyleState(style);
    persist({ numeralStyle: style });
  };

  const setViewMode = (mode: CalendarViewMode) => {
    setViewModeState(mode);
    persist({ viewMode: mode });
  };

  const setSelectedDate = (date: Date) => {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setSelectedDateState(normalized);
  };

  const setSelectedBsDate = (bs: BsDate) => {
    const ad = bsDateToAd(bs);
    setSelectedDateState(ad);
  };

  return (
    <CalendarContext.Provider
      value={{
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
        selectedDateStr,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
};
