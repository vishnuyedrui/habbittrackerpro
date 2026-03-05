import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isVoiceSupported } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";

export function VoiceModeBar() {
  const [voiceMode, setVoiceMode] = useState(false);

  if (!isVoiceSupported) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVoiceMode(!voiceMode)}
          className={cn(
            "rounded-full border-2 font-bold font-display gap-2 transition-all duration-300",
            voiceMode
              ? "border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
              : "border-foreground/10 hover:border-primary/30"
          )}
        >
          {voiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {voiceMode ? "Exit Voice Mode" : "Voice Mode 🎤"}
        </Button>
      </div>

      <AnimatePresence>
        {voiceMode && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="text-center py-3 px-4 bg-destructive/10 border-2 border-destructive/20 rounded-2xl">
              <p className="text-sm font-bold font-display text-destructive flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Voice Mode Active — Click any 🎤 mic button to speak your grade
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Say grades like "A plus", "B", "O" or numbers like "eighty five", "92"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
