"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import {
    CheckCircle2,
    LogOut,
    ScanLine,
    ShieldCheck,
    Wifi,
    WifiOff,
} from "lucide-react";

const DEVICE_KEY = "deviceKey";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ScanStatus = "idle" | "sending" | "success" | "error";

export default function ScanPage() {
    const router = useRouter();

    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Promise for the current scanner.start()
    // This is important because start() is asynchronous.
    const scannerStartPromiseRef =
        useRef<Promise<void> | null>(null);

    // Prevent duplicate scans.
    const lastScanRef = useRef("");
    const lastScanTimeRef = useRef(0);

    // Prevent multiple API requests at the same time.
    const sendingRef = useRef(false);

    // Prevent state updates after unmount.
    const mountedRef = useRef(false);

    // Used to clean up status timers.
    const statusTimeoutRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const [deviceKey, setDeviceKey] =
        useState<string | null>(null);

    const [lastBarcode, setLastBarcode] =
        useState("");

    const [status, setStatus] =
        useState<ScanStatus>("idle");

    const [message, setMessage] = useState(
        "Position a student ID inside the scanner"
    );

    const [loggingOut, setLoggingOut] =
        useState(false);

    /*
     * =========================================================
     * GET DEVICE KEY
     * =========================================================
     */

    useEffect(() => {
        mountedRef.current = true;

        const key = localStorage.getItem(DEVICE_KEY);

        if (!key) {
            router.replace("/");
            return;
        }

        setDeviceKey(key);

        return () => {
            mountedRef.current = false;
        };
    }, [router]);

    /*
     * =========================================================
     * CLEAR STATUS TIMER
     * =========================================================
     */

    const clearStatusTimer = useCallback(() => {
        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
    }, []);

    /*
     * =========================================================
     * SEND BARCODE
     * =========================================================
     */

    const sendBarcode = useCallback(
        async (barcode: string) => {
            if (!deviceKey) {
                return;
            }

            // Don't send another request while one is running.
            if (sendingRef.current) {
                return;
            }

            sendingRef.current = true;

            clearStatusTimer();

            if (mountedRef.current) {
                setLastBarcode(barcode);
                setStatus("sending");
                setMessage("Recording attendance...");
            }

            try {
                const response = await fetch(
                    `${API_URL}/attendanceterminal`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            deviceKey,
                            barcode,
                            timestamp:
                                new Date().toISOString(),
                        }),
                    }
                );

                let data: {
                    message?: string;
                } = {};

                try {
                    data = await response.json();
                } catch {
                    // API didn't return JSON.
                }

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Failed to record scan"
                    );
                }

                if (!mountedRef.current) {
                    return;
                }

                setStatus("success");

                setMessage(
                    data?.message ||
                    "Attendance recorded successfully"
                );

                statusTimeoutRef.current =
                    setTimeout(() => {
                        if (!mountedRef.current) {
                            return;
                        }

                        setStatus("idle");

                        setMessage(
                            "Position the next student ID inside the scanner"
                        );
                    }, 2500);
            } catch (error) {
                console.error(
                    "Barcode API error:",
                    error
                );

                if (!mountedRef.current) {
                    return;
                }

                setStatus("error");

                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to record attendance"
                );

                statusTimeoutRef.current =
                    setTimeout(() => {
                        if (!mountedRef.current) {
                            return;
                        }

                        setStatus("idle");

                        setMessage(
                            "Position a student ID inside the scanner"
                        );
                    }, 3000);
            } finally {
                sendingRef.current = false;
            }
        },
        [deviceKey, clearStatusTimer]
    );

    /*
     * =========================================================
     * START SCANNER
     * =========================================================
     */

    useEffect(() => {
        if (!deviceKey) {
            return;
        }

        let cancelled = false;

        const scanner = new Html5Qrcode(
            "barcode-reader"
        );

        scannerRef.current = scanner;

        const startScanner = async () => {
            try {
                const startPromise = scanner.start(
                    {
                        facingMode: "environment",
                    },
                    {
                        fps: 10,
                        qrbox: {
                            width: 320,
                            height: 180,
                        },
                    },
                    async (decodedText) => {
                        if (
                            cancelled ||
                            !mountedRef.current
                        ) {
                            return;
                        }

                        const now = Date.now();

                        /*
                         * Prevent the same barcode from being
                         * processed repeatedly.
                         */
                        if (
                            decodedText ===
                            lastScanRef.current &&
                            now -
                            lastScanTimeRef.current <
                            2500
                        ) {
                            return;
                        }

                        lastScanRef.current =
                            decodedText;

                        lastScanTimeRef.current = now;

                        await sendBarcode(decodedText);
                    },
                    () => {
                        // Ignore continuous scanner frame errors.
                    }
                );

                scannerStartPromiseRef.current =
                    startPromise

                await startPromise;

                if (cancelled) {
                    /*
                     * Component was unmounted while
                     * scanner.start() was running.
                     */
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }

                    await scanner.clear();

                    return;
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Scanner start error:",
                    error
                );

                if (mountedRef.current) {
                    setStatus("error");

                    setMessage(
                        "Camera access is required to scan barcodes."
                    );
                }
            } finally {
                scannerStartPromiseRef.current =
                    null;
            }
        };

        startScanner();

        /*
         * =====================================================
         * CLEANUP
         * =====================================================
         */

        return () => {
            cancelled = true;

            clearStatusTimer();

            const cleanupScanner = async () => {
                try {
                    /*
                     * If scanner.start() is still running,
                     * wait for it before trying to stop/clear.
                     */
                    if (
                        scannerStartPromiseRef.current
                    ) {
                        try {
                            await scannerStartPromiseRef.current;
                        } catch {
                            // start() failed; nothing to stop.
                        }
                    }

                    /*
                     * stop() MUST happen before clear().
                     */
                    if (scanner.isScanning) {
                        await scanner.stop();
                    }

                    /*
                     * Now it is safe to clear.
                     */
                    await scanner.clear();
                } catch (error) {
                    console.error(
                        "Scanner cleanup error:",
                        error
                    );
                } finally {
                    if (
                        scannerRef.current ===
                        scanner
                    ) {
                        scannerRef.current = null;
                    }
                }
            };

            cleanupScanner();
        };
    }, [
        deviceKey,
        sendBarcode,
        clearStatusTimer,
    ]);

    /*
     * =========================================================
     * LOGOUT
     * =========================================================
     */

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        clearStatusTimer();

        try {
            const scanner = scannerRef.current;

            if (scanner) {
                /*
                 * If scanner.start() is still in progress,
                 * wait for it.
                 */
                if (scannerStartPromiseRef.current) {
                    try {
                        await scannerStartPromiseRef.current;
                    } catch {
                        // Scanner failed to start.
                    }
                }

                /*
                 * IMPORTANT:
                 *
                 * stop() first
                 * clear() second
                 */
                if (scanner.isScanning) {
                    await scanner.stop();
                }

                await scanner.clear();

                scannerRef.current = null;
            }
        } catch (error) {
            console.error(
                "Failed to stop scanner during logout:",
                error
            );
        } finally {
            /*
             * Remove the device key only after scanner
             * cleanup has completed.
             */
            localStorage.removeItem(DEVICE_KEY);

            router.replace("/");
        }
    }

    /*
     * =========================================================
     * NO DEVICE KEY
     * =========================================================
     */

    if (!deviceKey) {
        return null;
    }

    const isSuccess = status === "success";
    const isError = status === "error";
    const isSending = status === "sending";

    /*
     * =========================================================
     * UI
     * =========================================================
     */

    return (
        <main className="min-h-screen bg-background">
            {/* =====================================================
                HEADER
            ====================================================== */}

            <header
                className="
                    flex h-16
                    items-center justify-between
                    border-b border-border
                    bg-card
                    px-5
                    sm:px-8
                "
            >
                {/* Brand */}

                <div className="flex items-center gap-3">
                    <div
                        className="
                            flex h-9 w-9
                            items-center justify-center
                            rounded-xl
                            bg-primary
                            text-primary-foreground
                        "
                    >
                        <ScanLine className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm font-bold tracking-tight">
                            Smart Scanner
                        </p>

                        <p className="hidden text-[11px] text-muted-foreground sm:block">
                            Attendance Scanner
                        </p>
                    </div>
                </div>

                {/* Device */}

                <div className="flex items-center gap-3">
                    <div
                        className="
                            hidden items-center gap-2
                            rounded-full
                            border border-border
                            bg-muted/40
                            px-3 py-1.5
                            sm:flex
                        "
                    >
                        <span className="h-2 w-2 rounded-full bg-green-500" />

                        <span className="font-mono text-xs text-muted-foreground">
                            {deviceKey.slice(0, 8)}••••
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="
                            flex h-9 items-center gap-2
                            rounded-lg
                            border border-border
                            px-3
                            text-xs font-medium
                            text-muted-foreground
                            transition-colors
                            hover:bg-muted
                            hover:text-foreground
                            disabled:pointer-events-none
                            disabled:opacity-50
                        "
                    >
                        {loggingOut ? (
                            <div
                                className="
                                    h-4 w-4
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-muted-foreground
                                    border-t-transparent
                                "
                            />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}

                        <span className="hidden sm:inline">
                            {loggingOut
                                ? "Stopping..."
                                : "Logout"}
                        </span>
                    </button>
                </div>
            </header>

            {/* =====================================================
                MAIN
            ====================================================== */}

            <div
                className="
                    mx-auto flex
                    min-h-[calc(100vh-4rem)]
                    max-w-5xl
                    flex-col
                    items-center
                    px-4 py-8
                    sm:px-6
                    lg:py-12
                "
            >
                {/* Heading */}

                <div className="mb-7 text-center">
                    <div
                        className="
                            mx-auto mb-4
                            flex h-12 w-12
                            items-center justify-center
                            rounded-2xl
                            bg-primary/10
                            text-primary
                        "
                    >
                        <ScanLine className="h-6 w-6" />
                    </div>

                    <h1
                        className="
                            text-2xl font-bold
                            tracking-tight
                            sm:text-3xl
                        "
                    >
                        Scan Student ID
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Scan the barcode on the student&apos;s ID card
                    </p>
                </div>

                {/* =================================================
                    SCANNER CARD
                ================================================== */}

                <div
                    className="
                        w-full max-w-2xl
                        overflow-hidden
                        rounded-3xl
                        border border-border
                        bg-card
                        shadow-xl
                    "
                >
                    {/* Scanner */}

                    <div
                        className="
                            relative
                            overflow-hidden
                            bg-black
                        "
                    >
                        <div
                            id="barcode-reader"
                            className="w-full"
                        />

                        {/* Scanner overlay */}

                        <div
                            className="
                                pointer-events-none
                                absolute inset-0
                                flex items-center justify-center
                            "
                        >
                            <div
                                className="
                                    relative
                                    h-[180px]
                                    w-[320px]
                                    rounded-2xl
                                    border-2 border-white/80
                                    shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]
                                "
                            >
                                {/* Corner accents */}

                                <span
                                    className="
                                        absolute
                                        -left-0.5
                                        -top-0.5
                                        h-7 w-7
                                        rounded-tl-xl
                                        border-l-4
                                        border-t-4
                                        border-primary
                                    "
                                />

                                <span
                                    className="
                                        absolute
                                        -right-0.5
                                        -top-0.5
                                        h-7 w-7
                                        rounded-tr-xl
                                        border-r-4
                                        border-t-4
                                        border-primary
                                    "
                                />

                                <span
                                    className="
                                        absolute
                                        -bottom-0.5
                                        -left-0.5
                                        h-7 w-7
                                        rounded-bl-xl
                                        border-b-4
                                        border-l-4
                                        border-primary
                                    "
                                />

                                <span
                                    className="
                                        absolute
                                        -bottom-0.5
                                        -right-0.5
                                        h-7 w-7
                                        rounded-br-xl
                                        border-b-4
                                        border-r-4
                                        border-primary
                                    "
                                />

                                {/* Scan line */}

                                <div
                                    className="
                                        absolute
                                        left-3 right-3
                                        top-1/2
                                        h-px
                                        bg-primary
                                        shadow-[0_0_10px_2px]
                                        shadow-primary
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        STATUS
                    ================================================== */}

                    <div className="p-5 sm:p-6">
                        <div
                            className={`
                                flex items-center gap-3
                                rounded-2xl
                                border
                                p-4
                                ${isSuccess
                                    ? "border-green-500/20 bg-green-500/5"
                                    : isError
                                        ? "border-destructive/20 bg-destructive/5"
                                        : "border-border bg-muted/30"
                                }
                            `}
                        >
                            {isSuccess ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                            ) : isError ? (
                                <WifiOff className="h-5 w-5 shrink-0 text-destructive" />
                            ) : isSending ? (
                                <div
                                    className="
                                        h-5 w-5
                                        shrink-0
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-primary
                                        border-t-transparent
                                    "
                                />
                            ) : (
                                <ScanLine className="h-5 w-5 shrink-0 text-primary" />
                            )}

                            <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                    {isSuccess
                                        ? "Scan successful"
                                        : isError
                                            ? "Scan failed"
                                            : isSending
                                                ? "Processing scan"
                                                : "Ready to scan"}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {message}
                                </p>
                            </div>
                        </div>

                        {/* =================================================
                            LAST BARCODE
                        ================================================== */}

                        {lastBarcode && (
                            <div
                                className="
                                    mt-4
                                    flex items-center justify-between
                                    rounded-xl
                                    border border-border
                                    px-4 py-3
                                "
                            >
                                <div>
                                    <p
                                        className="
                                            text-[11px]
                                            font-medium
                                            uppercase
                                            tracking-wider
                                            text-muted-foreground
                                        "
                                    >
                                        Last scanned
                                    </p>

                                    <p className="mt-1 font-mono text-sm">
                                        {lastBarcode}
                                    </p>
                                </div>

                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                        )}
                    </div>
                </div>

                {/* =====================================================
                    CONNECTION
                ====================================================== */}

                <div
                    className="
                        mt-6
                        flex items-center gap-2
                        text-xs text-muted-foreground
                    "
                >
                    <Wifi className="h-3.5 w-3.5 text-green-500" />

                    <span>
                        Scanner connected and ready
                    </span>
                    <span className="text-border">
                        •
                    </span>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>
                        Device secured
                    </span>
                </div>
            </div>
        </main>
    );
}