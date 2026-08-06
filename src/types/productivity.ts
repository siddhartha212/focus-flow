export type Task = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm format e.g. "09:00"
  endTime?: string; // HH:mm format e.g. "10:00"
  completed: boolean;
  createdAt: string;
};

export type Capture = {
  id: string;
  text: string;
  tag: string;
  createdAt: string; // ISO string
  convertedToTaskId?: string;
  archived: boolean;
};

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  frequencyType: 'daily' | 'weekly';
  frequencyCount: number; // e.g., 3 for 3x/week, or 1 for daily
  archived: boolean;
  createdAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
};

export type SomedayItem = {
  id: string;
  title: string;
  category: string; // e.g. Books, Places, Projects, Ideas
  note?: string;
  status: 'active' | 'done';
  createdAt: string;
};

export type WeeklyNote = {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  noteText: string;
};