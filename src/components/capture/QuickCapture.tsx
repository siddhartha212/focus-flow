import React, { useState } from "react";
import { Capture, Task } from "@/types/productivity";
import {
  Inbox,
  Search,
  Plus,
  Tag as TagIcon,
  Send,
  ArrowRight,
  Archive,
  Trash2,
  Calendar,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess } from "@/utils/toast";

interface QuickCaptureProps {
  captures: Capture[];
  tags: string[];
  onAddCapture: (text: string, tag: string) => void;
  onAddTag: (tag: string) => void;
  onConvertToTask: (capture: Capture) => void;
  onArchiveCapture: (id: string) => void;
  onDeleteCapture: (id: string) => void;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({
  captures,
  tags,
  onAddCapture,
  onAddTag,
  onConvertToTask,
  onArchiveCapture,
  onDeleteCapture,
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("Personal");
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");

  const activeCaptures = captures.filter((c) => !c.archived);

  const filteredCaptures = activeCaptures.filter((c) => {
    const matchesSearch = c.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === "all" || c.tag === filterTag;
    return matchesSearch && matchesTag;
  });

  const handleCaptureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onAddCapture(inputText.trim(), selectedTag);
    setInputText("");
    showSuccess("Saved to Capture Inbox");
  };

  const handleCreateCustomTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim();
    onAddTag(clean);
    setSelectedTag(clean);
    setNewTagInput("");
    setIsAddingCustomTag(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Quick Input Box */}
      <Card className="border-primary/30 shadow-md bg-card">
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleCaptureSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Capture any thought, note, or quick task..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-base py-5 border-none shadow-none focus-visible:ring-0 px-1"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!inputText.trim()}
                size="icon"
                className="rounded-full shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-2.5">
              <div className="flex items-center gap-2">
                <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                {isAddingCustomTag ? (
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="New tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="h-7 text-xs w-28"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateCustomTag}
                      className="h-7 text-xs px-2"
                    >
                      Add
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="h-7 text-xs border-none shadow-none bg-muted/60 rounded-full px-2.5">
                      <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!isAddingCustomTag && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomTag(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    + Tag
                  </button>
                )}
              </div>

              <span className="text-[11px] text-muted-foreground">
                Press Enter to Save
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search captures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <Badge
            variant={filterTag === "all" ? "default" : "outline"}
            className="cursor-pointer text-xs rounded-full px-3 py-1"
            onClick={() => setFilterTag("all")}
          >
            All
          </Badge>
          {tags.map((t) => (
            <Badge
              key={t}
              variant={filterTag === t ? "default" : "outline"}
              className="cursor-pointer text-xs rounded-full px-3 py-1"
              onClick={() => setFilterTag(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Captures List */}
      <div className="space-y-3">
        {filteredCaptures.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-card">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-sm">Inbox is empty</p>
            <p className="text-xs text-muted-foreground mt-1">
              Capture your brilliant thoughts above before they slip away.
            </p>
          </div>
        ) : (
          filteredCaptures.map((capture) => {
            const formattedDate = format(
              parseISO(capture.createdAt),
              "MMM d, h:mm a"
            );
            return (
              <Card
                key={capture.id}
                className="group transition-all hover:border-primary/40 shadow-xs"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium leading-relaxed flex-1">
                      {capture.text}
                    </p>
                    <Badge variant="secondary" className="text-[10px] rounded-md shrink-0">
                      {capture.tag}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" /> {formattedDate}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          onConvertToTask(capture);
                          showSuccess("Converted to Today Task!");
                        }}
                        className="h-7 text-xs px-2 gap-1 text-primary hover:bg-primary/10 rounded-lg"
                      >
                        To Task <ArrowRight className="w-3 h-3" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onArchiveCapture(capture.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDeleteCapture(capture.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};