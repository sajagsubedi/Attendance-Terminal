import type { Metadata, Viewport } from "next";
import { Geist_Mono, Geist } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { InstallAppButton } from "@/components/InstallAppButton";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atd.sajagsubedi.com.np"),

  title: {
    default: "ATD",
    template: "%s | ATD",
  },

  description:
    "ATD is the terminal for barcode scanning",

  applicationName: "ATD",

  keywords: [
    "ATD",
    "smart classroom",
    "school management",
    "smart attendance",
    "classroom attendance",
    "school attendance",
    "classroom display",
  ],

  authors: [
    {
      name: "ATD",
    },
  ],

  creator: "ATD",
  publisher: "ATD",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/icons/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icons/icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  manifest: "/manifest.webmanifest",

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",

  colorScheme: "light dark",

  width: "device-width",

  initialScale: 1,

  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        geist.variable,
        "font-sans",
      )}
    >
      <body
        className="
          min-h-full
          flex flex-col
          bg-background
          text-foreground
          font-sans
        "
      >
        <ThemeProvider>
          {children}
          <InstallAppButton />
        </ThemeProvider>

      </body>
    </html >
  );
}