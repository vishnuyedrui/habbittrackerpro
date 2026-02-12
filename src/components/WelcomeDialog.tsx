import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { UserRound, Clock, Sparkles } from "lucide-react";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonal: () => void;
  onTemporary: () => void;
}

export default function WelcomeDialog({ open, onOpenChange, onPersonal, onTemporary }: WelcomeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="animate-scale-in">
        <AlertDialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Welcome to Habit Tracker!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Would you like to create your own personal page to save your progress across sessions, or use a temporary page for quick tracking?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={onTemporary} className="gap-2">
            <Clock className="h-4 w-4" /> Temporary Page
          </AlertDialogCancel>
          <AlertDialogAction onClick={onPersonal} className="gap-2">
            <UserRound className="h-4 w-4" /> My Personal Page
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
