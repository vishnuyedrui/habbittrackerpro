import { useState, useRef, useEffect } from "react";
import { Trash2, GripVertical, Pencil, Check, X, Flame } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface HabitRowProps {
  habit: string;
  hIdx: number;
  checkRow: boolean[];
  streak: number;
  onToggle: (hIdx: number, dIdx: number) => void;
  onRemove: (hIdx: number) => void;
  onRename: (hIdx: number, newName: string) => void;
  onDragStart: (hIdx: number) => void;
  onDragOver: (e: React.DragEvent, hIdx: number) => void;
  onDrop: (hIdx: number) => void;
}

export default function HabitRow({
  habit, hIdx, checkRow, streak, onToggle, onRemove, onRename,
  onDragStart, onDragOver, onDrop,
}: HabitRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(habit);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== habit) {
      onRename(hIdx, trimmed);
    } else {
      setEditValue(habit);
    }
    setEditing(false);
  };

  return (
    <TableRow
      draggable
      onDragStart={() => onDragStart(hIdx)}
      onDragOver={(e) => onDragOver(e, hIdx)}
      onDrop={() => onDrop(hIdx)}
      className="group"
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") { setEditValue(habit); setEditing(false); }
                }}
                className="h-7 w-28 text-sm"
              />
              <button onClick={commitRename} className="rounded p-0.5 hover:bg-accent/20">
                <Check className="h-3.5 w-3.5 text-accent" />
              </button>
              <button onClick={() => { setEditValue(habit); setEditing(false); }} className="rounded p-0.5 hover:bg-destructive/20">
                <X className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ) : (
            <span
              className="cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-secondary"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {habit}
              <Pencil className="ml-1 inline h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          )}
        </div>
      </TableCell>
      {DAYS.map((_, dIdx) => (
        <TableCell key={dIdx} className="text-center">
          <Checkbox
            checked={checkRow[dIdx] ?? false}
            onCheckedChange={() => onToggle(hIdx, dIdx)}
            className="transition-transform hover:scale-110"
          />
        </TableCell>
      ))}
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          {streak > 0 && <Flame className="h-4 w-4 text-warning" />}
          <span className={`text-sm font-semibold ${streak > 0 ? "text-warning" : "text-muted-foreground"}`}>
            {streak}d
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <button
          onClick={() => onRemove(hIdx)}
          className="rounded-full p-1 transition-colors hover:bg-destructive/20"
          aria-label={`Remove ${habit}`}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </TableCell>
    </TableRow>
  );
}
