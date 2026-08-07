import React from "react";
import { CalendarDays, Inbox, Zap, BarChart3, Bookmark, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export type TabType = "today" | "capture" | "notes" | "habits" | "review" | "someday";

interface BottomBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadCapturesCount?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  onChangeTab,
  unreadCapturesCount = 0,
}) => {
  const { t } = useLanguage();

  const tabs = [
    { id: "today" as TabType, label: t("today"), icon: CalendarDays },
    {
      id: "capture" as TabType,
      label: t("capture"),
      icon: Inbox,
      badge: unreadCapturesCount > 0 ? unreadCapturesCount : undefined,
    },
    { id: "notes" as TabType, label: t("notes"), icon: FileText },
    { id: "habits" as TabType, label: t("habits"), icon: Zap },
    { id: "review" as TabType, label: t("review"), icon: BarChart3 },
    { id: "someday" as TabType, label: t("someday"), icon: Bookmark },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t px-2 py-2 shadow-lg">
      <nav className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 min-w-[54px]",
                isActive
                  ? "text-primary font-semibold scale-105 bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isActive && "stroke-[2.5]")} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};