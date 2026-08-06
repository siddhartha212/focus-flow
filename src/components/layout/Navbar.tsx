import React from "react";
import { Sparkles, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface NavbarProps {
  onQuickCapture: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickCapture }) => {
  const todayFormatted = format(new Date(), "EEEE, MMM d");

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/20">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight flex items-center gap-1.5">
              FocusFlow
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                Hub
              </span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 inline" /> {todayFormatted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onQuickCapture}
            size="sm"
            className="rounded-full gap-1.5 shadow-sm font-medium hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Capture</span>
          </Button>
        </div>
      </div>
    </header>
  );
};