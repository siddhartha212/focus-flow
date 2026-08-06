import React from "react";
import { Plus, Calendar, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getNepaliDateString } from "@/utils/nepaliDate";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/context/LanguageContext";

interface NavbarProps {
  onQuickCapture: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickCapture }) => {
  const { language, setLanguage, t } = useLanguage();
  const todayFormatted = format(new Date(), "EEEE, MMM d, yyyy");
  const nepaliDate = getNepaliDateString(new Date());

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "np" : "en");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md px-4 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/20">
            <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight flex items-center gap-1.5">
              {t("appTitle")}
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                {t("appSubtitle")}
              </span>
            </h1>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
              <Calendar className="w-3 h-3 text-primary" />
              <span>{todayFormatted}</span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-primary/90 font-semibold">
                {nepaliDate.formattedNP} ({nepaliDate.bsMonthName} {nepaliDate.bsDay})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="rounded-full px-2.5 h-8 text-xs font-semibold gap-1 hover:bg-primary/10 transition-transform active:scale-95"
            title="Switch Language / भाषा फेर्नुहोस्"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>{language === "en" ? "नेपाली" : "English"}</span>
          </Button>

          <ThemeToggle />

          <Button
            onClick={onQuickCapture}
            size="sm"
            className="rounded-full gap-1.5 shadow-sm font-medium hover:scale-105 transition-transform text-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("quickCapture")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};