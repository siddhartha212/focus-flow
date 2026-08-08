import React, { useState, useMemo } from "react";
import { Note } from "@/types/productivity";
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  Calendar,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";

interface NotesSectionProps {
  notes?: Note[];
  onAddNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const COLOR_OPTIONS = [
  { name: "default", bg: "bg-card", border: "border-border" },
  { name: "emerald", bg: "bg-emerald-500/10 dark:bg-emerald-950/20", border: "border-emerald-500/30" },
  { name: "blue", bg: "bg-blue-500/10 dark:bg-blue-950/20", border: "border-blue-500/30" },
  { name: "amber", bg: "bg-amber-500/10 dark:bg-amber-950/20", border: "border-amber-500/30" },
  { name: "purple", bg: "bg-purple-500/10 dark:bg-purple-950/20", border: "border-purple-500/30" },
];

/** Safe date formatter to prevent date-fns from throwing uncaught errors */
function formatDateSafe(isoString?: string): string {
  if (!isoString) return format(new Date(), "MMM d, yyyy");
  try {
    const parsed = parseISO(isoString);
    if (!isValid(parsed)) return format(new Date(), "MMM d, yyyy");
    return format(parsed, "MMM d, yyyy");
  } catch {
    return format(new Date(), "MMM d, yyyy");
  }
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const safeNotes = useMemo(() => (Array.isArray(notes) ? notes : []), [notes]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [color, setColor] = useState("default");
  const [pinned, setPinned] = useState(false);

  const categories = useMemo(() => {
    return Array.from(new Set(safeNotes.map((n) => n?.category || "General")));
  }, [safeNotes]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setCategory("Personal");
    setColor("default");
    setPinned(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setCategory(note?.category || "General");
    setColor(note?.color || "default");
    setPinned(!!note?.pinned);
    setIsDialogOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      showError("Please enter a title or content for your note");
      return;
    }

    const nowISO = new Date().toISOString();

    if (editingNote) {
      onUpdateNote({
        ...editingNote,
        title: title.trim() || "Untitled Note",
        content: content.trim(),
        category,
        color,
        pinned,
        updatedAt: nowISO,
      });
      showSuccess("Note updated");
    } else {
      onAddNote({
        title: title.trim() || "Untitled Note",
        content: content.trim(),
        category,
        color,
        pinned,
      });
      showSuccess("Note saved permanently");
    }

    setIsDialogOpen(false);
  };

  const filteredNotes = useMemo(() => {
    return safeNotes.filter((n) => {
      if (!n) return false;
      const noteTitle = n.title || "";
      const noteContent = n.content || "";
      const matchesSearch =
        noteTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        noteContent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCategory === "all" || n.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [safeNotes, searchQuery, selectedCategory]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned), [filteredNotes]);

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Notes & Ideas
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize thoughts, meeting logs, and knowledge notes permanently.
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="rounded-full gap-1 shadow-sm text-xs font-semibold"
        >
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer text-xs rounded-full px-3 py-1"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer text-xs rounded-full px-3 py-1"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Pin className="w-3.5 h-3.5 text-primary fill-primary/20" /> Pinned Notes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleOpenEdit}
                onDelete={onDeleteNote}
                onTogglePin={(n) =>
                  onUpdateNote({ ...n, pinned: !n.pinned })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* All / Other Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            All Notes ({otherNotes.length})
          </h3>
        )}

        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-card">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-sm">No notes found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first note to store thoughts permanently.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleOpenEdit}
                onDelete={onDeleteNote}
                onTogglePin={(n) =>
                  onUpdateNote({ ...n, pinned: !n.pinned })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Edit Note" : "Create New Note"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveNote} className="space-y-4 py-2">
            <div className="space-y-2">
              <Input
                placeholder="Note Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base font-semibold"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="text-xs leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Category
                </label>
                <Input
                  placeholder="e.g. Work, Personal"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Theme Color
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform ${
                        color === c.name
                          ? "ring-2 ring-primary scale-110"
                          : "opacity-70 hover:opacity-100"
                      } ${c.bg}`}
                    >
                      {color === c.name && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant={pinned ? "default" : "outline"}
                size="sm"
                onClick={() => setPinned(!pinned)}
                className="h-8 text-xs rounded-full gap-1"
              >
                <Pin className="w-3.5 h-3.5" />
                {pinned ? "Pinned to Top" : "Pin Note"}
              </Button>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Permanently</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Note Card Sub-component
interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const styleObj =
    COLOR_OPTIONS.find((c) => c.name === note?.color) || COLOR_OPTIONS[0];

  const formattedDate = formatDateSafe(note?.createdAt);

  return (
    <Card
      className={`group transition-all hover:border-primary/50 shadow-xs relative overflow-hidden flex flex-col justify-between ${styleObj.bg} ${styleObj.border}`}
    >
      <CardContent className="p-4 space-y-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm line-clamp-1">{note?.title || "Untitled Note"}</h4>
          <button
            onClick={() => onTogglePin(note)}
            className={`text-muted-foreground hover:text-primary transition-colors shrink-0 ${
              note?.pinned ? "text-primary" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note?.pinned ? "fill-primary" : ""}`} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-line">
          {note?.content || ""}
        </p>

        <div className="pt-3 flex items-center justify-between border-t border-border/50 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formattedDate}
          </span>

          <div className="flex items-center gap-1">
            {note?.category && (
              <Badge variant="secondary" className="text-[10px] rounded-md px-1.5 py-0.5">
                {note.category}
              </Badge>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(note)}
              className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-3 h-3" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(note.id)}
              className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};