import React, { useState, useRef } from "react";
import { Capture, CaptureMedia } from "@/types/productivity";
import {
  Inbox,
  Search,
  Tag as TagIcon,
  Send,
  ArrowRight,
  Archive,
  Trash2,
  Calendar,
  Camera,
  Video,
  X,
  Play,
  Image as ImageIcon,
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
import { showSuccess, showError } from "@/utils/toast";

interface QuickCaptureProps {
  captures: Capture[];
  tags: string[];
  onAddCapture: (text: string, tag: string, media?: CaptureMedia) => void;
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

  // Attached media state
  const [attachedMedia, setAttachedMedia] = useState<CaptureMedia | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
    if (!inputText.trim() && !attachedMedia) return;

    onAddCapture(
      inputText.trim() || (attachedMedia?.type === "photo" ? "Photo capture" : "Video capture"),
      selectedTag,
      attachedMedia
    );

    setInputText("");
    setAttachedMedia(undefined);
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

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachedMedia({
          type: "photo",
          url: event.target.result as string,
          name: file.name,
        });
        showSuccess("Photo attached");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showError("Please select a valid video file");
      return;
    }

    const url = URL.createObjectURL(file);
    setAttachedMedia({
      type: "video",
      url,
      name: file.name,
    });
    showSuccess("Video attached");
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoFileUpload}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleVideoFileUpload}
      />

      {/* Quick Input Box */}
      <Card className="border-primary/30 shadow-md bg-card">
        <CardContent className="p-4 space-y-3">
          <form onSubmit={handleCaptureSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Capture thoughts, note, photo, or video..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-base py-5 border-none shadow-none focus-visible:ring-0 px-1"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!inputText.trim() && !attachedMedia}
                size="icon"
                className="rounded-full shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Attached Media Preview inside Input Card */}
            {attachedMedia && (
              <div className="relative border rounded-xl overflow-hidden bg-muted/30 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {attachedMedia.type === "photo" ? (
                    <img
                      src={attachedMedia.url}
                      alt="Capture attachment"
                      className="w-12 h-12 object-cover rounded-lg border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Video className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate capitalize">
                      {attachedMedia.type} Attachment
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {attachedMedia.name || "Media ready to save"}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setAttachedMedia(undefined)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between border-t pt-2.5 gap-2">
              {/* Media Buttons: Photo & Video Options */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5 rounded-full"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-500" /> Photo
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5 rounded-full"
                >
                  <Video className="w-3.5 h-3.5 text-rose-500" /> Video
                </Button>
              </div>

              {/* Tags Dropdown */}
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
              Capture quick notes, photos, or videos above.
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
                className="group transition-all hover:border-primary/40 shadow-xs overflow-hidden"
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

                  {/* Render Attached Photo or Video */}
                  {capture.media && (
                    <div className="rounded-xl overflow-hidden border bg-black/5 mt-2">
                      {capture.media.type === "photo" ? (
                        <img
                          src={capture.media.url}
                          alt="Captured photo"
                          className="w-full max-h-64 object-cover"
                        />
                      ) : (
                        <video
                          src={capture.media.url}
                          controls
                          className="w-full max-h-64 rounded-xl"
                        />
                      )}
                    </div>
                  )}

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