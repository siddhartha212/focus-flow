import { Task, Capture, Habit, HabitLog, SomedayItem, WeeklyNote, Note } from "@/types/productivity";
import { format, subDays, startOfWeek } from "date-fns";

const STORAGE_KEYS = {
  TASKS: 'ff_tasks',
  CAPTURES: 'ff_captures',
  HABITS: 'ff_habits',
  HABIT_LOGS: 'ff_habit_logs',
  SOMEDAY: 'ff_someday',
  WEEKLY_NOTES: 'ff_weekly_notes',
  NOTES: 'ff_notes',
  TAGS: 'ff_tags',
  CATEGORIES: 'ff_categories',
};

/** Safe JSON parser helper */
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.error(`Failed to parse storage key "${key}":`, err);
    return fallback;
  }
}

// Seed initial data if first load
export const initializeDataIfEmpty = () => {
  try {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
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
      ];
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(seedTasks));
    }

    if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
      const seedHabits: Habit[] = [
        { id: 'h-1', name: 'Hydrate 2.5L Water', emoji: '💧', frequencyType: 'daily', frequencyCount: 1, archived: false, createdAt: subDays(new Date(), 60).toISOString() },
        { id: 'h-2', name: 'Read 20 pages', emoji: '📖', frequencyType: 'daily', frequencyCount: 1, archived: false, createdAt: subDays(new Date(), 45).toISOString() },
        { id: 'h-3', name: '30 min Exercise', emoji: '🏋️‍♂️', frequencyType: 'weekly', frequencyCount: 4, archived: false, createdAt: subDays(new Date(), 30).toISOString() },
      ];
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(seedHabits));

      const seedLogs: HabitLog[] = [];
      for (let i = 0; i < 14; i++) {
        const logDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
        seedHabits.forEach((habit) => {
          if (Math.random() > 0.3) {
            seedLogs.push({
              id: `hl-${habit.id}-${logDate}`,
              habitId: habit.id,
              date: logDate,
              completed: true,
            });
          }
        });
      }
      localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(seedLogs));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CAPTURES)) {
      const seedCaptures: Capture[] = [
        { id: 'c-1', text: 'Look into SQLite WAL mode for fast local read performance', tag: 'Tech', createdAt: new Date().toISOString(), archived: false },
        { id: 'c-2', text: 'Gift idea for mom: Handmade ceramics set', tag: 'Personal', createdAt: subDays(new Date(), 1).toISOString(), archived: false },
      ];
      localStorage.setItem(STORAGE_KEYS.CAPTURES, JSON.stringify(seedCaptures));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SOMEDAY)) {
      const seedSomeday: SomedayItem[] = [
        { id: 's-1', title: 'Atomic Habits by James Clear', category: 'Books', note: 'Recommended for habit stacking techniques', status: 'active', createdAt: subDays(new Date(), 10).toISOString() },
        { id: 's-2', title: 'Kyoto, Japan - Fall Foliage Trip', category: 'Places', note: 'Best season is mid November', status: 'active', createdAt: subDays(new Date(), 15).toISOString() },
      ];
      localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(seedSomeday));
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
      const seedNotes: Note[] = [
        {
          id: 'note-1',
          title: '⚡ FocusFlow Operating Principles',
          content: '1. Keep tasks time-blocked in focus slots.\n2. Capture thoughts immediately into Inbox before evaluating.\n3. Maintain zero days logic for key daily habits.',
          category: 'Personal',
          pinned: true,
          color: 'emerald',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'note-2',
          title: '💡 Project Architectural Ideas',
          content: 'Consider offline-first local storage sync with PWA capabilities. All photos and media should be saved as compressed Base64 strings to guarantee cross-session persistence.',
          category: 'Work',
          pinned: false,
          color: 'blue',
          createdAt: subDays(new Date(), 1).toISOString(),
          updatedAt: subDays(new Date(), 1).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(seedNotes));
    }

    if (!localStorage.getItem(STORAGE_KEYS.WEEKLY_NOTES)) {
      const seedNotes: WeeklyNote[] = [
        {
          id: 'wn-1',
          weekStartDate: startOfWeekStr,
          noteText: 'Focus this week is finishing core feature designs and keeping sleep schedule consistent.',
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
  } catch (err) {
    console.error("Error initializing storage seed data:", err);
  }
};

// Robust Storage Getters
export const getTasks = (): Task[] => safeParse<Task[]>(STORAGE_KEYS.TASKS, []);
export const saveTasks = (tasks: Task[]) => localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));

export const getCaptures = (): Capture[] => safeParse<Capture[]>(STORAGE_KEYS.CAPTURES, []);
export const saveCaptures = (captures: Capture[]) => localStorage.setItem(STORAGE_KEYS.CAPTURES, JSON.stringify(captures));

export const getHabits = (): Habit[] => safeParse<Habit[]>(STORAGE_KEYS.HABITS, []);
export const saveHabits = (habits: Habit[]) => localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));

export const getHabitLogs = (): HabitLog[] => safeParse<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
export const saveHabitLogs = (logs: HabitLog[]) => localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));

export const getSomedayItems = (): SomedayItem[] => safeParse<SomedayItem[]>(STORAGE_KEYS.SOMEDAY, []);
export const saveSomedayItems = (items: SomedayItem[]) => localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(items));

export const getWeeklyNotes = (): WeeklyNote[] => safeParse<WeeklyNote[]>(STORAGE_KEYS.WEEKLY_NOTES, []);
export const saveWeeklyNotes = (notes: WeeklyNote[]) => localStorage.setItem(STORAGE_KEYS.WEEKLY_NOTES, JSON.stringify(notes));

export const getNotes = (): Note[] => safeParse<Note[]>(STORAGE_KEYS.NOTES, []);
export const saveNotes = (notes: Note[]) => localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));

export const getTags = (): string[] => safeParse<string[]>(STORAGE_KEYS.TAGS, ['Tech', 'Personal', 'Work']);
export const addTag = (tag: string) => {
  const current = getTags();
  if (!current.includes(tag)) {
    const updated = [...current, tag];
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(updated));
  }
};

export const getCategories = (): string[] => safeParse<string[]>(STORAGE_KEYS.CATEGORIES, ['Books', 'Places', 'Projects', 'Ideas']);
export const addCategory = (category: string) => {
  const current = getCategories();
  if (!current.includes(category)) {
    const updated = [...current, category];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
  }
};