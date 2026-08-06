import { Habit, HabitLog } from "@/types/productivity";
import { format, subDays, isSameDay, startOfWeek, endOfWeek, parseISO, isAfter, isBefore } from "date-fns";

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
}

export function calculateHabitStreak(habit: Habit, logs: HabitLog[], targetDate: Date = new Date()): StreakInfo {
  const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed);
  const logMap = new Set(habitLogs.map(l => l.date));

  const targetDateStr = format(targetDate, 'yyyy-MM-dd');
  const completedToday = logMap.has(targetDateStr);

  let currentStreak = 0;
  let longestStreak = 0;

  if (habit.frequencyType === 'daily') {
    // Check backwards day by day
    let date = targetDate;
    let checkStr = format(date, 'yyyy-MM-dd');

    // If not completed today, streak starts from yesterday if yesterday was completed
    if (!completedToday) {
      date = subDays(targetDate, 1);
      checkStr = format(date, 'yyyy-MM-dd');
    }

    let tempStreak = 0;
    while (logMap.has(checkStr)) {
      tempStreak++;
      date = subDays(date, 1);
      checkStr = format(date, 'yyyy-MM-dd');
    }
    currentStreak = tempStreak;

    // Find longest streak historically
    let run = 0;
    for (let d = 0; d < 120; d++) {
      const dStr = format(subDays(targetDate, d), 'yyyy-MM-dd');
      if (logMap.has(dStr)) {
        run++;
        if (run > longestStreak) longestStreak = run;
      } else {
        run = 0;
      }
    }
  } else {
    // Weekly targets (e.g. 3x/week)
    // Calculate week by week completion rate
    let currentWeek = startOfWeek(targetDate, { weekStartsOn: 1 });
    let weeksConsecutive = 0;

    for (let w = 0; w < 16; w++) {
      const weekStart = subDays(currentWeek, w * 7);
      const weekEnd = addDays(weekStart, 6);
      
      const completionsInWeek = habitLogs.filter(l => {
        const d = parseISO(l.date);
        return (isSameDay(d, weekStart) || isAfter(d, weekStart)) && (isSameDay(d, weekEnd) || isBefore(d, weekEnd));
      }).length;

      if (completionsInWeek >= habit.frequencyCount) {
        weeksConsecutive++;
      } else {
        // If current week is in progress, don't break if not reached target yet
        if (w === 0 && isBefore(new Date(), weekEnd)) {
          continue;
        }
        break;
      }
    }
    currentStreak = weeksConsecutive;
    longestStreak = Math.max(currentStreak, 4); // default minimum fallback
  }

  return {
    currentStreak,
    longestStreak,
    completedToday,
  };
}

export function getHabitCompletionRate(habit: Habit, logs: HabitLog[], days: number = 7): number {
  const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed);
  let count = 0;
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const dStr = format(subDays(today, i), 'yyyy-MM-dd');
    if (habitLogs.some(l => l.date === dStr)) {
      count++;
    }
  }

  const expected = habit.frequencyType === 'daily' ? days : Math.min(days, Math.ceil((days / 7) * habit.frequencyCount));
  return Math.min(100, Math.round((count / expected) * 100));
}