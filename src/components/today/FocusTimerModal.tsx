import React, { useState, useEffect } from "react";
import { Task } from "@/types/productivity";
import { Play, Pause, RotateCcw, CheckCircle2, Flame, Volume2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

interface FocusTimerModalProps {
  task: Task | null;
  onClose: () => void;
  onCompleteTask: (task: Task) => void;
}

const DEFAULT_POMODORO_SECONDS = 25 * 60; // 25 mins

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  task,
  onClose,
  onCompleteTask,
}) => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      showSuccess("Focus session finished! Great job!");
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  if (!task) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((DEFAULT_POMODORO_SECONDS - timeLeft) / DEFAULT_POMODORO_SECONDS) * 100;

  const handleToggleTimer = () => setIsRunning((prev) => !prev);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_POMODORO_SECONDS);
  };

  const handleFinishAndComplete = () => {
    onCompleteTask(task);
    onClose();
    showSuccess("Task completed!");
  };

  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center py-6">
        <DialogHeader className="items-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-base">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            Focus Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Task Info */}
          <div className="bg-muted/40 p-3 rounded-2xl border text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Target Task
            </p>
            <p className="font-bold text-sm text-foreground mt-0.5 truncate">
              {task.title}
            </p>
          </div>

          {/* Large Timer Dial */}
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center rounded-full border-4 border-primary/20 bg-card shadow-inner">
            <div
              className="absolute inset-0 rounded-full border-4 border-primary transition-all duration-1000"
              style={{
                clipPath: `inset(0 ${100 - progressPercent}% 0 0)`,
              }}
            />
            <div className="z-10">
              <div className="text-4xl font-extrabold font-mono tracking-tight text-foreground">
                {minutes.toString().padStart(2, "0")}:
                {seconds.toString().padStart(2, "0")}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {isRunning ? "Session in Progress" : "Ready to Focus"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="rounded-full w-10 h-10"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleToggleTimer}
              size="lg"
              className="rounded-full px-8 gap-2 shadow-md"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Focus
                </>
              )}
            </Button>
          </div>

          {/* Complete Task Option */}
          <div className="pt-2">
            <Button
              onClick={handleFinishAndComplete}
              variant="ghost"
              className="text-xs text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-full gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Task as Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};