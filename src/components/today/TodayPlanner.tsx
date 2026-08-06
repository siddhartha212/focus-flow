import React, { useState } from "react";
import { Task } from "@/types/productivity";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Calendar as CalendarIcon,
  Flame,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess } from "@/utils/toast";
import { getNepaliDateString } from "@/utils/nepaliDate";
import { FocusTimerModal } from "./FocusTimerModal";
import { useLanguage } from "@/context/LanguageContext";

interface TodayPlannerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export const TodayPlanner: React.FC<TodayPlannerProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState<string>("none");

  // Focus Timer task target
  const [focusTaskTarget, setFocusTaskTarget] = useState<Task | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = format(new Date(), "yyyy-MM-dd") === selectedDateStr;
  const nepaliDate = getNepaliDateString(selectedDate);

  const daysTasks = tasks.filter((t) => t.date === selectedDateStr);
  const unscheduledTasks = daysTasks.filter((t) => !t.startTime);
  const scheduledTasks = daysTasks.filter((t) => !!t.startTime);

  const handlePrevDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));
  const handleTodayClick = () => setSelectedDate(new Date());

  const handleSaveNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let startTime: string | undefined = undefined;
    let endTime: string | undefined = undefined;

    if (newStartTime !== "none") {
      startTime = newStartTime;
      const hourNum = parseInt(newStartTime.split(":")[0]);
      endTime = `${(hourNum + 1).toString().padStart(2, "0")}:00`;
    }

    onAddTask({
      title: newTitle.trim(),
      date: selectedDateStr,
      startTime,
      endTime,
      completed: false,
    });

    setNewTitle("");
    setNewStartTime("none");
    setIsAddOpen(false);
    showSuccess("Task added");
  };

  const handleToggleTask = (task: Task) => {
    onUpdateTask({ ...task, completed: !task.completed });
  };

  const handleQuickScheduleSlot = (hour: number) => {
    const formattedHour = `${hour.toString().padStart(2, "0")}:00`;
    setNewStartTime(formattedHour);
    setIsAddOpen(true);
  };

  const handleScheduleUnscheduledTask = (task: Task, hourStr: string) => {
    const hourNum = parseInt(hourStr.split(":")[0]);
    const endTime = `${(hourNum + 1).toString().padStart(2, "0")}:00`;
    onUpdateTask({
      ...task,
      startTime: hourStr,
      endTime,
    });
    showSuccess(`${hourStr}`);
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-card p-3 rounded-2xl border shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevDay}
          className="rounded-full shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="text-center cursor-pointer" onClick={handleTodayClick}>
          <div className="text-sm font-semibold flex items-center justify-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-primary" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </div>
          <div className="text-xs text-primary font-medium mt-0.5">
            {nepaliDate.formattedNP} ({nepaliDate.formattedEN})
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="text-xs h-8 px-2.5 rounded-full"
            >
              {t("today")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Unscheduled Tasks Tray */}
      <div className="bg-muted/40 border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{t("unscheduledTasks")}</h3>
            <Badge variant="secondary" className="rounded-full text-xs">
              {unscheduledTasks.length}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setNewStartTime("none");
              setIsAddOpen(true);
            }}
            className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
          >
            <Plus className="w-3.5 h-3.5" /> {t("quickAdd")}
          </Button>
        </div>

        {unscheduledTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-xl bg-background/50">
            {t("allTimeBlocked")}
          </p>
        ) : (
          <div className="space-y-2">
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between bg-card p-3 rounded-xl border shadow-sm hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <span
                    className={`text-sm font-medium truncate ${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <Select
                    onValueChange={(val) =>
                      handleScheduleUnscheduledTask(task, val)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs px-2 rounded-lg border-muted">
                      <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                      <span>{t("slot")}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => {
                        const hStr = `${h.toString().padStart(2, "0")}:00`;
                        return (
                          <SelectItem key={hStr} value={hStr}>
                            {h === 12
                              ? "12:00 PM"
                              : h > 12
                              ? `${h - 12}:00 PM`
                              : `${h}:00 AM`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly Timeline */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="font-semibold text-sm">{t("hourlyTimeline")}</h3>
          <span className="text-xs text-muted-foreground">6 AM — 11 PM</span>
        </div>

        <div className="relative border-l-2 border-primary/20 ml-12 pl-4 space-y-4 py-2">
          {HOURS.map((hour) => {
            const timeLabel =
              hour === 12
                ? "12 PM"
                : hour > 12
                ? `${hour - 12} PM`
                : `${hour} AM`;

            const tasksInSlot = scheduledTasks.filter((t) => {
              if (!t.startTime) return false;
              const taskStartHour = parseInt(t.startTime.split(":")[0]);
              return taskStartHour === hour;
            });

            return (
              <div key={hour} className="relative group min-h-[52px]">
                {/* Time Label on left */}
                <span className="absolute -left-16 top-1 text-xs font-semibold text-muted-foreground w-10 text-right">
                  {timeLabel}
                </span>

                {/* Timeline node circle */}
                <div className="absolute -left-[21px] top-2.5 w-3 h-3 rounded-full bg-background border-2 border-primary/40 group-hover:border-primary group-hover:scale-125 transition-all" />

                {/* Content Box */}
                <div className="space-y-2">
                  {tasksInSlot.length > 0 ? (
                    tasksInSlot.map((task) => (
                      <Card
                        key={task.id}
                        className={`transition-all border shadow-xs ${
                          task.completed
                            ? "bg-muted/30 opacity-75"
                            : "bg-card border-primary/30 hover:border-primary"
                        }`}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(task)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`text-sm font-medium leading-tight ${
                                  task.completed
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {task.title}
                              </p>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 inline" />
                                {task.startTime}{" "}
                                {task.endTime ? `- ${task.endTime}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {!task.completed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFocusTaskTarget(task)}
                                className="h-7 text-xs gap-1 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 rounded-full"
                              >
                                <Flame className="w-3.5 h-3.5 fill-amber-500" /> {t("focus")}
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteTask(task.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <button
                      onClick={() => handleQuickScheduleSlot(hour)}
                      className="w-full text-left text-xs text-muted-foreground/60 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-xl border border-dashed border-transparent hover:border-primary/30 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t("scheduleTaskAt")} {timeLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Focus Timer Modal */}
      <FocusTimerModal
        task={focusTaskTarget}
        onClose={() => setFocusTaskTarget(null)}
        onCompleteTask={(t) => handleToggleTask({ ...t, completed: true })}
      />

      {/* Add Task Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addTaskTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveNewTask} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("taskDescription")}
              </label>
              <Input
                placeholder={t("taskPlaceholder")}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("timeSlot")}
              </label>
              <Select
                value={newStartTime}
                onValueChange={setNewStartTime}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("unscheduledTray")}</SelectItem>
                  {HOURS.map((h) => {
                    const hStr = `${h.toString().padStart(2, "0")}:00`;
                    return (
                      <SelectItem key={hStr} value={hStr}>
                        {h === 12
                          ? "12:00 PM"
                          : h > 12
                          ? `${h - 12}:00 PM`
                          : `${h}:00 AM`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">{t("add")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};