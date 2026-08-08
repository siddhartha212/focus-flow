import React, { useState, useEffect } from "react";
import {
  Task,
  Capture,
  CaptureMedia,
  Habit,
  HabitLog,
  SomedayItem,
  WeeklyNote,
  Note,
} from "@/types/productivity";
import {
  initializeDataIfEmpty,
  getTasks,
  saveTasks,
  getCaptures,
  saveCaptures,
  getHabits,
  saveHabits,
  getHabitLogs,
  saveHabitLogs,
  getSomedayItems,
  saveSomedayItems,
  getWeeklyNotes,
  saveWeeklyNotes,
  getTags,
  addTag,
  getCategories,
  addCategory,
  getNotes,
  saveNotes,
  trashNote,
  restoreNote,
  permanentlyDeleteNote,
} from "@/services/storage";
import { Navbar } from "@/components/layout/Navbar";
import { BottomBar, TabType } from "@/components/layout/BottomBar";
import { TodayPlanner } from "@/components/today/TodayPlanner";
import { QuickCapture } from "@/components/capture/QuickCapture";
import { NotesSection } from "@/components/notes/NotesSection";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { WeeklyReview } from "@/components/review/WeeklyReview";
import { SomedayList } from "@/components/someday/SomedayList";
import { format } from "date-fns";
import { useCalendar } from "@/context/CalendarContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const { setSelectedDate } = useCalendar();

  const [tasks, setTasksState] = useState<Task[]>([]);
  const [captures, setCapturesState] = useState<Capture[]>([]);
  const [notes, setNotesState] = useState<Note[]>([]);
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogsState] = useState<HabitLog[]>([]);
  const [somedayItems, setSomedayItemsState] = useState<SomedayItem[]>([]);
  const [weeklyNotes, setWeeklyNotesState] = useState<WeeklyNote[]>([]);
  const [tags, setTagsState] = useState<string[]>([]);
  const [categories, setCategoriesState] = useState<string[]>([]);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  useEffect(() => {
    initializeDataIfEmpty();
    setTasksState(getTasks());
    setCapturesState(getCaptures());
    setNotesState(getNotes());
    setHabitsState(getHabits());
    setHabitLogsState(getHabitLogs());
    setSomedayItemsState(getSomedayItems());
    setWeeklyNotesState(getWeeklyNotes());
    setTagsState(getTags());
    setCategoriesState(getCategories());
  }, []);

  const updateTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    saveTasks(newTasks);
  };

  const updateCaptures = (newCaptures: Capture[]) => {
    setCapturesState(newCaptures);
    saveCaptures(newCaptures);
  };

  const updateNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
    saveNotes(newNotes);
  };

  const updateHabits = (newHabits: Habit[]) => {
    setHabitsState(newHabits);
    saveHabits(newHabits);
  };

  const updateHabitLogs = (newLogs: HabitLog[]) => {
    setHabitLogsState(newLogs);
    saveHabitLogs(newLogs);
  };

  const updateSomeday = (newSomeday: SomedayItem[]) => {
    setSomedayItemsState(newSomeday);
    saveSomedayItems(newSomeday);
  };

  const updateWeeklyNotes = (newNotes: WeeklyNote[]) => {
    setWeeklyNotesState(newNotes);
    saveWeeklyNotes(newNotes);
  };

  const handleAddTask = (newTaskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddCapture = (text: string, tag: string, media?: CaptureMedia) => {
    const newCap: Capture = {
      id: `cap-${Date.now()}`,
      text,
      tag,
      media,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    updateCaptures([newCap, ...captures]);
  };

  const handleAddTag = (newTag: string) => {
    addTag(newTag);
    setTagsState(getTags());
  };

  const handleConvertToTask = (capture: Capture) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    handleAddTask({
      title: capture.text,
      date: todayStr,
      completed: false,
    });
    updateCaptures(
      captures.map((c) =>
        c.id === capture.id ? { ...c, archived: true, convertedToTaskId: `task-${Date.now()}` } : c
      )
    );
    setActiveTab("today");
  };

  const handleConvertToNote = (capture: Capture) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: capture.text.slice(0, 60) || "Capture Note",
      content: capture.text + (capture.media ? `\n\n[${capture.media.type} attachment included]` : ""),
      category: capture.tag,
      noteType: "idea",
      tags: [capture.tag],
      pinned: false,
      favorite: false,
      archived: false,
      color: "amber",
      linkedCaptureId: capture.id,
      createdAt: now,
      updatedAt: now,
    };
    updateNotes([newNote, ...notes]);
    updateCaptures(
      captures.map((c) => (c.id === capture.id ? { ...c, archived: true } : c))
    );
    setOpenNoteId(newNote.id);
    setActiveTab("notes");
  };

  const handleArchiveCapture = (id: string) => {
    updateCaptures(captures.map((c) => (c.id === id ? { ...c, archived: true } : c)));
  };

  const handleDeleteCapture = (id: string) => {
    updateCaptures(captures.filter((c) => c.id !== id));
  };

  const handleAddNote = (noteData: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newNote: Note = { ...noteData, id: `note-${Date.now()}`, createdAt: now, updatedAt: now };
    updateNotes([newNote, ...notes]);
  };

  const handleUpdateNote = (note: Note) => {
    updateNotes(notes.map((n) => (n.id === note.id ? note : n)));
  };

  const handleDeleteNote = (id: string) => {
    updateNotes(trashNote(notes, id));
  };

  const handleRestoreNote = (id: string) => {
    updateNotes(restoreNote(notes, id));
  };

  const handlePermanentDeleteNote = (id: string) => {
    updateNotes(permanentlyDeleteNote(notes, id));
  };

  const handleAddHabit = (newHabitData: Omit<Habit, "id" | "createdAt" | "archived">) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    updateHabits([...habits, newHabit]);
  };

  const handleToggleHabitLog = (habitId: string, dateStr: string) => {
    const existingIndex = habitLogs.findIndex((l) => l.habitId === habitId && l.date === dateStr);
    let newLogs: HabitLog[];
    if (existingIndex >= 0) {
      newLogs = [...habitLogs];
      newLogs[existingIndex] = { ...newLogs[existingIndex], completed: !newLogs[existingIndex].completed };
    } else {
      newLogs = [...habitLogs, { id: `hl-${habitId}-${dateStr}`, habitId, date: dateStr, completed: true }];
    }
    updateHabitLogs(newLogs);
  };

  const handleArchiveHabit = (habitId: string) => {
    updateHabits(habits.map((h) => (h.id === habitId ? { ...h, archived: true } : h)));
  };

  const handleAddSomedayItem = (itemData: Omit<SomedayItem, "id" | "createdAt" | "status">) => {
    const newItem: SomedayItem = {
      ...itemData,
      id: `someday-${Date.now()}`,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    updateSomeday([newItem, ...somedayItems]);
  };

  const handleAddCategory = (newCat: string) => {
    addCategory(newCat);
    setCategoriesState(getCategories());
  };

  const handleToggleSomedayStatus = (id: string) => {
    updateSomeday(
      somedayItems.map((item) =>
        item.id === id ? { ...item, status: item.status === "active" ? "done" : "active" } : item
      )
    );
  };

  const handleDeleteSomedayItem = (id: string) => {
    updateSomeday(somedayItems.filter((i) => i.id !== id));
  };

  const handleSaveWeeklyNote = (weekStartDate: string, text: string) => {
    const existingIndex = weeklyNotes.findIndex((n) => n.weekStartDate === weekStartDate);
    let newNotes: WeeklyNote[];
    if (existingIndex >= 0) {
      newNotes = [...weeklyNotes];
      newNotes[existingIndex] = { ...newNotes[existingIndex], noteText: text };
    } else {
      newNotes = [...weeklyNotes, { id: `wn-${Date.now()}`, weekStartDate, noteText: text }];
    }
    updateWeeklyNotes(newNotes);
  };

  const activeCapturesCount = captures.filter((c) => !c.archived).length;

  const linkedNotesForToday = notes.filter(
    (n) => !n.deletedAt && !n.archived && n.linkedTaskIds?.some((tid) => tasks.some((t) => t.id === tid))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20">
      <Navbar onQuickCapture={() => setActiveTab("capture")} activeTab={activeTab} />

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {activeTab === "today" && (
          <TodayPlanner
            tasks={tasks}
            notes={linkedNotesForToday}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onOpenNote={(id) => {
              setOpenNoteId(id);
              setActiveTab("notes");
            }}
            onDateChange={setSelectedDate}
          />
        )}

        {activeTab === "capture" && (
          <QuickCapture
            captures={captures}
            tags={tags}
            onAddCapture={handleAddCapture}
            onAddTag={handleAddTag}
            onConvertToTask={handleConvertToTask}
            onConvertToNote={handleConvertToNote}
            onArchiveCapture={handleArchiveCapture}
            onDeleteCapture={handleDeleteCapture}
          />
        )}

        {activeTab === "notes" && (
          <NotesSection
            notes={notes}
            tasks={tasks}
            habits={habits}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onRestoreNote={handleRestoreNote}
            onPermanentDelete={handlePermanentDeleteNote}
            initialNoteId={openNoteId}
            onClearInitialNote={() => setOpenNoteId(null)}
          />
        )}

        {activeTab === "habits" && (
          <HabitTracker
            habits={habits}
            logs={habitLogs}
            onAddHabit={handleAddHabit}
            onToggleHabitLog={handleToggleHabitLog}
            onArchiveHabit={handleArchiveHabit}
          />
        )}

        {activeTab === "review" && (
          <WeeklyReview
            tasks={tasks}
            captures={captures}
            habits={habits}
            logs={habitLogs}
            weeklyNotes={weeklyNotes}
            onSaveWeeklyNote={handleSaveWeeklyNote}
          />
        )}

        {activeTab === "someday" && (
          <SomedayList
            items={somedayItems}
            categories={categories}
            onAddItem={handleAddSomedayItem}
            onAddCategory={handleAddCategory}
            onToggleStatus={handleToggleSomedayStatus}
            onDeleteItem={handleDeleteSomedayItem}
          />
        )}
      </main>

      <BottomBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unreadCapturesCount={activeCapturesCount}
      />
    </div>
  );
};

export default Index;
