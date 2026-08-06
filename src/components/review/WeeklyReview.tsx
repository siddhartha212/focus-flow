import React, { useState } from "react";
import { Task, Capture, Habit, HabitLog, WeeklyNote } from "@/types/productivity";
import { getHabitCompletionRate } from "@/utils/habitUtils";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Inbox,
  Zap,
  Sparkles,
  Save,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  addWeeks,
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { showSuccess } from "@/utils/toast";

interface WeeklyReviewProps {
  tasks: Task[];
  captures: Capture[];
  habits: Habit[];
  logs: HabitLog[];
  weeklyNotes: WeeklyNote[];
  onSaveWeeklyNote: (weekStartDate: string, text: string) => void;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({
  tasks,
  captures,
  habits,
  logs,
  weeklyNotes,
  onSaveWeeklyNote,
}) => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekStartStr = format(selectedWeekStart, "yyyy-MM-dd");
  const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const existingNote =
    weeklyNotes.find((n) => n.weekStartDate === weekStartStr)?.noteText || "";
  const [noteText, setNoteText] = useState(existingNote);

  // Sync note text when week changes
  React.useEffect(() => {
    setNoteText(
      weeklyNotes.find((n) => n.weekStartDate === weekStartStr)?.noteText || ""
    );
  }, [weekStartStr, weeklyNotes]);

  const handlePrevWeek = () => setSelectedWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setSelectedWeekStart((prev) => addWeeks(prev, 1));

  // Compute metrics for the selected week
  const weekTasks = tasks.filter((t) => {
    const d = parseISO(t.date);
    return (
      (isSameDay(d, selectedWeekStart) || isAfter(d, selectedWeekStart)) &&
      (isSameDay(d, weekEnd) || isBefore(d, weekEnd))
    );
  });
  const completedTasksCount = weekTasks.filter((t) => t.completed).length;
  const taskCompletionRate =
    weekTasks.length > 0
      ? Math.round((completedTasksCount / weekTasks.length) * 100)
      : 100;

  const weekCaptures = captures.filter((c) => {
    const d = parseISO(c.createdAt);
    return (
      (isSameDay(d, selectedWeekStart) || isAfter(d, selectedWeekStart)) &&
      (isSameDay(d, weekEnd) || isBefore(d, weekEnd))
    );
  });

  // Tag breakdown
  const tagCounts: Record<string, number> = {};
  weekCaptures.forEach((c) => {
    tagCounts[c.tag] = (tagCounts[c.tag] || 0) + 1;
  });

  // Overall habits performance
  const habitPerformance = habits
    .filter((h) => !h.archived)
    .map((h) => ({
      habit: h,
      rate: getHabitCompletionRate(h, logs, 7),
    }));

  const avgHabitRate =
    habitPerformance.length > 0
      ? Math.round(
          habitPerformance.reduce((acc, curr) => acc + curr.rate, 0) /
            habitPerformance.length
        )
      : 100;

  const handleSaveReflection = () => {
    onSaveWeeklyNote(weekStartStr, noteText);
    showSuccess("Reflection saved for this week!");
  };

  // Auto-generated summary sentence
  const generatedSummary = `This week (${format(
    selectedWeekStart,
    "MMM d"
  )} - ${format(
    weekEnd,
    "MMM d"
  )}), you completed ${completedTasksCount}/${weekTasks.length} planned tasks (${taskCompletionRate}%) and maintained an average habit score of ${avgHabitRate}%. You logged ${
    weekCaptures.length
  } quick captures.`;

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Week Selector Bar */}
      <div className="flex items-center justify-between bg-card p-3 rounded-2xl border shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevWeek}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <div className="text-sm font-semibold flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            Week of {format(selectedWeekStart, "MMM d")} -{" "}
            {format(weekEnd, "MMM d, yyyy")}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Auto Summary Card */}
      <Card className="bg-primary/5 border-primary/20 shadow-xs">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="w-4 h-4" /> AI Performance Brief
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {generatedSummary}
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center border shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold">
            {completedTasksCount}/{weekTasks.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Tasks Done</p>
        </Card>

        <Card className="p-3 text-center border shadow-xs">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{avgHabitRate}%</p>
          <p className="text-[11px] text-muted-foreground">Habit Score</p>
        </Card>

        <Card className="p-3 text-center border shadow-xs">
          <Inbox className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
          <p className="text-lg font-bold">{weekCaptures.length}</p>
          <p className="text-[11px] text-muted-foreground">Captures</p>
        </Card>
      </div>

      {/* Habits Breakdown */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border shadow-xs">
        <h3 className="font-semibold text-sm">Habit Consistency Breakdown</h3>
        <div className="space-y-3">
          {habitPerformance.map(({ habit, rate }) => (
            <div key={habit.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium flex items-center gap-1.5">
                  <span>{habit.emoji}</span> {habit.name}
                </span>
                <span className="font-semibold text-muted-foreground">
                  {rate}%
                </span>
              </div>
              <Progress value={rate} className="h-2 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Capture Breakdown by Tag */}
      {Object.keys(tagCounts).length > 0 && (
        <div className="space-y-3 bg-card p-4 rounded-2xl border shadow-xs">
          <h3 className="font-semibold text-sm">Captures by Tag</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagCounts).map(([tag, count]) => (
              <div
                key={tag}
                className="bg-muted px-3 py-1.5 rounded-xl text-xs flex items-center gap-2"
              >
                <span className="font-medium">{tag}</span>
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Reflections Notes */}
      <div className="space-y-3 bg-card p-4 rounded-2xl border shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Weekly Reflection Journal</h3>
          <Button
            size="sm"
            onClick={handleSaveReflection}
            className="h-8 gap-1 rounded-full text-xs"
          >
            <Save className="w-3.5 h-3.5" /> Save Reflections
          </Button>
        </div>

        <Textarea
          placeholder="What went well this week? What friction did you encounter? What will you adjust next week?"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={4}
          className="text-xs leading-relaxed rounded-xl resize-none"
        />
      </div>
    </div>
  );
};