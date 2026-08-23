"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];

    prompt(): Promise<void>;

    userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
}

export function InstallAppButton() {
    const [installPrompt, setInstallPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();

            const promptEvent =
                event as BeforeInstallPromptEvent;

            setInstallPrompt(promptEvent);
            setIsVisible(true);
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
        };
    }, []);

    const handleInstall = async () => {
        if (!installPrompt) {
            return;
        }

        await installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;

        if (outcome === "accepted") {
            setInstallPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible || !installPrompt) {
        return null;
    }

    return (
        <div
            className="
        fixed
        bottom-6
        right-6
        z-[100]
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-border
        bg-card
        p-2
        shadow-2xl
        animate-in
        slide-in-from-bottom-5
        fade-in
        duration-300
      "
        >
            <Button
                onClick={handleInstall}
                className="
          h-11
          gap-2
          rounded-xl
          px-4
          shadow-md
        "
            >
                <Download className="h-4 w-4" />

                Install ATD
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-9 w-9 rounded-xl"
                aria-label="Dismiss install prompt"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
}