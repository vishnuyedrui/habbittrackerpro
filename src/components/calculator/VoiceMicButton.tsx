import { Mic, MicOff, Check, X } from "lucide-react";
import { useVoiceInput, isVoiceSupported } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VoiceMicButtonProps {
  onResult: (value: string) => void;
  type: "number" | "grade" | "text";
  min?: number;
  max?: number;
  className?: string;
}

export function VoiceMicButton({ onResult, type, min, max, className }: VoiceMicButtonProps) {
  const { status, startListening } = useVoiceInput({ type, min, max, onResult });

  if (!isVoiceSupported) return null;

  const Icon = status === "success" ? Check : status === "error" ? X : Mic;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={startListening}
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 flex-shrink-0",
              status === "idle" && "text-muted-foreground hover:text-foreground hover:bg-muted",
              status === "listening" && "text-destructive bg-destructive/10 animate-voice-pulse",
              status === "success" && "text-accent bg-accent/10",
              status === "error" && "text-destructive bg-destructive/10",
              className
            )}
            aria-label={status === "listening" ? "Listening..." : "Click to speak your grade"}
          >
            <Icon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {status === "listening" ? "Listening..." : `Click to speak your ${type === "grade" ? "grade" : "value"}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
