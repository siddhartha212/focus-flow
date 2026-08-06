import React, { useState } from "react";
import { Habit, HabitLog } from "@/types/productivity";
import {
  calculateHabitStreak,
  getHabitCompletionRate,
} from "@/utils/habitUtils";
import {
  Zap,
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Archive,
  BarChart,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface HabitTrackerProps {
  habits: Habit[];
  logs: HabitLog[];
  onAddHabit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => void;
  onToggleHabitLog: (habitId: string, dateStr: string) => void;
  onArchiveHabit: (habitId: string) => void;
}

const EMOJI_OPTIONS = ["💧", "📖", "🏋️‍♂️", "🧘", "🥗", "🏃‍♂️", "💻", "🎨", "💤", "✍️"];

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  logs,
  onAddHabit,
  onToggleHabitLog,
  onArchiveHabit,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💧");
  const [frequencyType, setFrequencyType] = useState<"daily" | "weekly">("daily");
  const [frequencyCount, setFrequencyCount] = useState<number>(1);

  const activeHabits = habits.filter((h) => !h.archived);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddHabit({
      name: name.trim(),
      emoji,
      frequencyType,
      frequencyCount,
    });

    setName("");
    setIsAddOpen(false);
    showSuccess("New Habit Started!");
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            Habits & Consistency
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Build strong daily momentum and break zero days.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-full gap-1 shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </div>

      {/* Habit Cards List */}
      <div className="space-y-3">
        {activeHabits.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-card">
            <Zap className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-sm">No habits configured</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start small with 1 or 2 high-impact habits.
            </p>
          </div>
        ) : (
          activeHabits.map((habit) => {
            const streakInfo = calculateHabitStreak(habit, logs);
            const rate = getHabitCompletionRate(habit, logs, 7);

            return (
              <Card
                key={habit.id}
                className="group transition-all hover:border-primary/40 shadow-xs"
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleHabitLog(habit.id, todayStr)}
                      className="shrink-0 transition-transform active:scale-95"
                    >
                      {streakInfo.completedToday ? (
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary flex items-center justify-center text-muted-foreground">
                          <Circle className="w-6 h-6" />
                        </div>
                      )}
                    </button>

                    <div
                      className="min-w-0 cursor-pointer flex-1"
                      onClick={() => setSelectedHabitForDetail(habit)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{habit.emoji}</span>
                        <h3 className="font-semibold text-sm truncate">
                          {habit.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {streakInfo.currentStreak}{" "}
                          {habit.frequencyType === "daily" ? "day streak" : "wk streak"}
                        </span>
                        <span>•</span>
                        <span>
                          {habit.frequencyType === "daily"
                            ? "Daily"
                            : `${habit.frequencyCount}x / week`}
                        </span>
                        <span>•</span>
                        <span>7d: {rate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedHabitForDetail(habit)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Heatmap View"
                    >
                      <BarChart className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        onArchiveHabit(habit.id);
                        showSuccess("Habit archived");
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Habit Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateHabit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Habit Emoji
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition-all ${
                      emoji === e
                        ? "border-primary bg-primary/10 scale-110"
                        : "border-muted hover:border-foreground/30"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Habit Name
              </label>
              <Input
                placeholder="e.g. Read 20 pages"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Frequency
                </label>
                <Select
                  value={frequencyType}
                  onValueChange={(val: "daily" | "weekly") =>
                    setFrequencyType(val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Target</SelectItem>
                    <SelectItem value="weekly">Weekly Target</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {frequencyType === "weekly" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Times per week
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={7}
                    value={frequencyCount}
                    onChange={(e) =>
                      setFrequencyCount(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Start Habit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 90-Day Heatmap Detail Modal */}
      {selectedHabitForDetail && (
        <Dialog
          open={!!selectedHabitForDetail}
          onOpenChange={() => setSelectedHabitForDetail(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{selectedHabitForDetail.emoji}</span>
                <span>{selectedHabitForDetail.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center justify-around bg-muted/40 p-3 rounded-2xl border text-center">
                <div>
                  <p className="text-xl font-bold text-amber-600">
                    {
                      calculateHabitStreak(selectedHabitForDetail, logs)
                        .currentStreak
                    }
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Current Streak
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold text-primary">
                    {
                      calculateHabitStreak(selectedHabitForDetail, logs)
                        .longestStreak
                    }
                  </p>
                  <p className="text-[11px] text-muted-foreground">Best Streak</p>
                </div>

                <div>
                  <p className="text-xl font-bold text-emerald-600">
                    {getHabitCompletionRate(selectedHabitForDetail, logs, 30)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">30-Day Rate</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                  <span>90-Day Completion Matrix</span>
                  <span>Click box to toggle date</span>
                </h4>

                <div className="flex flex-wrap gap-1.5 p-3 border rounded-xl bg-card max-h-56 overflow-y-auto">
                  {Array.from({ length: 90 }, (_, i) => {
                    const d = subDays(new Date(), 89 - i);
                    const dStr = format(d, "yyyy-MM-dd");
                    const isCompleted = logs.some(
                      (l) => l.habitId === selectedHabitForDetail.id && l.date === dStr && l.completed
                    );

                    return (
                      <div
                        key={dStr}
                        onClick={() =>
                          onToggleHabitLog(selectedHabitForDetail.id, dStr)
                        }
                        title={`${format(d, "MMM d, yyyy")}: ${
                          isCompleted ? "Completed" : "Not completed"
                        }`}
                        className={`w-4 h-4 rounded-xs transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-500 shadow-xs scale-105"
                            : "bg-muted hover:bg-muted-foreground/30"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedHabitForDetail(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};