import React, { useState } from "react";
import { SomedayItem } from "@/types/productivity";
import {
  Bookmark,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Dice5,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

interface SomedayListProps {
  items: SomedayItem[];
  categories: string[];
  onAddItem: (item: Omit<SomedayItem, "id" | "createdAt" | "status">) => void;
  onAddCategory: (category: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const SomedayList: React.FC<SomedayListProps> = ({
  items,
  categories,
  onAddItem,
  onAddCategory,
  onToggleStatus,
  onDeleteItem,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [surpriseModalOpen, setSurpriseModalOpen] = useState(false);
  const [surprisePick, setSurprisePick] = useState<SomedayItem | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Ideas");
  const [note, setNote] = useState("");
  const [newCatInput, setNewCatInput] = useState("");
  const [showCatInput, setShowCatInput] = useState(false);

  const [showCompleted, setShowCompleted] = useState(false);

  const activeItems = items.filter((i) => i.status === "active");
  const completedItems = items.filter((i) => i.status === "done");

  const filteredActiveItems = activeItems.filter(
    (i) => selectedCategoryFilter === "all" || i.category === selectedCategoryFilter
  );

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddItem({
      title: title.trim(),
      category,
      note: note.trim() || undefined,
    });

    setTitle("");
    setNote("");
    setIsAddOpen(false);
    showSuccess("Saved to Someday / Maybe");
  };

  const handleCreateCategory = () => {
    if (!newCatInput.trim()) return;
    const clean = newCatInput.trim();
    onAddCategory(clean);
    setCategory(clean);
    setNewCatInput("");
    setShowCatInput(false);
  };

  const handleTriggerSurprise = () => {
    const pool =
      selectedCategoryFilter === "all"
        ? activeItems
        : activeItems.filter((i) => i.category === selectedCategoryFilter);

    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSurprisePick(pool[randomIndex]);
    setSurpriseModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            Someday / Maybe
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ideas, books, projects, and places for future inspiration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleTriggerSurprise}
            disabled={activeItems.length === 0}
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 shadow-xs text-xs"
          >
            <Dice5 className="w-4 h-4 text-purple-600" /> Surprise Me
          </Button>

          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="rounded-full gap-1 text-xs"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Badge
          variant={selectedCategoryFilter === "all" ? "default" : "outline"}
          className="cursor-pointer text-xs rounded-full px-3 py-1"
          onClick={() => setSelectedCategoryFilter("all")}
        >
          All Categories ({activeItems.length})
        </Badge>
        {categories.map((cat) => {
          const count = activeItems.filter((i) => i.category === cat).length;
          return (
            <Badge
              key={cat}
              variant={selectedCategoryFilter === cat ? "default" : "outline"}
              className="cursor-pointer text-xs rounded-full px-3 py-1"
              onClick={() => setSelectedCategoryFilter(cat)}
            >
              {cat} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Active Items List */}
      <div className="space-y-3">
        {filteredActiveItems.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-card">
            <Bookmark className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-sm">No items in this category</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add something you wish to explore someday!
            </p>
          </div>
        ) : (
          filteredActiveItems.map((item) => (
            <Card
              key={item.id}
              className="group transition-all hover:border-primary/40 shadow-xs"
            >
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition-colors"
                  >
                    <Circle className="w-5 h-5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    {item.note && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.note}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-[10px] rounded-md mt-2">
                      {item.category}
                    </Badge>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDeleteItem(item.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Completed Section Toggle */}
      {completedItems.length > 0 && (
        <div className="pt-4 space-y-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCompleted ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />)}
            Completed Someday Items ({completedItems.length})
          </button>

          {showCompleted && (
            <div className="space-y-2 opacity-75">
              {completedItems.map((item) => (
                <Card key={item.id} className="p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs line-through">{item.title}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDeleteItem(item.id)}
                      className="h-6 w-6 text-muted-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Someday Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Someday / Maybe</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateItem} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Item Title
              </label>
              <Input
                placeholder="e.g. Read 'Atomic Habits' or Visit Kyoto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Category
                </label>
                {!showCatInput && (
                  <button
                    type="button"
                    onClick={() => setShowCatInput(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    + New Category
                  </button>
                )}
              </div>

              {showCatInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="New Category..."
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                  />
                  <Button type="button" size="sm" onClick={handleCreateCategory}>
                    Add
                  </Button>
                </div>
              ) : (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Notes / Context (Optional)
              </label>
              <Textarea
                placeholder="Why do you want to do this? Any useful links or details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Surprise Me Modal */}
      {surprisePick && (
        <Dialog open={surpriseModalOpen} onOpenChange={setSurpriseModalOpen}>
          <DialogContent className="sm:max-w-md text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2 animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>

            <Badge variant="secondary" className="mx-auto text-xs px-3 py-1">
              {surprisePick.category}
            </Badge>

            <h3 className="text-xl font-bold mt-2">{surprisePick.title}</h3>

            {surprisePick.note && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/40 p-3 rounded-xl border">
                {surprisePick.note}
              </p>
            )}

            <div className="pt-4 flex items-center justify-center gap-2">
              <Button
                onClick={handleTriggerSurprise}
                variant="outline"
                className="gap-1 rounded-full text-xs"
              >
                <Dice5 className="w-4 h-4" /> Pick Another
              </Button>
              <Button
                onClick={() => setSurpriseModalOpen(false)}
                className="rounded-full text-xs"
              >
                Got It!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};