import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { KeyRound, UserPlus, Sparkles } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: (codeId: string, code: string) => void;
}

export default function AuthDialog({ open, onOpenChange, onAuthenticated }: AuthDialogProps) {
  const [mode, setMode] = useState<"enter" | "create">("enter");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnterCode = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_codes")
        .select("id")
        .eq("code", trimmed)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast({ title: "Code not found", description: "No account with that code exists.", variant: "destructive" });
        return;
      }
      onAuthenticated(data.id, trimmed);
      toast({ title: "Welcome back!", description: "Your personal page is loading." });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    const trimmed = code.trim();
    if (!trimmed || trimmed.length < 4) {
      toast({ title: "Too short", description: "Code must be at least 4 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("user_codes")
        .select("id")
        .eq("code", trimmed)
        .maybeSingle();
      if (existing) {
        toast({ title: "Code taken", description: "That code is already in use. Try another.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase
        .from("user_codes")
        .insert({ code: trimmed })
        .select("id")
        .single();
      if (error) throw error;
      onAuthenticated(data.id, trimmed);
      toast({ title: "Code created!", description: "Your personal page is ready." });
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {mode === "enter" ? "Enter Your Code" : "Create Your Code"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {mode === "enter"
              ? "Enter your unique code to access your personal habit tracker."
              : "Create a unique code to save your progress and access it anytime."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="code">Unique Code</Label>
            <Input
              id="code"
              placeholder={mode === "enter" ? "Enter your code..." : "Create a code (min 4 chars)..."}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (mode === "enter" ? handleEnterCode() : handleCreateCode())}
              className="mt-1.5"
            />
          </div>

          <Button
            className="w-full"
            onClick={mode === "enter" ? handleEnterCode : handleCreateCode}
            disabled={loading}
          >
            {mode === "enter" ? (
              <><KeyRound className="mr-2 h-4 w-4" /> Enter Code</>
            ) : (
              <><UserPlus className="mr-2 h-4 w-4" /> Create Code</>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "enter" ? (
              <>Don't have a code?{" "}
                <button onClick={() => { setMode("create"); setCode(""); }} className="font-medium text-primary hover:underline">
                  Create one
                </button>
              </>
            ) : (
              <>Already have a code?{" "}
                <button onClick={() => { setMode("enter"); setCode(""); }} className="font-medium text-primary hover:underline">
                  Enter it
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
