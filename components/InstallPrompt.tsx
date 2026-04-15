"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isIOSSafari(): boolean {
  if (!isIOS()) return false;
  const ua = window.navigator.userAgent;
  // Safari on iOS doesn't include 'CriOS' (Chrome), 'FxiOS' (Firefox), etc.
  return /Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua);
}

function isIOSNonSafari(): boolean {
  if (!isIOS()) return false;
  const ua = window.navigator.userAgent;
  return /CriOS/.test(ua) || /FxiOS/.test(ua) || !/Safari/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showIOSNonSafariPrompt, setShowIOSNonSafariPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track visit count
  useEffect(() => {
    if (!mounted) return;
    const count = parseInt(localStorage.getItem("lilac_visit_count") || "0", 10);
    localStorage.setItem("lilac_visit_count", String(count + 1));
  }, [mounted]);

  // Check if we should show the prompt
  const shouldShowPrompt = useCallback((): boolean => {
    if (!mounted) return false;
    if (isStandalone()) return false;

    const dismissed = localStorage.getItem("lilac_install_prompt_dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < sevenDays) return false;
    }

    // Mobile users: show on first visit
    if (isMobileDevice()) return true;

    // Desktop users: show after 2+ visits
    const visitCount = parseInt(localStorage.getItem("lilac_visit_count") || "0", 10);
    return visitCount >= 2;
  }, [mounted]);

  // Android/Chrome install prompt
  useEffect(() => {
    if (!mounted) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (shouldShowPrompt()) {
        setShowAndroidPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [mounted, shouldShowPrompt]);

  // iOS Safari install instructions
  useEffect(() => {
    if (!mounted) return;
    if (isIOSSafari() && shouldShowPrompt()) {
      // Show after a short delay so app feels loaded first
      const timer = setTimeout(() => setShowIOSPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [mounted, shouldShowPrompt]);

  // iOS non-Safari browser prompt (Chrome on iOS, Firefox on iOS, etc.)
  useEffect(() => {
    if (!mounted) return;
    if (isIOSNonSafari() && shouldShowPrompt()) {
      const timer = setTimeout(() => setShowIOSNonSafariPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [mounted, shouldShowPrompt]);

  // Android mobile without beforeinstallprompt (some browsers)
  useEffect(() => {
    if (!mounted) return;
    if (!isIOS() && isMobileDevice() && !deferredPrompt && shouldShowPrompt()) {
      // If no beforeinstallprompt fired but we're on mobile Android, show a generic prompt
      const timer = setTimeout(() => {
        if (!deferredPrompt) {
          setShowAndroidPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mounted, shouldShowPrompt, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroidPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("lilac_install_prompt_dismissed", String(Date.now()));
    setShowAndroidPrompt(false);
    setShowIOSPrompt(false);
    setShowIOSNonSafariPrompt(false);
  };

  useEffect(() => {
    if (!mounted) return;
    
    const handleManualTrigger = () => {
      if (isIOSSafari()) {
        setShowIOSPrompt(true);
      } else if (isIOSNonSafari()) {
        setShowIOSNonSafariPrompt(true);
      } else {
        setShowAndroidPrompt(true);
      }
    };

    window.addEventListener("show-install-prompt", handleManualTrigger);
    return () => window.removeEventListener("show-install-prompt", handleManualTrigger);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      {/* Android/Chrome Install Prompt */}
      <AnimatePresence>
        {showAndroidPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 md:bottom-6 left-4 right-4 z-[60] md:left-auto md:right-6 md:max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-sand shadow-2xl rounded-2xl p-5 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-clay/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🪻</span>
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-serif text-lg text-slate-800 font-semibold">
                    Install Lilac
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Add to your home screen for the full app experience — quick access, offline support
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-terra hover:bg-orange-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                ) : (
                  <div className="flex-1 text-center text-sm text-slate-500 py-2">
                    Use your browser menu → <strong>&ldquo;Add to Home Screen&rdquo;</strong>
                  </div>
                )}
                <button
                  onClick={handleDismiss}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-black/5 rounded-xl font-medium text-sm transition-all"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Install Instructions */}
      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-[60]"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-sand shadow-2xl rounded-2xl p-5 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-clay/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🪻</span>
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-serif text-lg text-slate-800 font-semibold">
                    Add Lilac to your home screen
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Tap the <Share className="w-4 h-4 inline-block text-blue-500 -mt-0.5" /> Share button below, then
                    &ldquo;Add to Home Screen&rdquo;
                  </p>
                </div>
              </div>

              {/* Arrow pointing down toward Safari share button */}
              <div className="flex justify-center mt-3">
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-blue-400 text-xl"
                >
                  ↓
                </motion.div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleDismiss}
                  className="px-5 py-2 text-slate-500 hover:text-slate-700 hover:bg-black/5 rounded-xl font-medium text-sm transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Non-Safari Prompt — tells user to open in Safari */}
      <AnimatePresence>
        {showIOSNonSafariPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-[60]"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-sand shadow-2xl rounded-2xl p-5 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-clay/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-clay" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-serif text-lg text-slate-800 font-semibold">
                    Install Lilac on your iPhone
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    To add Lilac to your home screen, open this page in <strong>Safari</strong>, then tap
                    {" "}<Share className="w-4 h-4 inline-block text-blue-500 -mt-0.5" />{" "}
                    → &ldquo;Add to Home Screen&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleDismiss}
                  className="px-5 py-2 text-slate-500 hover:text-slate-700 hover:bg-black/5 rounded-xl font-medium text-sm transition-all"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
