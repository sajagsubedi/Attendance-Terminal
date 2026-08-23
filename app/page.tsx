"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

const DEVICE_KEY = "deviceKey";

export default function Page() {
  const router = useRouter();

  const [deviceKey, setDeviceKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(DEVICE_KEY);

    if (storedKey) {
      router.replace("/scan");
    }
  }, [router]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const key = deviceKey.trim();

    if (!key) return;

    setIsLoading(true);

    localStorage.setItem(DEVICE_KEY, key);

    router.push("/scan");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="relative mx-auto flex min-h-screen max-w-7xl p-0 lg:p-4">
        <div
          className="
            relative flex min-h-[calc(100vh-2rem)] w-full
            overflow-hidden
            bg-card
            lg:rounded-3xl
            lg:border lg:border-border
            lg:shadow-2xl
          "
        >
          {/* =====================================================
              LEFT — BRAND
          ====================================================== */}

          <section
            className="
              relative hidden w-1/2 overflow-hidden
              bg-brand-gradient
              p-10 text-primary-foreground
              lg:flex
            "
          >
            {/* Glow */}
            <div
              className="
                absolute -right-24 -top-24
                h-80 w-80
                rounded-full
                bg-primary-foreground/10
                blur-3xl
              "
            />

            <div
              className="
                absolute -bottom-32 -left-24
                h-96 w-96
                rounded-full
                bg-primary-foreground/10
                blur-3xl
              "
            />

            {/* Grid */}
            <div
              className="
                absolute inset-0 opacity-[0.06]
                [background-image:linear-gradient(var(--primary-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--primary-foreground)_1px,transparent_1px)]
                [background-size:40px_40px]
              "
            />

            <div className="relative z-10 flex h-full w-full flex-col">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-2xl
                    bg-primary-foreground
                    p-2
                    shadow-lg
                  "
                >
                  <ScanLine className="h-6 w-6 text-primary" />
                </div>

                <div>
                  <p className="font-bold tracking-tight">
                    Smart Scanner
                  </p>

                  <p className="text-[11px] text-primary-foreground/70">
                    Device Attendance System
                  </p>
                </div>
              </div>

              {/* Main */}
              <div className="my-auto max-w-xl">
                <div
                  className="
                    mb-5 inline-flex items-center gap-2
                    rounded-full
                    border border-primary-foreground/15
                    bg-primary-foreground/10
                    px-3.5 py-1.5
                    text-xs font-medium
                    backdrop-blur-md
                  "
                >
                  <Sparkles className="h-3.5 w-3.5" />

                  <span>
                    Fast. Simple. Connected.
                  </span>
                </div>

                <h1
                  className="
                    text-4xl font-bold
                    leading-[1.08]
                    tracking-tight
                    xl:text-5xl
                  "
                >
                  Your classroom
                  <br />

                  <span className="text-primary-foreground/75">
                    starts with a scan.
                  </span>
                </h1>

                <p
                  className="
                    mt-5 max-w-lg
                    text-sm leading-6
                    text-primary-foreground/80
                  "
                >
                  Connect this device to your classroom and
                  scan student ID cards quickly and reliably.
                </p>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  <Feature
                    icon={
                      <ScanLine className="h-4 w-4" />
                    }
                    title="Instant Scanning"
                    description="Scan student IDs in seconds."
                  />

                  <Feature
                    icon={
                      <ShieldCheck className="h-4 w-4" />
                    }
                    title="Dedicated Device"
                    description="Each scanner is connected to a device key."
                  />

                  <Feature
                    icon={
                      <CheckCircle2 className="h-4 w-4" />
                    }
                    title="Automatic Recording"
                    description="Every scan is sent directly to your system."
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className="
                  flex items-center justify-between
                  text-xs text-primary-foreground/60
                "
              >
                <span>Smart Scanner</span>

                <span className="flex items-center gap-1.5">
                  Ready when you are
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </section>

          {/* =====================================================
              RIGHT — DEVICE SETUP
          ====================================================== */}

          <section className="flex w-full flex-col bg-card lg:w-1/2">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 p-6 lg:hidden">
              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-primary
                  text-primary-foreground
                  shadow-sm
                "
              >
                <ScanLine className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-foreground">
                  Smart Scanner
                </p>

                <p className="text-[11px] text-muted-foreground">
                  Device Attendance System
                </p>
              </div>
            </div>

            {/* Content */}
            <div
              className="
                flex flex-1
                items-center justify-center
                px-6 py-10
                sm:px-10
                lg:px-14
                xl:px-20
              "
            >
              <div className="w-full max-w-md">
                {/* Icon */}
                <div
                  className="
                    mb-6 flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-primary/10
                    text-primary
                  "
                >
                  <Smartphone className="h-6 w-6" />
                </div>

                {/* Heading */}
                <div className="mb-7">
                  <p className="mb-1.5 text-sm font-medium text-primary">
                    Device Setup
                  </p>

                  <h2
                    className="
                      text-3xl font-bold
                      tracking-tight
                      text-foreground
                    "
                  >
                    Connect this{" "}
                    <span className="text-primary">
                      device.
                    </span>
                  </h2>

                  <p
                    className="
                      mt-3
                      text-sm leading-6
                      text-muted-foreground
                    "
                  >
                    Enter the device key provided by your
                    administrator to start scanning.
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="deviceKey"
                      className="label-field"
                    >
                      Device Key
                    </label>

                    <input
                      id="deviceKey"
                      type="text"
                      value={deviceKey}
                      onChange={(e) =>
                        setDeviceKey(e.target.value)
                      }
                      placeholder="Enter your device key"
                      autoComplete="off"
                      autoFocus
                      className="
                        input-field
                        h-12
                        font-mono
                        tracking-wide
                      "
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      !deviceKey.trim() || isLoading
                    }
                    className="
                      flex h-12 w-full
                      items-center justify-center
                      rounded-xl
                      bg-primary
                      px-4
                      text-sm font-semibold
                      text-primary-foreground
                      shadow-sm
                      transition-all
                      hover:bg-primary/90
                      active:scale-[0.99]
                      disabled:pointer-events-none
                      disabled:opacity-50
                    "
                  >
                    {isLoading ? (
                      "Connecting..."
                    ) : (
                      <>
                        Connect Device
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security notice */}
                <div
                  className="
                    mt-7
                    flex items-start gap-3
                    rounded-xl
                    border border-border
                    bg-muted/40
                    p-4
                  "
                >
                  <ShieldCheck
                    className="
                      mt-0.5 h-4 w-4
                      shrink-0
                      text-primary
                    "
                  />

                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Device-based access
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs leading-5
                        text-muted-foreground
                      "
                    >
                      This key will be stored on this
                      device so you don&apos;t need to enter it
                      every time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="
                px-6 pb-5
                text-center
                text-xs
                text-muted-foreground
              "
            >
              Scanner device setup
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex items-center gap-4
        rounded-xl
        border border-primary-foreground/10
        bg-primary-foreground/[0.06]
        p-3
        backdrop-blur-sm
        transition-colors
        hover:bg-primary-foreground/[0.09]
      "
    >
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg
          bg-primary-foreground/10
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-primary-foreground/70">
          {description}
        </p>
      </div>
    </div>
  );
}