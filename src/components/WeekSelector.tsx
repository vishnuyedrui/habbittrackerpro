import { format, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekSelectorProps {
  weekStart: Date;
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
  isAuthenticated: boolean;
}

export default function WeekSelector({
  weekStart,
  onPrevious,
  onNext,
  canGoNext,
  isAuthenticated,
}: WeekSelectorProps) {
  const weekEnd = addDays(weekStart, 6);
  const label = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="h-9 w-9 rounded-full hover:bg-primary/10"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className="h-9 w-9 rounded-full hover:bg-primary/10"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
