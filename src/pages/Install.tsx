import { useState, useEffect } from "react";
import { Download, Share, MoreVertical, Plus, Smartphone, Monitor, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  if (isStandalone || installed) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 mx-auto text-[hsl(var(--success))]" />
          <h1 className="text-3xl font-display font-bold text-foreground">You're all set!</h1>
          <p className="text-muted-foreground max-w-md">
            TeamDino is installed on your device. Open it from your home screen anytime.
          </p>
        </motion.div>
      </main>
    );
  }

  const steps = isIOS
    ? [
        { icon: Share, text: 'Tap the Share button in Safari' },
        { icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
        { icon: Download, text: 'Tap "Add" to confirm' },
      ]
    : [
        { icon: MoreVertical, text: 'Tap the browser menu (⋮)' },
        { icon: Download, text: 'Select "Install app" or "Add to Home Screen"' },
        { icon: CheckCircle2, text: 'Confirm the installation' },
      ];

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg space-y-8 text-center"
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <img src="/logo.png" alt="TeamDino" className="w-20 h-20 rounded-2xl shadow-lg" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Install TeamDino</h1>
          <p className="text-muted-foreground">
            Add TeamDino to your home screen for quick access, offline support, and a native app experience.
          </p>
        </div>

        {/* Install button (Android/Desktop) */}
        {deferredPrompt && (
          <Button onClick={handleInstall} size="lg" className="w-full text-base gap-2">
            <Download className="w-5 h-5" />
            Install Now
          </Button>
        )}

        {/* Manual steps */}
        <Card className="text-left">
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
              {isIOS ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              {isIOS ? "Install on iPhone / iPad" : "Install on your device"}
            </h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15 * i }}
                  className="flex items-start gap-3"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <step.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground text-sm">{step.text}</span>
                  </div>
                </motion.li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Works best in Chrome (Android/Desktop) or Safari (iOS).
        </p>
      </motion.div>
    </main>
  );
}
