import { Task, Capture, Habit, HabitLog, SomedayItem, WeeklyNote } from "@/types/productivity";
import { format, subDays, startOfWeek, addDays } from "date-fns";

const STORAGE_KEYS = {
  TASKS: 'ff_tasks',
  CAPTURES: 'ff_captures',
  HABITS: 'ff_habits',
  HABIT_LOGS: 'ff_habit_logs',
  SOMEDAY: 'ff_someday',
  WEEKLY_NOTES: 'ff_weekly_notes',
  TAGS: 'ff_tags',
  CATEGORIES: 'ff_categories',
};

// Seed initial data if first load
export const initializeDataIfEmpty = () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const startOfWeekStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    const seedTasks: Task[] = [
      {
        id: 't-1',
        title: 'Morning Deep Work: Core Module Architecture',
        date: todayStr,
        startTime: '08:00',
        endTime: '10:00',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-2',
        title: 'Team Sync & Product Design Review',
        date: todayStr,
        startTime: '11:00',
        endTime: '12:00',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-3',
        title: 'Gym Session - Legs & Core',
        date: todayStr,
        startTime: '17:00',
        endTime: '18:30',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-4',
        title: 'Review PRs for API refactor',
        date: todayStr,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-5',
        title: 'Update weekly financial budget',
        date: todayStr,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't-6',
        title: 'Read chapter 4 of Designing Data-Intensive Apps',
        date: yesterdayStr,
        startTime: '20:00',
        endTime: '21:00',
        completed: true,
        createdAt: subDays(new Date(), 1).toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));
  }

  if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
    const seedHabits: Habit[] = [
      { id: 'h-1', name: 'Hydrate 2.5L Water', emoji: '💧', frequencyType: 'daily', frequencyCount: 1, archived: false, createdAt: subDays(new Date(), 60).toISOString() },
      { id: 'h-2', name: 'Read 20 pages', emoji: '📖', frequencyType: 'daily', frequencyCount: 1, archived: false, createdAt: subDays(new Date(), 45).toISOString() },
      { id: 'h-3', name: '30 min Exercise', emoji: '🏋️‍♂️', frequencyType: 'weekly', frequencyCount: 4, archived: false, createdAt: subDays(new Date(), 30).toISOString() },
      { id: 'h-4', name: '10 min Meditation', emoji: '🧘', frequencyType: 'daily', frequencyCount: 1, archived: false, createdAt: subDays(new Date(), 20).toISOString() },
      { id: 'h-5', name: 'Zero Afternoon Sugar', emoji: '🥗', frequencyType: 'daily', frequencyCount: 1, archived: false, createdAt: subDays(new Date(), 15).toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(seedHabits));

    // Seed habit logs over the past 30 days
    const seedLogs: HabitLog[] = [];
    for (let i = 0; i < 40; i++) {
      const logDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
      // random log entries with higher probability for recent days
      seedHabits.forEach((habit) => {
        const pass = Math.random() > (i > 20 ? 0.35 : 0.2);
        if (pass) {
          seedLogs.push({
            id: `hl-${habit.id}-${logDate}`,
            habitId: habit.id,
            date: logDate,
            completed: true,
          });
        }
      });
    }
    // ensure today has hydration completed
    seedLogs.push({
      id: `hl-h-1-${todayStr}`,
      habitId: 'h-1',
      date: todayStr,
      completed: true,
    });
    localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(seedLogs));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CAPTURES)) {
    const seedCaptures: Capture[] = [
      { id: 'c-1', text: 'Look into SQLite WAL mode for fast local read performance', tag: 'Tech', createdAt: new Date().toISOString(), archived: false },
      { id: 'c-2', text: 'Gift idea for mom: Handmade ceramics set', tag: 'Personal', createdAt: subDays(new Date(), 1).toISOString(), archived: false },
      { id: 'c-3', text: 'Try Japanese soufflé pancake recipe this weekend', tag: 'Food', createdAt: subDays(new Date(), 2).toISOString(), archived: false },
      { id: 'c-4', text: 'Podcast recommendation: The Tim Ferriss Show #712', tag: 'Media', createdAt: subDays(new Date(), 3).toISOString(), archived: false },
    ];
    localStorage.setItem(STORAGE_KEYS.CAPTURES, JSON.stringify(seedCaptures));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SOMEDAY)) {
    const seedSomeday: SomedayItem[] = [
      { id: 's-1', title: 'Atomic Habits by James Clear', category: 'Books', note: 'Recommended for habit stacking techniques', status: 'active', createdAt: subDays(new Date(), 10).toISOString() },
      { id: 's-2', title: 'Kyoto, Japan - Fall Foliage Trip', category: 'Places', note: 'Best season is mid November', status: 'active', createdAt: subDays(new Date(), 15).toISOString() },
      { id: 's-3', title: 'Build a custom Mechanical Keyboard', category: 'Projects', note: 'Gateron Oil Kings switches + GMMK Pro board', status: 'active', createdAt: subDays(new Date(), 20).toISOString() },
      { id: 's-4', title: 'Learn Basic Spanish for Travel', category: 'Ideas', note: 'Duolingo + 15 min daily Pimsleur audio', status: 'active', createdAt: subDays(new Date(), 25).toISOString() },
      { id: 's-5', title: 'Dune: Part Two in IMAX', category: 'Media', note: 'Watch on largest cinema screen available', status: 'done', createdAt: subDays(new Date(), 30).toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(seedSomeday));
  }

  if (!localStorage.getItem(STORAGE_KEYS.WEEKLY_NOTES)) {
    const seedNotes: WeeklyNote[] = [
      {
        id: 'wn-1',
        weekStartDate: startOfWeekStr,
        noteText: 'Focus this week is finishing core feature designs and keeping sleep schedule consistent. Good momentum on morning time-blocks.',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.WEEKLY_NOTES, JSON.stringify(seedNotes));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(['Tech', 'Personal', 'Work', 'Food', 'Health', 'Media']));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(['Books', 'Places', 'Projects', 'Ideas', 'Media']));
  }
};

// Helper getter & setters
export const getTasks = (): Task[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
export const saveTasks = (tasks: Task[]) => localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

export const getCaptures = (): Capture[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CAPTURES) || '[]');
export const saveCaptures = (captures: Capture[]) => localStorage.setItem(STORAGE_KEYS.CAPTURES, JSON.stringify(captures));

export const getHabits = (): Habit[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
export const saveHabits = (habits: Habit[]) => localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));

export const getHabitLogs = (): HabitLog[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.HABIT_LOGS) || '[]');
export const saveHabitLogs = (logs: HabitLog[]) => localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));

export const getSomedayItems = (): SomedayItem[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SOMEDAY) || '[]');
export const saveSomedayItems = (items: SomedayItem[]) => localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(items));

export const getWeeklyNotes = (): WeeklyNote[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.WEEKLY_NOTES) || '[]');
export const saveWeeklyNotes = (notes: WeeklyNote[]) => localStorage.setItem(STORAGE_KEYS.WEEKLY_NOTES, JSON.stringify(notes));

export const getTags = (): string[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
export const addTag = (tag: string) => {
  const current = getTags();
  if (!current.includes(tag)) {
    const updated = [...current, tag];
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updated));
  }
};

export const getCategories = (): string[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
export const addCategory = (category: string) => {
  const current = getCategories();
  if (!current.includes(category)) {
    const updated = [...current, category];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  }
};