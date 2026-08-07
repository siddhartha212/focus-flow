export type Task = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm format e.g. "09:00"
  endTime?: string; // HH:mm format e.g. "10:00"
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
};

export type CaptureMedia = {
  type: 'photo' | 'video' | 'audio';
  url: string; // Base64 Data URL or persistent URI
  name?: string;
  duration?: number;
};

export type Capture = {
  id: string;
  text: string;
  tag: string;
  createdAt: string; // ISO string
  convertedToTaskId?: string;
  archived: boolean;
  media?: CaptureMedia;
};

export type Habit = {
  id: string;
  name: string;
  emoji: string;
  frequencyType: 'daily' | 'weekly';
  frequencyCount: number;
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
  category: string;
  note?: string;
  status: 'active' | 'done';
  createdAt: string;
};

export type WeeklyNote = {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  noteText: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  category?: string;
  pinned?: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
};