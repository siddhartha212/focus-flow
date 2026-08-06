import React, { useState, useEffect } from "react";
import {
  Task,
  Capture,
  Habit,
  HabitLog,
  SomedayItem,
  WeeklyNote,
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
} from "@/services/storage";
import { Navbar } from "@/components/layout/Navbar";
import { BottomBar, TabType } from "@/components/layout/BottomBar";
import { TodayPlanner } from "@/components/today/TodayPlanner";
import { QuickCapture } from "@/components/capture/QuickCapture";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { WeeklyReview } from "@/components/review/WeeklyReview";
import { SomedayList } from "@/components/someday/SomedayList";
import { format } from "date-fns";
import { showSuccess } from "@/utils/toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today");

  // Local state initialized from storage
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [captures, setCapturesState] = useState<Capture[]>([]);
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogsState] = useState<HabitLog[]>([]);
  const [somedayItems, setSomedayItemsState] = useState<SomedayItem[]>([]);
  const [weeklyNotes, setWeeklyNotesState] = useState<WeeklyNote[]>([]);
  const [tags, setTagsState] = useState<string[]>([]);
  const [categories, setCategoriesState] = useState<string[]>([]);

  // Initialize data on mount
  useEffect(() => {
    initializeDataIfEmpty();
    setTasksState(getTasks());
    setCapturesState(getCaptures());
    setHabitsState(getHabits());
    setHabitLogsState(getHabitLogs());
    setSomedayItemsState(getSomedayItems());
    setWeeklyNotesState(getWeeklyNotes());
    setTagsState(getTags());
    setCategoriesState(getCategories());
  }, []);

  // Sync state helpers
  const updateTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
    saveTasks(newTasks);
  };

  const updateCaptures = (newCaptures: Capture[]) => {
    setCapturesState(newCaptures);
    saveCaptures(newCaptures);
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

  // --- Task Handlers ---
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

  // --- Capture Handlers ---
  const handleAddCapture = (text: string, tag: string) => {
    const newCap: Capture = {
      id: `cap-${Date.now()}`,
      text,
      tag,
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
    // Archive capture after converting
    updateCaptures(
      captures.map((c) =>
        c.id === capture.id ? { ...c, archived: true, convertedToTaskId: `task-${Date.now()}` } : c
      )
    );
    setActiveTab("today");
  };

  const handleArchiveCapture = (id: string) => {
    updateCaptures(
      captures.map((c) => (c.id === id ? { ...c, archived: true } : c))
    );
  };

  const handleDeleteCapture = (id: string) => {
    updateCaptures(captures.filter((c) => c.id !== id));
  };

  // --- Habit Handlers ---
  const handleAddHabit = (
    newHabitData: Omit<Habit, "id" | "createdAt" | "archived">
  ) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      archived: false,
      createdAt: new Date().toISOString(),
    };
    updateHabits([...habits, newHabit]);
  };

  const handleToggleHabitLog = (habitId: string, dateStr: string) => {
    const existingIndex = habitLogs.findIndex(
      (l) => l.habitId === habitId && l.date === dateStr
    );

    let newLogs: HabitLog[];
    if (existingIndex >= 0) {
      newLogs = [...habitLogs];
      newLogs[existingIndex] = {
        ...newLogs[existingIndex],
        completed: !newLogs[existingIndex].completed,
      };
    } else {
      newLogs = [
        ...habitLogs,
        {
          id: `hl-${habitId}-${dateStr}`,
          habitId,
          date: dateStr,
          completed: true,
        },
      ];
    }
    updateHabitLogs(newLogs);
  };

  const handleArchiveHabit = (habitId: string) => {
    updateHabits(
      habits.map((h) => (h.id === habitId ? { ...h, archived: true } : h))
    );
  };

  // --- Someday Handlers ---
  const handleAddSomedayItem = (
    itemData: Omit<SomedayItem, "id" | "createdAt" | "status">
  ) => {
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
        item.id === id
          ? { ...item, status: item.status === "active" ? "done" : "active" }
          : item
      )
    );
  };

  const handleDeleteSomedayItem = (id: string) => {
    updateSomeday(somedayItems.filter((i) => i.id !== id));
  };

  // --- Weekly Note Handler ---
  const handleSaveWeeklyNote = (weekStartDate: string, text: string) => {
    const existingIndex = weeklyNotes.findIndex(
      (n) => n.weekStartDate === weekStartDate
    );
    let newNotes: WeeklyNote[];
    if (existingIndex >= 0) {
      newNotes = [...weeklyNotes];
      newNotes[existingIndex] = { ...newNotes[existingIndex], noteText: text };
    } else {
      newNotes = [
        ...weeklyNotes,
        {
          id: `wn-${Date.now()}`,
          weekStartDate,
          noteText: text,
        },
      ];
    }
    updateWeeklyNotes(newNotes);
  };

  const activeCapturesCount = captures.filter((c) => !c.archived).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20">
      <Navbar
        onQuickCapture={() => setActiveTab("capture")}
        activeTab={activeTab}
      />

      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {activeTab === "today" && (
          <TodayPlanner
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === "capture" && (
          <QuickCapture
            captures={captures}
            tags={tags}
            onAddCapture={handleAddCapture}
            onAddTag={handleAddTag}
            onConvertToTask={handleConvertToTask}
            onArchiveCapture={handleArchiveCapture}
            onDeleteCapture={handleDeleteCapture}
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